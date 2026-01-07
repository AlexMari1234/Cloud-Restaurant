import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PendingRoleRequestsService } from '../pending-role-requests/pending-role-requests.service';
import { User } from '../users/schemas/user.schema';
import { Types } from 'mongoose';
import { AuthDto, UserIdResponseDto } from '@rm/common';
import * as bcrypt from 'bcryptjs';

function toUserDto(user: User): AuthDto.UserDto {
  return {
    id: (user._id as Types.ObjectId).toString(),
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    status: user.status,
    requestedRole: user.requestedRole,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly pendingRoleRequestsService: PendingRoleRequestsService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(dto: AuthDto.UserRegisterDTO): Promise<[string, AuthDto.UserDto]> {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Clean up requestedRole - don't pass empty string
      const requestedRole = dto.requestedRole && dto.requestedRole.trim() !== '' ? dto.requestedRole : undefined;

      const user = await this.usersService.create({
        username: dto.username,
        email: dto.email,
        passwordHash: hashedPassword,
        name: dto.name,
        role: 'client',
        status: requestedRole ? 'pending' : 'active',
        requestedRole: requestedRole,
      });

      if (requestedRole) {
        await this.pendingRoleRequestsService.createPendingRequest(
          (user._id as Types.ObjectId).toString(),
          requestedRole,
        );
      }

      const userDto = toUserDto(user);
      const token = await this.jwtService.signAsync(userDto);
      return [token, userDto];
    } catch (error: any) {
      if (error.code === 11000) {
        // MongoDB duplicate key error
        if (error.keyPattern?.email) {
          throw new ConflictException('Email already exists');
        }
        if (error.keyPattern?.username) {
          throw new ConflictException('Username already exists');
        }
        throw new ConflictException('User already exists');
      }
      
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Invalid user data');
      }
      
      throw error;
    }
  }

  async signIn(dto: AuthDto.LoginDTO): Promise<[string, AuthDto.UserDto]> {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Block deleted users completely - they cannot login
    if (user.status === 'deleted') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Allow active, pending, and disabled users to login
    // Disabled users will be redirected to rejection page in frontend
    await this.usersService.updateLastLoginAt(
      (user._id as Types.ObjectId).toString(),
    );

    const userDto = toUserDto(user);
    const token = await this.jwtService.signAsync(userDto);
    return [token, userDto];
  }

  async userExists(email: string): Promise<boolean> {
    return (await this.usersService.findOneByEmail(email)) !== null;
  }

  async getUserByEmail(email: string): Promise<UserIdResponseDto> {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    // firstName/lastName nu există în schema, doar pentru compatibilitate API
    return {
      userId: (user._id as Types.ObjectId).toString(),
      email: user.email,
      firstName: user.name.split(' ')[0] || undefined,
      lastName: user.name.split(' ').slice(1).join(' ') || undefined,
    };
  }

  async getActiveManagers(): Promise<AuthDto.UserDto[]> {
    const managers = await this.usersService.findActiveManagers();
    return managers.map((manager: User) => toUserDto(manager));
  }

  async getUserById(id: string): Promise<AuthDto.UserDto> {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return toUserDto(user);
  }

  async getAllUsers(): Promise<AuthDto.UserDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user: User) => toUserDto(user));
  }
}
