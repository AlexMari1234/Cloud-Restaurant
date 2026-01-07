import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from '../services/menu.service';
import { CreateMenuDto, UpdateMenuDto, MenuResponseDto } from '@rm/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RestaurantRolesGuard } from '../../auth/guards/restaurant-roles.guard';
import { RestaurantRoles } from '../../auth/decorators/restaurant-roles.decorator';

@ApiTags('Menu')
@Controller('menu/:restaurantId')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Get all menus for a restaurant' })
  @ApiResponse({ status: 200, type: [MenuResponseDto] })
  async getMenus(
    @Param('restaurantId') restaurantId: string,
  ): Promise<MenuResponseDto[]> {
    return this.menuService.getMenus(restaurantId);
  }

  @Get(':menuId')
  @ApiOperation({ summary: 'Get a specific menu' })
  @ApiResponse({ status: 200, type: MenuResponseDto })
  async getMenu(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
  ): Promise<MenuResponseDto> {
    return this.menuService.getMenu(restaurantId, menuId);
  }

  @Post()
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Create a new menu for restaurant' })
  @ApiResponse({ status: 201, type: MenuResponseDto })
  async createMenu(
    @Param('restaurantId') restaurantId: string,
    @Body() createMenuDto: CreateMenuDto,
    @Req() req: any,
  ): Promise<MenuResponseDto> {
    return this.menuService.createMenu(restaurantId, createMenuDto, req.user);
  }

  @Put(':menuId')
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Update a specific menu' })
  @ApiResponse({ status: 200, type: MenuResponseDto })
  async updateMenu(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @Req() req: any,
  ): Promise<MenuResponseDto> {
    return this.menuService.updateMenu(restaurantId, menuId, updateMenuDto, req.user);
  }

  @Delete(':menuId')
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Delete a specific menu' })
  @ApiResponse({ status: 200, description: 'Menu deleted successfully' })
  async deleteMenu(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    return this.menuService.deleteMenu(restaurantId, menuId, req.user);
  }
} 