export declare class NutritionInfoDto {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
}
export declare class CreateProductDto {
    restaurantId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    imageUrl?: string;
    allergens?: string[];
    status?: 'active' | 'archived';
    ingredients?: string[];
    weight?: number;
    nutrition?: NutritionInfoDto;
}
export declare class UpdateProductDto {
    categoryId?: string;
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    allergens?: string[];
    status?: 'active' | 'archived';
    ingredients?: string[];
    weight?: number;
    nutrition?: NutritionInfoDto;
}
export declare class ProductResponseDto {
    _id: string;
    restaurantId: string;
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    imageUrl?: string;
    allergens?: string[];
    status: 'active' | 'archived';
    ingredients?: string[];
    weight?: number;
    nutrition?: NutritionInfoDto;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=product.dto.d.ts.map