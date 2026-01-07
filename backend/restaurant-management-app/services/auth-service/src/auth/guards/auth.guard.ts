import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from '@rm/common';
import { UsersService } from '../../../src/users/users.service';
import { User } from '../schemas/user.schema';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.['jwt'];
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.jwtService.verifyAsync<AuthDto.UserDto>(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      const user = await this.usersService.findOneById(payload.id);
      if (!user) throw new UnauthorizedException();
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

export type AuthRequest = Request & { user: User };
