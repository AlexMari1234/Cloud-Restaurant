export declare class CreateCategoryDto {
    restaurantId: string;
    name: string;
    parentId?: string;
    sortOrder?: number;
    type: 'products' | 'subcategories';
}
export declare class UpdateCategoryDto {
    name?: string;
    parentId?: string;
    sortOrder?: number;
    type?: 'products' | 'subcategories';
}
export declare class CategoryResponseDto {
    _id: string;
    restaurantId: string;
    name: string;
    parentId?: string;
    sortOrder?: number;
    type: 'products' | 'subcategories';
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=category.dto.d.ts.map