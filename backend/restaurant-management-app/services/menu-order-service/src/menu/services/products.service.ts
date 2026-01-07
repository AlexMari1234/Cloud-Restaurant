import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Menu, MenuDocument } from '../schemas/menu.schema';
import { CreateProductDto, UpdateProductDto, ProductResponseDto } from '@rm/common';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
  ) {}

  private async toResponseDto(doc: ProductDocument): Promise<ProductResponseDto> {
    const response: ProductResponseDto = {
      _id: doc._id.toString(),
      restaurantId: doc.restaurantId.toString(),
      categoryId: doc.categoryId.toString(),
      name: doc.name,
      description: doc.description,
      price: doc.price,
      currency: doc.currency,
      imageUrl: doc.imageUrl,
      allergens: doc.allergens,
      status: doc.status,
      ingredients: doc.ingredients,
      weight: doc.weight,
      nutrition: doc.nutrition,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return response;
  }

  private async verifyMenuExists(restaurantId: string, menuId: string) {
    const menu = await this.menuModel.findOne({
      _id: new Types.ObjectId(menuId),
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return menu;
  }

  private async verifyCategoryExists(restaurantId: string, menuId: string, categoryId: string) {
    const category = await this.categoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async getAll(restaurantId: string, menuId: string, categoryId: string): Promise<ProductResponseDto[]> {
    await this.verifyMenuExists(restaurantId, menuId);
    await this.verifyCategoryExists(restaurantId, menuId, categoryId);
    
    const products = await this.productModel
      .find({ 
        restaurantId: new Types.ObjectId(restaurantId),
        categoryId: new Types.ObjectId(categoryId) 
      })
      .sort({ name: 1 })
      .exec();
    return Promise.all(products.map(prod => this.toResponseDto(prod)));
  }

  async getOne(restaurantId: string, menuId: string, categoryId: string, productId: string): Promise<ProductResponseDto> {
    await this.verifyMenuExists(restaurantId, menuId);
    await this.verifyCategoryExists(restaurantId, menuId, categoryId);
    
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      restaurantId: new Types.ObjectId(restaurantId),
      categoryId: new Types.ObjectId(categoryId),
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toResponseDto(product);
  }

  async getProductById(restaurantId: string, productId: string): Promise<ProductResponseDto> {
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toResponseDto(product);
  }

  async create(restaurantId: string, menuId: string, categoryId: string, dto: CreateProductDto): Promise<ProductResponseDto> {
    await this.verifyMenuExists(restaurantId, menuId);
    await this.verifyCategoryExists(restaurantId, menuId, categoryId);

    const existingProduct = await this.productModel.findOne({
      restaurantId: new Types.ObjectId(restaurantId),
      categoryId: new Types.ObjectId(categoryId),
      name: dto.name,
    });
    if (existingProduct) {
      throw new BadRequestException('A product with this name already exists in this category');
    }

    const product = await this.productModel.create({
      ...dto,
      restaurantId: new Types.ObjectId(restaurantId),
      categoryId: new Types.ObjectId(categoryId),
    });

    return this.toResponseDto(product);
  }

  async update(restaurantId: string, menuId: string, categoryId: string, productId: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
    await this.verifyMenuExists(restaurantId, menuId);
    await this.verifyCategoryExists(restaurantId, menuId, categoryId);

    const existingProduct = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      restaurantId: new Types.ObjectId(restaurantId),
      categoryId: new Types.ObjectId(categoryId),
    });
    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    if (dto.name && dto.name !== existingProduct.name) {
      const duplicateProduct = await this.productModel.findOne({
        restaurantId: new Types.ObjectId(restaurantId),
        categoryId: new Types.ObjectId(categoryId),
        name: dto.name,
        _id: { $ne: new Types.ObjectId(productId) },
      });
      if (duplicateProduct) {
        throw new BadRequestException('A product with this name already exists in this category');
      }
    }

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      dto,
      { new: true },
    );

    if (!updatedProduct) {
      throw new NotFoundException('Product not found');
    }

    return this.toResponseDto(updatedProduct);
  }

  async delete(restaurantId: string, menuId: string, categoryId: string, productId: string): Promise<{ message: string }> {
    await this.verifyMenuExists(restaurantId, menuId);
    await this.verifyCategoryExists(restaurantId, menuId, categoryId);

    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(productId),
      restaurantId: new Types.ObjectId(restaurantId),
      categoryId: new Types.ObjectId(categoryId),
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.productModel.findByIdAndDelete(productId);
    return { message: 'Product deleted successfully' };
  }

  async searchProducts(restaurantId: string, searchTerm: string): Promise<ProductResponseDto[]> {
    const products = await this.productModel
      .find({
        restaurantId: new Types.ObjectId(restaurantId),
        name: { $regex: searchTerm, $options: 'i' }, // Case-insensitive search
        status: 'active' // Only show active products
      })
      .sort({ name: 1 })
      .limit(20) // Limit results to 20
      .exec();
    
    return Promise.all(products.map(prod => this.toResponseDto(prod)));
  }
} 