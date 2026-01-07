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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_service_1 = require("../services/categories.service");
const common_2 = require("@rm/common");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const restaurant_roles_guard_1 = require("../../auth/guards/restaurant-roles.guard");
const restaurant_roles_decorator_1 = require("../../auth/decorators/restaurant-roles.decorator");
let CategoriesController = class CategoriesController {
    categoriesService;
    constructor(categoriesService) {
        this.categoriesService = categoriesService;
    }
    async getAll(restaurantId, menuId) {
        return this.categoriesService.getAll(restaurantId, menuId);
    }
    async getMainCategories(restaurantId, menuId) {
        return this.categoriesService.getMainCategories(restaurantId, menuId);
    }
    async getOne(restaurantId, menuId, categoryId) {
        return this.categoriesService.getOne(restaurantId, menuId, categoryId);
    }
    async getSubcategories(restaurantId, menuId, categoryId) {
        return this.categoriesService.getSubcategories(restaurantId, menuId, categoryId);
    }
    async create(restaurantId, menuId, createCategoryDto, req) {
        return this.categoriesService.create(restaurantId, menuId, createCategoryDto, req.user);
    }
    async createSubcategory(restaurantId, menuId, categoryId, createCategoryDto, req) {
        return this.categoriesService.createSubcategory(restaurantId, menuId, categoryId, createCategoryDto, req.user);
    }
    async update(restaurantId, menuId, categoryId, updateCategoryDto, req) {
        return this.categoriesService.update(restaurantId, menuId, categoryId, updateCategoryDto, req.user);
    }
    async delete(restaurantId, menuId, categoryId, req) {
        return this.categoriesService.delete(restaurantId, menuId, categoryId, req.user);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all categories for a menu' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [common_2.CategoryResponseDto] }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('main'),
    (0, swagger_1.ApiOperation)({ summary: 'Get only main categories (parentId is null)' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: [common_2.CategoryResponseDto] }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getMainCategories", null);
__decorate([
    (0, common_1.Get)(':categoryId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific category' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: common_2.CategoryResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)(':categoryId/subcategories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all subcategories for a category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all subcategories', type: [common_2.CategoryResponseDto] }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getSubcategories", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new category' }),
    (0, swagger_1.ApiResponse)({ status: 201, type: common_2.CategoryResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.CreateCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':categoryId/subcategories'),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new subcategory' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Subcategory created successfully', type: common_2.CategoryResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, common_2.CreateCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "createSubcategory", null);
__decorate([
    (0, common_1.Put)(':categoryId'),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a category' }),
    (0, swagger_1.ApiResponse)({ status: 200, type: common_2.CategoryResponseDto }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __param(3, (0, common_1.Body)()),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, common_2.UpdateCategoryDto, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':categoryId'),
    (0, common_1.UseGuards)(restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a category' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Category deleted successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('menuId')),
    __param(2, (0, common_1.Param)('categoryId')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "delete", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('Categories'),
    (0, common_1.Controller)('menu/:restaurantId/:menuId/categories'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map