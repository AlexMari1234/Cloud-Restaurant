export declare class CreateCategoryDto {
    name: string;
    parentId?: string;
    sortOrder?: number;
    type: 'products' | 'subcategories';
}
export declare class UpdateCategoryDto extends CreateCategoryDto {
}
export declare class CategoryResponseDto {
    _id: string;
    restaurantId: string;
    menuId: string;
    name: string;
    parentId?: string;
    sortOrder?: number;
    type: 'products' | 'subcategories';
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=category.dto.d.ts.map