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
exports.MenuController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const menu_service_1 = require("../services/menu.service");
const common_2 = require("@rm/common");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const restaurant_roles_guard_1 = require("../../auth/guards/restaurant-roles.guard");
const restaurant_roles_decorator_1 = require("../../auth/decorators/restaurant-roles.decorator");
let MenuController = class MenuController {
    menuService;
    constructor(menuService) {
        this.menuService = menuService;
    }
    async getMenus(restaurantId) {
        return this.menuService.getMenus(restaurantId);
    }
    async getMenu(restaurantId, menuId) {
        return this.menuService.getMenu(restaurantId, menuId);
    }
    async createMenu(restaurantId, createMenuDto, req) {
        return this.menuService.createMenu(restaurantId, createMenuDto, req.user);
    }
    async updateMenu(restaurantId, menuId, updateMenuDto, req) {
        return this.menuService.updateMenu(restaurantId, menuId, updateMenuDto, req.user);
    }
    async deleteMenu(restaurantId, menuId, req) {
        return this.menuService.deleteMenu(restaurantId, menuId, req.user);
    }
};
exports.MenuController = MenuController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all menus for a restaurant' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [common_2.MenuResponseDto] }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getMenus", null);
__decorate([
    (0, common_1.Get)(':menuId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific menu' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: common_2.MenuResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "getMenu", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new menu for restaurant' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: common_2.MenuResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.CreateMenuDto, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "createMenu", null);
__decorate([
    (0, common_1.Put)(':menuId'),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a specific menu' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: common_2.MenuResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.UpdateMenuDto, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "updateMenu", null);
__decorate([
    (0, common_1.Delete)(':menuId'),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a specific menu' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Menu deleted successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MenuController.prototype, "deleteMenu", null);
exports.MenuController = MenuController = __decorate([
    (0, swagger_1.ApiTags)('Menu'),
    (0, common_1.Controller)('menu/:restaurantId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [menu_service_1.MenuService])
], MenuController);
//# sourceMappingURL=menu.controller.js.map