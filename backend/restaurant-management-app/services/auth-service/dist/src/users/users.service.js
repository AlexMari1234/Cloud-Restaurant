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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let UsersService = class UsersService {
    userModel;
    httpService;
    constructor(userModel, httpService) {
        this.userModel = userModel;
        this.httpService = httpService;
    }
    async findOneByEmail(email) {
        return this.userModel.findOne({ email });
    }
    async findOneById(id) {
        return this.userModel.findById(id);
    }
    async create(user) {
        return this.userModel.create(user);
    }
    async update(id, user) {
        return this.userModel.findByIdAndUpdate(id, user, { new: true });
    }
    async updateLastLoginAt(userId) {
        await this.userModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
    }
    async promoteUserRole(userId, role) {
        return this.userModel.findByIdAndUpdate(userId, { role, status: 'active' }, { new: true });
    }
    async disableUser(userId) {
        return this.userModel.findByIdAndUpdate(userId, { status: 'disabled' }, { new: true });
    }
    async findActiveManagers() {
        return this.userModel.find({
            role: 'manager',
            status: 'active'
        }).select('-passwordHash');
    }
    async findAll() {
        return this.userModel.find().select('-passwordHash').exec();
    }
    async findById(id) {
        return this.userModel.findById(id).select('-passwordHash').exec();
    }
    async getUserProfile(userId) {
        const user = await this.userModel.findById(userId).select('-passwordHash').exec();
        if (!user) {
            throw new Error('User not found');
        }
        let orders = [];
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://menu-order-service:3003/users/${userId}/orders`));
            orders = response.data;
        }
        catch (error) {
            console.log('Could not fetch orders:', error.message);
        }
        return {
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                username: user.username,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
                lastLoginAt: user.lastLoginAt,
            },
            orders: orders,
            stats: {
                totalOrders: orders.length,
                completedOrders: orders.filter((order) => ['DELIVERED', 'COMPLETED', 'PICKED_UP'].includes(order.status)).length,
                pendingOrders: orders.filter((order) => ['PENDING', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY_FOR_DELIVERY', 'IN_DELIVERY'].includes(order.status)).length,
            }
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        axios_1.HttpService])
], UsersService);
//# sourceMappingURL=users.service.js.map