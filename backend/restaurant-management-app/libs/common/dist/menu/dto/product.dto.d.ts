export declare class NutritionDto {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
}
export declare class CreateProductDto {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    imageUrl?: string;
    allergens?: string[];
    status?: 'active' | 'archived';
    ingredients?: string[];
    weight?: number;
    nutrition?: NutritionDto;
}
export declare class UpdateProductDto extends CreateProductDto {
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
    weight?: string;
    nutrition?: NutritionDto;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=product.dto.d.ts.map