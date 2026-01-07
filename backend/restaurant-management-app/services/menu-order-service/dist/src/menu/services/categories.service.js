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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const category_schema_1 = require("../schemas/category.schema");
const menu_schema_1 = require("../schemas/menu.schema");
const axios_1 = require("@nestjs/axios");
let CategoriesService = class CategoriesService {
    categoryModel;
    menuModel;
    httpService;
    constructor(categoryModel, menuModel, httpService) {
        this.categoryModel = categoryModel;
        this.menuModel = menuModel;
        this.httpService = httpService;
    }
    async toResponseDto(doc) {
        const response = {
            _id: doc._id.toString(),
            restaurantId: doc.restaurantId.toString(),
            menuId: doc.menuId.toString(),
            name: doc.name,
            parentId: doc.parentId?.toString(),
            sortOrder: doc.sortOrder ?? 0,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            type: doc.type,
        };
        return response;
    }
    async verifyMenuExists(restaurantId, menuId) {
        const menu = await this.menuModel.findOne({
            _id: new mongoose_2.Types.ObjectId(menuId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!menu) {
            throw new common_1.NotFoundException('Menu not found');
        }
        return menu;
    }
    async getAll(restaurantId, menuId) {
        await this.verifyMenuExists(restaurantId, menuId);
        const categories = await this.categoryModel
            .find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId)
        })
            .sort({ sortOrder: 1, name: 1 })
            .exec();
        return Promise.all(categories.map(cat => this.toResponseDto(cat)));
    }
    async getMainCategories(restaurantId, menuId) {
        await this.verifyMenuExists(restaurantId, menuId);
        const mainCategories = await this.categoryModel
            .find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
            parentId: null
        })
            .sort({ sortOrder: 1, name: 1 })
            .exec();
        return Promise.all(mainCategories.map(cat => this.toResponseDto(cat)));
    }
    async getOne(restaurantId, menuId, categoryId) {
        await this.verifyMenuExists(restaurantId, menuId);
        const category = await this.categoryModel.findOne({
            _id: new mongoose_2.Types.ObjectId(categoryId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return this.toResponseDto(category);
    }
    async create(restaurantId, menuId, dto, user) {
        await this.verifyMenuExists(restaurantId, menuId);
        const existingCategory = await this.categoryModel.findOne({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
            name: dto.name,
        });
        if (existingCategory) {
            throw new common_1.BadRequestException('A category with this name already exists');
        }
        if (dto.parentId) {
            const parentCategory = await this.categoryModel.findOne({
                _id: new mongoose_2.Types.ObjectId(dto.parentId),
                restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
                menuId: new mongoose_2.Types.ObjectId(menuId),
            });
            if (!parentCategory) {
                throw new common_1.BadRequestException('Parent category not found');
            }
        }
        const { type, ...rest } = dto;
        const category = await this.categoryModel.create({
            ...rest,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
            parentId: dto.parentId ? new mongoose_2.Types.ObjectId(dto.parentId) : null,
            type,
        });
        return this.toResponseDto(category);
    }
    async update(restaurantId, menuId, categoryId, dto, user) {
        await this.verifyMenuExists(restaurantId, menuId);
        const existingCategory = await this.categoryModel.findOne({
            _id: new mongoose_2.Types.ObjectId(categoryId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
        });
        if (!existingCategory) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (dto.name && dto.name !== existingCategory.name) {
            const duplicateCategory = await this.categoryModel.findOne({
                restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
                menuId: new mongoose_2.Types.ObjectId(menuId),
                name: dto.name,
                _id: { $ne: new mongoose_2.Types.ObjectId(categoryId) },
            });
            if (duplicateCategory) {
                throw new common_1.BadRequestException('A category with this name already exists');
            }
        }
        if (dto.parentId && dto.parentId !== existingCategory.parentId?.toString()) {
            if (dto.parentId === categoryId) {
                throw new common_1.BadRequestException('A category cannot be its own parent');
            }
            const parentCategory = await this.categoryModel.findOne({
                _id: new mongoose_2.Types.ObjectId(dto.parentId),
                restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
                menuId: new mongoose_2.Types.ObjectId(menuId),
            });
            if (!parentCategory) {
                throw new common_1.BadRequestException('Parent category not found');
            }
            let current = parentCategory;
            while (current?.parentId) {
                if (current.parentId.toString() === categoryId) {
                    throw new common_1.BadRequestException('Circular reference detected in category hierarchy');
                }
                current = await this.categoryModel.findById(current.parentId);
                if (!current)
                    break;
            }
        }
        const { type: updateType, ...updateRest } = dto;
        const updatedCategory = await this.categoryModel.findByIdAndUpdate(categoryId, {
            ...updateRest,
            parentId: dto.parentId ? new mongoose_2.Types.ObjectId(dto.parentId) : null,
            ...(updateType !== undefined ? { type: updateType } : {}),
        }, { new: true });
        if (!updatedCategory) {
            throw new common_1.NotFoundException('Category not found');
        }
        return this.toResponseDto(updatedCategory);
    }
    async delete(restaurantId, menuId, categoryId, user) {
        await this.verifyMenuExists(restaurantId, menuId);
        const category = await this.categoryModel.findOne({
            _id: new mongoose_2.Types.ObjectId(categoryId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        const hasSubcategories = await this.categoryModel.exists({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            parentId: new mongoose_2.Types.ObjectId(categoryId),
        });
        if (hasSubcategories) {
            throw new common_1.BadRequestException('Cannot delete category with subcategories');
        }
        await this.categoryModel.findByIdAndDelete(categoryId);
        return { message: 'Category deleted successfully' };
    }
    async getSubcategories(restaurantId, menuId, parentCategoryId) {
        await this.verifyMenuExists(restaurantId, menuId);
        const parentCategory = await this.categoryModel.findOne({
            _id: new mongoose_2.Types.ObjectId(parentCategoryId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
        });
        if (!parentCategory) {
            throw new common_1.NotFoundException('Parent category not found');
        }
        const subcategories = await this.categoryModel
            .find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
            parentId: new mongoose_2.Types.ObjectId(parentCategoryId),
        })
            .sort({ sortOrder: 1, name: 1 })
            .exec();
        return Promise.all(subcategories.map(cat => this.toResponseDto(cat)));
    }
    async createSubcategory(restaurantId, menuId, parentCategoryId, dto, user) {
        await this.verifyMenuExists(restaurantId, menuId);
        const parentCategory = await this.categoryModel.findOne({
            _id: new mongoose_2.Types.ObjectId(parentCategoryId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
        });
        if (!parentCategory) {
            throw new common_1.NotFoundException('Parent category not found');
        }
        const existingCategory = await this.categoryModel.findOne({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
            parentId: new mongoose_2.Types.ObjectId(parentCategoryId),
            name: dto.name,
        });
        if (existingCategory) {
            throw new common_1.BadRequestException('A subcategory with this name already exists in this category');
        }
        const { type: subType, ...subRest } = dto;
        const category = await this.categoryModel.create({
            ...subRest,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
            parentId: new mongoose_2.Types.ObjectId(parentCategoryId),
            sortOrder: dto.sortOrder || 0,
            type: subType,
        });
        return this.toResponseDto(category);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(1, (0, mongoose_1.InjectModel)(menu_schema_1.Menu.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        axios_1.HttpService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map