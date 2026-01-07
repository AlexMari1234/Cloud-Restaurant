import { Model } from 'mongoose';
import { MenuDocument } from '../schemas/menu.schema';
import { HttpService } from '@nestjs/axios';
import { CreateMenuDto, UpdateMenuDto, MenuResponseDto } from '@rm/common';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';
export declare class MenuService {
    private readonly menuModel;
    private readonly httpService;
    private readonly request;
    constructor(menuModel: Model<MenuDocument>, httpService: HttpService, request: AuthRequest);
    private getAuthHeaders;
    private toResponseDto;
    private verifyRestaurantExists;
    getMenus(restaurantId: string): Promise<MenuResponseDto[]>;
    getMenu(restaurantId: string, menuId: string): Promise<MenuResponseDto>;
    createMenu(restaurantId: string, dto: CreateMenuDto, user: any): Promise<MenuResponseDto>;
    updateMenu(restaurantId: string, menuId: string, dto: UpdateMenuDto, user: any): Promise<MenuResponseDto>;
    deleteMenu(restaurantId: string, menuId: string, user: any): Promise<{
        message: string;
    }>;
}
