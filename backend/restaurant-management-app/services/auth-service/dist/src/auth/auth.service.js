"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const pending_role_requests_service_1 = require("../pending-role-requests/pending-role-requests.service");
const bcrypt = require("bcryptjs");
function toUserDto(user) {
    return {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status,
        requestedRole: user.requestedRole,
    };
}
let AuthService = class AuthService {
    usersService;
    pendingRoleRequestsService;
    jwtService;
    constructor(usersService, pendingRoleRequestsService, jwtService) {
        this.usersService = usersService;
        this.pendingRoleRequestsService = pendingRoleRequestsService;
        this.jwtService = jwtService;
    }
    async signUp(dto) {
        try {
            const hashedPassword = await bcrypt.hash(dto.password, 10);
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
                await this.pendingRoleRequestsService.createPendingRequest(user._id.toString(), requestedRole);
            }
            const userDto = toUserDto(user);
            const token = await this.jwtService.signAsync(userDto);
            return [token, userDto];
        }
        catch (error) {
            if (error.code === 11000) {
                if (error.keyPattern?.email) {
                    throw new common_1.ConflictException('Email already exists');
                }
                if (error.keyPattern?.username) {
                    throw new common_1.ConflictException('Username already exists');
                }
                throw new common_1.ConflictException('User already exists');
            }
            if (error.name === 'ValidationError') {
                throw new common_1.BadRequestException('Invalid user data');
            }
            throw error;
        }
    }
    async signIn(dto) {
        const user = await this.usersService.findOneByEmail(dto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === 'deleted') {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        await this.usersService.updateLastLoginAt(user._id.toString());
        const userDto = toUserDto(user);
        const token = await this.jwtService.signAsync(userDto);
        return [token, userDto];
    }
    async userExists(email) {
        return (await this.usersService.findOneByEmail(email)) !== null;
    }
    async getUserByEmail(email) {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            userId: user._id.toString(),
            email: user.email,
            firstName: user.name.split(' ')[0] || undefined,
            lastName: user.name.split(' ').slice(1).join(' ') || undefined,
        };
    }
    async getActiveManagers() {
        const managers = await this.usersService.findActiveManagers();
        return managers.map((manager) => toUserDto(manager));
    }
    async getUserById(id) {
        const user = await this.usersService.findOneById(id);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return toUserDto(user);
    }
    async getAllUsers() {
        const users = await this.usersService.findAll();
        return users.map((user) => toUserDto(user));
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        pending_role_requests_service_1.PendingRoleRequestsService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map