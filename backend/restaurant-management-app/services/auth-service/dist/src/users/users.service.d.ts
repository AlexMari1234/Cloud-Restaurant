import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { HttpService } from '@nestjs/axios';
export declare class UsersService {
    private readonly userModel;
    private readonly httpService;
    constructor(userModel: Model<UserDocument>, httpService: HttpService);
    findOneByEmail(email: string): Promise<User | null>;
    findOneById(id: string): Promise<User | null>;
    create(user: Partial<User>): Promise<User>;
    update(id: string, user: Partial<User>): Promise<User | null>;
    updateLastLoginAt(userId: string): Promise<void>;
    promoteUserRole(userId: string, role: 'manager' | 'employee'): Promise<User | null>;
    disableUser(userId: string): Promise<User | null>;
    findActiveManagers(): Promise<User[]>;
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any | null>;
    getUserProfile(userId: string): Promise<any>;
}
