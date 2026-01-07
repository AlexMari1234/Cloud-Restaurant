import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '@rm/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RestaurantRolesGuard } from '../../auth/guards/restaurant-roles.guard';
import { RestaurantRoles } from '../../auth/decorators/restaurant-roles.decorator';

@ApiTags('Categories')
@Controller('menu/:restaurantId/:menuId/categories')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories for a menu' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async getAll(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getAll(restaurantId, menuId);
  }

  @Get('main')
  @ApiOperation({ summary: 'Get only main categories (parentId is null)' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async getMainCategories(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getMainCategories(restaurantId, menuId);
  }

  @Get(':categoryId')
  @ApiOperation({ summary: 'Get a specific category' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  async getOne(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.getOne(restaurantId, menuId, categoryId);
  }

  @Get(':categoryId/subcategories')
  @ApiOperation({ summary: 'Get all subcategories for a category' })
  @ApiResponse({ status: 200, description: 'Returns all subcategories', type: [CategoryResponseDto] })
  async getSubcategories(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.getSubcategories(restaurantId, menuId, categoryId);
  }

  @Post()
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, type: CategoryResponseDto })
  async create(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: any,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.create(restaurantId, menuId, createCategoryDto, req.user);
  }

  @Post(':categoryId/subcategories')
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Create a new subcategory' })
  @ApiResponse({ status: 201, description: 'Subcategory created successfully', type: CategoryResponseDto })
  async createSubcategory(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
    @Body() createCategoryDto: CreateCategoryDto,
    @Req() req: any,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.createSubcategory(restaurantId, menuId, categoryId, createCategoryDto, req.user);
  }

  @Put(':categoryId')
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, type: CategoryResponseDto })
  async update(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: any,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(restaurantId, menuId, categoryId, updateCategoryDto, req.user);
  }

  @Delete(':categoryId')
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  async delete(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    return this.categoriesService.delete(restaurantId, menuId, categoryId, req.user);
  }
} 