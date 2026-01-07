import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from '@rm/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RestaurantRolesGuard } from '../../auth/guards/restaurant-roles.guard';
import { RestaurantRoles } from '../../auth/decorators/restaurant-roles.decorator';

@ApiTags('Products')
@Controller('menu/:restaurantId/:menuId/categories/:categoryId/products')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products in a category' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  async getAll(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.getAll(restaurantId, menuId, categoryId);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get a specific product' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async getOne(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
    @Param('productId') productId: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.getOne(restaurantId, menuId, categoryId, productId);
  }

  @Post()
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async create(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
    @Body() createProductDto: CreateProductDto,
    @Req() req: any,
  ): Promise<ProductResponseDto> {
    return this.productsService.create(restaurantId, menuId, categoryId, createProductDto);
  }

  @Put(':productId')
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async update(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: any,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(restaurantId, menuId, categoryId, productId, updateProductDto);
  }

  @Delete(':productId')
  @UseGuards(RestaurantRolesGuard)
  @RestaurantRoles('owner', 'manager')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async delete(
    @Param('restaurantId') restaurantId: string,
    @Param('menuId') menuId: string,
    @Param('categoryId') categoryId: string,
    @Param('productId') productId: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    return this.productsService.delete(restaurantId, menuId, categoryId, productId);
  }
}

@ApiTags('Products Direct Access')
@Controller('menu/:restaurantId/products')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ProductsDirectController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('search/:searchTerm')
  @ApiOperation({ summary: 'Search products by name across all menus and categories' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  async searchProducts(
    @Param('restaurantId') restaurantId: string,
    @Param('searchTerm') searchTerm: string,
  ): Promise<ProductResponseDto[]> {
    return this.productsService.searchProducts(restaurantId, searchTerm);
  }

  @Get(':productId')
  @ApiOperation({ summary: 'Get product by ID directly (for internal use)' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async getProductById(
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
  ): Promise<ProductResponseDto> {
    return this.productsService.getProductById(restaurantId, productId);
  }
} 