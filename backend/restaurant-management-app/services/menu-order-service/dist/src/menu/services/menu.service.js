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
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const menu_schema_1 = require("../schemas/menu.schema");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const core_1 = require("@nestjs/core");
const common_2 = require("@nestjs/common");
let MenuService = class MenuService {
    menuModel;
    httpService;
    request;
    constructor(menuModel, httpService, request) {
        this.menuModel = menuModel;
        this.httpService = httpService;
        this.request = request;
    }
    getAuthHeaders() {
        const authHeader = this.request.headers['authorization'];
        const jwtFromCookie = this.request.cookies?.jwt;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : jwtFromCookie;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
    async toResponseDto(doc) {
        const response = {
            _id: doc._id.toString(),
            restaurantId: doc.restaurantId.toString(),
            name: doc.name,
            description: doc.description,
            isActive: doc.isActive,
            currency: doc.currency || 'RON',
            language: doc.language || 'ro',
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        };
        return response;
    }
    async verifyRestaurantExists(restaurantId) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://restaurant-service:3001/restaurants/${restaurantId}`, { headers: this.getAuthHeaders() }));
            if (!response.data) {
                throw new common_1.NotFoundException('Restaurant not found');
            }
            return response.data;
        }
        catch (error) {
            console.error('Error verifying restaurant:', error.response?.data || error.message);
            if (error.response?.status === 404) {
                throw new common_1.NotFoundException('Restaurant not found');
            }
            throw new common_1.BadRequestException('Could not verify restaurant');
        }
    }
    async getMenus(restaurantId) {
        await this.verifyRestaurantExists(restaurantId);
        const menus = await this.menuModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        }).sort({ createdAt: -1 });
        return Promise.all(menus.map(menu => this.toResponseDto(menu)));
    }
    async getMenu(restaurantId, menuId) {
        await this.verifyRestaurantExists(restaurantId);
        const menu = await this.menuModel.findOne({
            _id: new mongoose_2.Types.ObjectId(menuId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!menu) {
            throw new common_1.NotFoundException('Menu not found');
        }
        return this.toResponseDto(menu);
    }
    async createMenu(restaurantId, dto, user) {
        await this.verifyRestaurantExists(restaurantId);
        const menu = await this.menuModel.create({
            ...dto,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            lastUpdatedBy: new mongoose_2.Types.ObjectId(user._id),
            currency: dto.currency || 'RON',
            language: dto.language || 'ro',
            isActive: dto.isActive ?? true,
        });
        return this.toResponseDto(menu);
    }
    async updateMenu(restaurantId, menuId, dto, user) {
        await this.verifyRestaurantExists(restaurantId);
        const menu = await this.menuModel.findOne({
            _id: new mongoose_2.Types.ObjectId(menuId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!menu) {
            throw new common_1.NotFoundException('Menu not found');
        }
        const updatedMenu = await this.menuModel.findByIdAndUpdate(menu._id, {
            ...dto,
            lastUpdatedBy: new mongoose_2.Types.ObjectId(user._id),
            currency: dto.currency || menu.currency || 'RON',
            language: dto.language || menu.language || 'ro',
        }, { new: true });
        if (!updatedMenu) {
            throw new common_1.NotFoundException('Menu not found');
        }
        return this.toResponseDto(updatedMenu);
    }
    async deleteMenu(restaurantId, menuId, user) {
        await this.verifyRestaurantExists(restaurantId);
        const menu = await this.menuModel.findOne({
            _id: new mongoose_2.Types.ObjectId(menuId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!menu) {
            throw new common_1.NotFoundException('Menu not found');
        }
        await this.menuModel.findByIdAndDelete(menu._id);
        return { message: 'Menu deleted successfully' };
    }
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(menu_schema_1.Menu.name)),
    __param(2, (0, common_2.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        axios_1.HttpService, Object])
], MenuService);
//# sourceMappingURL=menu.service.js.map