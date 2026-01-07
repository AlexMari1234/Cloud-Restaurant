import { AuthRequest } from '../auth/guards/auth.guard';
import { AuthDto } from '@rm/common';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    currentUser(request: AuthRequest): Promise<AuthDto.UserDto>;
    getUserProfile(request: AuthRequest): Promise<any>;
    getAllUsers(): Promise<any[]>;
    getUserById(id: string): Promise<any>;
}
