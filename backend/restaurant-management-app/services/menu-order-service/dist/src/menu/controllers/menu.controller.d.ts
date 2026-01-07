import { MenuService } from '../services/menu.service';
import { CreateMenuDto, UpdateMenuDto, MenuResponseDto } from '@rm/common';
export declare class MenuController {
    private readonly menuService;
    constructor(menuService: MenuService);
    getMenus(restaurantId: string): Promise<MenuResponseDto[]>;
    getMenu(restaurantId: string, menuId: string): Promise<MenuResponseDto>;
    createMenu(restaurantId: string, createMenuDto: CreateMenuDto, req: any): Promise<MenuResponseDto>;
    updateMenu(restaurantId: string, menuId: string, updateMenuDto: UpdateMenuDto, req: any): Promise<MenuResponseDto>;
    deleteMenu(restaurantId: string, menuId: string, req: any): Promise<{
        message: string;
    }>;
}
