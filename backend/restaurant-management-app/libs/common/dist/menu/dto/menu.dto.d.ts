export declare class CreateMenuDto {
    name: string;
    description?: string;
    isActive?: boolean;
    currency?: string;
    language?: string;
}
export declare class UpdateMenuDto extends CreateMenuDto {
}
export declare class MenuResponseDto {
    _id: string;
    restaurantId: string;
    name: string;
    description?: string;
    isActive: boolean;
    currency: string;
    language: string;
    lastUpdatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=menu.dto.d.ts.map