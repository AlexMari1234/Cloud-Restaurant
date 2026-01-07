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
exports.ProductsDirectController = exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const products_service_1 = require("../services/products.service");
const common_2 = require("@rm/common");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const restaurant_roles_guard_1 = require("../../auth/guards/restaurant-roles.guard");
const restaurant_roles_decorator_1 = require("../../auth/decorators/restaurant-roles.decorator");
let ProductsController = class ProductsController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getAll(restaurantId, menuId, categoryId) {
        return this.productsService.getAll(restaurantId, menuId, categoryId);
    }
    async getOne(restaurantId, menuId, categoryId, productId) {
        return this.productsService.getOne(restaurantId, menuId, categoryId, productId);
    }
    async create(restaurantId, menuId, categoryId, createProductDto, req) {
        return this.productsService.create(restaurantId, menuId, categoryId, createProductDto);
    }
    async update(restaurantId, menuId, categoryId, productId, updateProductDto, req) {
        return this.productsService.update(restaurantId, menuId, categoryId, productId, updateProductDto);
    }
    async delete(restaurantId, menuId, categoryId, productId, req) {
        return this.productsService.delete(restaurantId, menuId, categoryId, productId);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all products in a category' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [common_2.ProductResponseDto] }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific product' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: common_2.ProductResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __param(3, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new product' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: common_2.ProductResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, common_2.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':productId'),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a product' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: common_2.ProductResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __param(3, (0, common_1.Param)('productId')),
    __param(4, (0, common_1.Body)()),
    __param(5, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, common_2.UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':productId'),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product deleted successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __param(3, (0, common_1.Param)('productId')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "delete", null);
exports.ProductsController = ProductsController = __decorate([
    (0, swagger_1.ApiTags)('Products'),
    (0, common_1.Controller)('menu/:restaurantId/:menuId/categories/:categoryId/products'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
let ProductsDirectController = class ProductsDirectController {
    productsService;
    constructor(productsService) {
        this.productsService = productsService;
    }
    async getProductById(restaurantId, productId) {
        return this.productsService.getProductById(restaurantId, productId);
    }
};
exports.ProductsDirectController = ProductsDirectController;
__decorate([
    (0, common_1.Get)(':productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product by ID directly (for internal use)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: common_2.ProductResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductsDirectController.prototype, "getProductById", null);
exports.ProductsDirectController = ProductsDirectController = __decorate([
    (0, swagger_1.ApiTags)('Products Direct Access'),
    (0, common_1.Controller)('menu/:restaurantId/products'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsDirectController);
//# sourceMappingURL=products.controller.js.map