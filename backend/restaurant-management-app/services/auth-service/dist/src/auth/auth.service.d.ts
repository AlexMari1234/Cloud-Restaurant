import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PendingRoleRequestsService } from '../pending-role-requests/pending-role-requests.service';
import { AuthDto, UserIdResponseDto } from '@rm/common';
export declare class AuthService {
    private readonly usersService;
    private readonly pendingRoleRequestsService;
    private readonly jwtService;
    constructor(usersService: UsersService, pendingRoleRequestsService: PendingRoleRequestsService, jwtService: JwtService);
    signUp(dto: AuthDto.UserRegisterDTO): Promise<[string, AuthDto.UserDto]>;
    signIn(dto: AuthDto.LoginDTO): Promise<[string, AuthDto.UserDto]>;
    userExists(email: string): Promise<boolean>;
    getUserByEmail(email: string): Promise<UserIdResponseDto>;
    getActiveManagers(): Promise<AuthDto.UserDto[]>;
    getUserById(id: string): Promise<AuthDto.UserDto>;
    getAllUsers(): Promise<AuthDto.UserDto[]>;
}
