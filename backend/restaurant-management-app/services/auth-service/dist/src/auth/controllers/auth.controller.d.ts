import { Response, Request } from 'express';
import { AuthService } from '../auth.service';
import { AuthRequest } from '../guards/auth.guard';
import { AuthDto, GetUserByEmailDto, UserIdResponseDto } from '@rm/common';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    constructor(authService: AuthService, jwtService: JwtService);
    register(dto: AuthDto.UserRegisterDTO, res: Response): Promise<AuthDto.UserDto>;
    login(dto: AuthDto.LoginDTO, res: Response): Promise<AuthDto.UserDto>;
    logout(res: Response): {
        message: string;
    };
    currentUser(req: AuthRequest): Promise<AuthDto.UserDto>;
    userExists(email: string): Promise<{
        value: boolean;
    }>;
    getUserByEmail(dto: GetUserByEmailDto): Promise<UserIdResponseDto>;
    verify(req: Request): Promise<AuthDto.UserDto>;
    getActiveManagers(): Promise<AuthDto.UserDto[]>;
    getUserById(id: string): Promise<AuthDto.UserDto>;
    getAllUsers(): Promise<AuthDto.UserDto[]>;
}
