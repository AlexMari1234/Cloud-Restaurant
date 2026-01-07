import { Model } from 'mongoose';
import { CategoryDocument } from '../schemas/category.schema';
import { MenuDocument } from '../schemas/menu.schema';
import { HttpService } from '@nestjs/axios';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '@rm/common';
export declare class CategoriesService {
    private readonly categoryModel;
    private readonly menuModel;
    private readonly httpService;
    constructor(categoryModel: Model<CategoryDocument>, menuModel: Model<MenuDocument>, httpService: HttpService);
    private toResponseDto;
    private verifyMenuExists;
    getAll(restaurantId: string, menuId: string): Promise<CategoryResponseDto[]>;
    getMainCategories(restaurantId: string, menuId: string): Promise<CategoryResponseDto[]>;
    getOne(restaurantId: string, menuId: string, categoryId: string): Promise<CategoryResponseDto>;
    create(restaurantId: string, menuId: string, dto: CreateCategoryDto, user: any): Promise<CategoryResponseDto>;
    update(restaurantId: string, menuId: string, categoryId: string, dto: UpdateCategoryDto, user: any): Promise<CategoryResponseDto>;
    delete(restaurantId: string, menuId: string, categoryId: string, user: any): Promise<{
        message: string;
    }>;
    getSubcategories(restaurantId: string, menuId: string, parentCategoryId: string): Promise<CategoryResponseDto[]>;
    createSubcategory(restaurantId: string, menuId: string, parentCategoryId: string, dto: CreateCategoryDto, user: any): Promise<CategoryResponseDto>;
}
