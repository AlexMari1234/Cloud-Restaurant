import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '@rm/common';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    getAll(restaurantId: string, menuId: string): Promise<CategoryResponseDto[]>;
    getMainCategories(restaurantId: string, menuId: string): Promise<CategoryResponseDto[]>;
    getOne(restaurantId: string, menuId: string, categoryId: string): Promise<CategoryResponseDto>;
    getSubcategories(restaurantId: string, menuId: string, categoryId: string): Promise<CategoryResponseDto[]>;
    create(restaurantId: string, menuId: string, createCategoryDto: CreateCategoryDto, req: any): Promise<CategoryResponseDto>;
    createSubcategory(restaurantId: string, menuId: string, categoryId: string, createCategoryDto: CreateCategoryDto, req: any): Promise<CategoryResponseDto>;
    update(restaurantId: string, menuId: string, categoryId: string, updateCategoryDto: UpdateCategoryDto, req: any): Promise<CategoryResponseDto>;
    delete(restaurantId: string, menuId: string, categoryId: string, req: any): Promise<{
        message: string;
    }>;
}
