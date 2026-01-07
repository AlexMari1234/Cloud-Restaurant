export declare class CreateMenuDto {
    restaurantId: string;
    name: string;
    description?: string;
    isActive?: boolean;
    currency?: string;
    language?: string;
}
export declare class UpdateMenuDto {
    name?: string;
    description?: string;
    isActive?: boolean;
    currency?: string;
    language?: string;
}
export declare class MenuResponseDto {
    _id: string;
    restaurantId: string;
    name: string;
    description?: string;
    isActive: boolean;
    currency?: string;
    language?: string;
    createdAt: Date;
    updatedAt: Date;
    lastUpdatedBy?: string;
}
//# sourceMappingURL=menu.dto.d.ts.map