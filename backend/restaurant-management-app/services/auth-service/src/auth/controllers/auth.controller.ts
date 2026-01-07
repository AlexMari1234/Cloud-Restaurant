import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../auth.service';
import { AuthGuard, AuthRequest } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { AuthDto, GetUserByEmailDto, UserIdResponseDto } from '@rm/common';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(
    @Body() dto: AuthDto.UserRegisterDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthDto.UserDto> {
    const [token, user] = await this.authService.signUp(dto);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return user;
  }

  @Post('login')
  async login(
    @Body() dto: AuthDto.LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthDto.UserDto> {
    const [token, user] = await this.authService.signIn(dto);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return user;
  }

  @Delete('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  async currentUser(@Req() req: AuthRequest): Promise<AuthDto.UserDto> {
    if (!req.user) {
      throw new UnauthorizedException('User not found in request');
    }

    return {
      id: req.user._id.toString(),
      email: req.user.email,
      username: req.user.username,
      name: req.user.name,
      role: req.user.role,
      status: req.user.status,
      requestedRole: req.user.requestedRole,
    };
  }

  @Get('user-exists/:email')
  async userExists(@Param('email') email: string) {
    const exists = await this.authService.userExists(email);
    return { value: exists };
  }

  @Post('get-user-by-email')
  async getUserByEmail(@Body() dto: GetUserByEmailDto): Promise<UserIdResponseDto> {
    return this.authService.getUserByEmail(dto.email);
  }

  @Get('verify')
  async verify(@Req() req: Request): Promise<AuthDto.UserDto> {
    const authHeader = req.headers.authorization;
    const jwtFromCookie = (req as any).cookies?.jwt;

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : jwtFromCookie;

    if (!token) {
      throw new UnauthorizedException('Missing or invalid token');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AuthDto.UserDto>(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get('managers')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('owner')
  async getActiveManagers() {
    return this.authService.getActiveManagers();
  }

  @Get('user-by-id/:id')
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Get('users')
  @UseGuards(AuthGuard)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }
}
