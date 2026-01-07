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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("../schemas/product.schema");
const category_schema_1 = require("../schemas/category.schema");
const menu_schema_1 = require("../schemas/menu.schema");
let ProductsService = class ProductsService {
    productModel;
    categoryModel;
    menuModel;
    constructor(productModel, categoryModel, menuModel) {
        this.productModel = productModel;
        this.categoryModel = categoryModel;
        this.menuModel = menuModel;
    }
    async toResponseDto(doc) {
        const response = {
            _id: doc._id.toString(),
            restaurantId: doc.restaurantId.toString(),
            categoryId: doc.categoryId.toString(),
            name: doc.name,
            description: doc.description,
            price: doc.price,
            currency: doc.currency,
            imageUrl: doc.imageUrl,
            allergens: doc.allergens,
            status: doc.status,
            ingredients: doc.ingredients,
            weight: doc.weight,
            nutrition: doc.nutrition,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
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
    async verifyCategoryExists(restaurantId, menuId, categoryId) {
        const category = await this.categoryModel.findOne({
            _id: new mongoose_2.Types.ObjectId(categoryId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            menuId: new mongoose_2.Types.ObjectId(menuId),
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async getAll(restaurantId, menuId, categoryId) {
        await this.verifyMenuExists(restaurantId, menuId);
        await this.verifyCategoryExists(restaurantId, menuId, categoryId);
        const products = await this.productModel
            .find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            categoryId: new mongoose_2.Types.ObjectId(categoryId)
        })
            .sort({ name: 1 })
            .exec();
        return Promise.all(products.map(prod => this.toResponseDto(prod)));
    }
    async getOne(restaurantId, menuId, categoryId, productId) {
        await this.verifyMenuExists(restaurantId, menuId);
        await this.verifyCategoryExists(restaurantId, menuId, categoryId);
        const product = await this.productModel.findOne({
            _id: new mongoose_2.Types.ObjectId(productId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            categoryId: new mongoose_2.Types.ObjectId(categoryId),
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return this.toResponseDto(product);
    }
    async getProductById(restaurantId, productId) {
        const product = await this.productModel.findOne({
            _id: new mongoose_2.Types.ObjectId(productId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return this.toResponseDto(product);
    }
    async create(restaurantId, menuId, categoryId, dto) {
        await this.verifyMenuExists(restaurantId, menuId);
        await this.verifyCategoryExists(restaurantId, menuId, categoryId);
        const existingProduct = await this.productModel.findOne({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            categoryId: new mongoose_2.Types.ObjectId(categoryId),
            name: dto.name,
        });
        if (existingProduct) {
            throw new common_1.BadRequestException('A product with this name already exists in this category');
        }
        const product = await this.productModel.create({
            ...dto,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            categoryId: new mongoose_2.Types.ObjectId(categoryId),
        });
        return this.toResponseDto(product);
    }
    async update(restaurantId, menuId, categoryId, productId, dto) {
        await this.verifyMenuExists(restaurantId, menuId);
        await this.verifyCategoryExists(restaurantId, menuId, categoryId);
        const existingProduct = await this.productModel.findOne({
            _id: new mongoose_2.Types.ObjectId(productId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            categoryId: new mongoose_2.Types.ObjectId(categoryId),
        });
        if (!existingProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (dto.name && dto.name !== existingProduct.name) {
            const duplicateProduct = await this.productModel.findOne({
                restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
                categoryId: new mongoose_2.Types.ObjectId(categoryId),
                name: dto.name,
                _id: { $ne: new mongoose_2.Types.ObjectId(productId) },
            });
            if (duplicateProduct) {
                throw new common_1.BadRequestException('A product with this name already exists in this category');
            }
        }
        const updatedProduct = await this.productModel.findByIdAndUpdate(productId, dto, { new: true });
        if (!updatedProduct) {
            throw new common_1.NotFoundException('Product not found');
        }
        return this.toResponseDto(updatedProduct);
    }
    async delete(restaurantId, menuId, categoryId, productId) {
        await this.verifyMenuExists(restaurantId, menuId);
        await this.verifyCategoryExists(restaurantId, menuId, categoryId);
        const product = await this.productModel.findOne({
            _id: new mongoose_2.Types.ObjectId(productId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            categoryId: new mongoose_2.Types.ObjectId(categoryId),
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        await this.productModel.findByIdAndDelete(productId);
        return { message: 'Product deleted successfully' };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __param(1, (0, mongoose_1.InjectModel)(category_schema_1.Category.name)),
    __param(2, (0, mongoose_1.InjectModel)(menu_schema_1.Menu.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map