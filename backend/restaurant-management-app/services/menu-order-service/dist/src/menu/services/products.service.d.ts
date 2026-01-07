import { Model } from 'mongoose';
import { ProductDocument } from '../schemas/product.schema';
import { CategoryDocument } from '../schemas/category.schema';
import { MenuDocument } from '../schemas/menu.schema';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from '@rm/common';
export declare class ProductsService {
    private readonly productModel;
    private readonly categoryModel;
    private readonly menuModel;
    constructor(productModel: Model<ProductDocument>, categoryModel: Model<CategoryDocument>, menuModel: Model<MenuDocument>);
    private toResponseDto;
    private verifyMenuExists;
    private verifyCategoryExists;
    getAll(restaurantId: string, menuId: string, categoryId: string): Promise<ProductResponseDto[]>;
    getOne(restaurantId: string, menuId: string, categoryId: string, productId: string): Promise<ProductResponseDto>;
    getProductById(restaurantId: string, productId: string): Promise<ProductResponseDto>;
    create(restaurantId: string, menuId: string, categoryId: string, dto: CreateProductDto): Promise<ProductResponseDto>;
    update(restaurantId: string, menuId: string, categoryId: string, productId: string, dto: UpdateProductDto): Promise<ProductResponseDto>;
    delete(restaurantId: string, menuId: string, categoryId: string, productId: string): Promise<{
        message: string;
    }>;
}
