import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from '@rm/common';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getAll(restaurantId: string, menuId: string, categoryId: string): Promise<ProductResponseDto[]>;
    getOne(restaurantId: string, menuId: string, categoryId: string, productId: string): Promise<ProductResponseDto>;
    create(restaurantId: string, menuId: string, categoryId: string, createProductDto: CreateProductDto, req: any): Promise<ProductResponseDto>;
    update(restaurantId: string, menuId: string, categoryId: string, productId: string, updateProductDto: UpdateProductDto, req: any): Promise<ProductResponseDto>;
    delete(restaurantId: string, menuId: string, categoryId: string, productId: string, req: any): Promise<{
        message: string;
    }>;
}
export declare class ProductsDirectController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    getProductById(restaurantId: string, productId: string): Promise<ProductResponseDto>;
}
