import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { Menu, MenuDocument } from '../schemas/menu.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '@rm/common';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
    private readonly httpService: HttpService,
  ) {}

  private async toResponseDto(doc: CategoryDocument): Promise<CategoryResponseDto> {
    const response: CategoryResponseDto = {
      _id: doc._id.toString(),
      restaurantId: doc.restaurantId.toString(),
      menuId: doc.menuId.toString(),
      name: doc.name,
      parentId: doc.parentId?.toString(),
      sortOrder: doc.sortOrder ?? 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      type: doc.type,
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

  async getAll(restaurantId: string, menuId: string): Promise<CategoryResponseDto[]> {
    await this.verifyMenuExists(restaurantId, menuId);
    const categories = await this.categoryModel
      .find({ 
        restaurantId: new Types.ObjectId(restaurantId),
        menuId: new Types.ObjectId(menuId) 
      })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
    return Promise.all(categories.map(cat => this.toResponseDto(cat)));
  }

  async getMainCategories(restaurantId: string, menuId: string): Promise<CategoryResponseDto[]> {
    await this.verifyMenuExists(restaurantId, menuId);
    const mainCategories = await this.categoryModel
      .find({ 
        restaurantId: new Types.ObjectId(restaurantId),
        menuId: new Types.ObjectId(menuId),
        parentId: null // Only main categories (no parent)
      })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
    return Promise.all(mainCategories.map(cat => this.toResponseDto(cat)));
  }

  async getOne(restaurantId: string, menuId: string, categoryId: string): Promise<CategoryResponseDto> {
    await this.verifyMenuExists(restaurantId, menuId);
    const category = await this.categoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return this.toResponseDto(category);
  }

  async create(restaurantId: string, menuId: string, dto: CreateCategoryDto, user: any): Promise<CategoryResponseDto> {
    await this.verifyMenuExists(restaurantId, menuId);

    const existingCategory = await this.categoryModel.findOne({
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
      name: dto.name,
    });
    if (existingCategory) {
      throw new BadRequestException('A category with this name already exists');
    }

    if (dto.parentId) {
      const parentCategory = await this.categoryModel.findOne({
        _id: new Types.ObjectId(dto.parentId),
        restaurantId: new Types.ObjectId(restaurantId),
        menuId: new Types.ObjectId(menuId),
      });
      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }
    }

    const { type, ...rest } = dto;
    const category = await this.categoryModel.create({
      ...rest,
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : null,
      type,
    });

    return this.toResponseDto(category);
  }

  async update(restaurantId: string, menuId: string, categoryId: string, dto: UpdateCategoryDto, user: any): Promise<CategoryResponseDto> {
    await this.verifyMenuExists(restaurantId, menuId);

    const existingCategory = await this.categoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name && dto.name !== existingCategory.name) {
      const duplicateCategory = await this.categoryModel.findOne({
        restaurantId: new Types.ObjectId(restaurantId),
        menuId: new Types.ObjectId(menuId),
        name: dto.name,
        _id: { $ne: new Types.ObjectId(categoryId) },
      });
      if (duplicateCategory) {
        throw new BadRequestException('A category with this name already exists');
      }
    }

    if (dto.parentId && dto.parentId !== existingCategory.parentId?.toString()) {
      if (dto.parentId === categoryId) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      const parentCategory = await this.categoryModel.findOne({
        _id: new Types.ObjectId(dto.parentId),
        restaurantId: new Types.ObjectId(restaurantId),
        menuId: new Types.ObjectId(menuId),
      });
      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }

      let current: CategoryDocument | null = parentCategory;
      while (current?.parentId) {
        if (current.parentId.toString() === categoryId) {
          throw new BadRequestException('Circular reference detected in category hierarchy');
        }
        current = await this.categoryModel.findById(current.parentId);
        if (!current) break;
      }
    }

    const { type: updateType, ...updateRest } = dto;
    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      categoryId,
      {
        ...updateRest,
        parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : null,
        ...(updateType !== undefined ? { type: updateType } : {}),
      },
      { new: true },
    );

    if (!updatedCategory) {
      throw new NotFoundException('Category not found');
    }

    return this.toResponseDto(updatedCategory);
  }

  async delete(restaurantId: string, menuId: string, categoryId: string, user: any): Promise<{ message: string }> {
    await this.verifyMenuExists(restaurantId, menuId);

    const category = await this.categoryModel.findOne({
      _id: new Types.ObjectId(categoryId),
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const hasSubcategories = await this.categoryModel.exists({
      restaurantId: new Types.ObjectId(restaurantId),
      parentId: new Types.ObjectId(categoryId),
    });
    if (hasSubcategories) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    await this.categoryModel.findByIdAndDelete(categoryId);
    return { message: 'Category deleted successfully' };
  }

  async getSubcategories(restaurantId: string, menuId: string, parentCategoryId: string): Promise<CategoryResponseDto[]> {
    await this.verifyMenuExists(restaurantId, menuId);
    
    const parentCategory = await this.categoryModel.findOne({
      _id: new Types.ObjectId(parentCategoryId),
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
    });
    if (!parentCategory) {
      throw new NotFoundException('Parent category not found');
    }

    const subcategories = await this.categoryModel
      .find({
        restaurantId: new Types.ObjectId(restaurantId),
        menuId: new Types.ObjectId(menuId),
        parentId: new Types.ObjectId(parentCategoryId),
      })
      .sort({ sortOrder: 1, name: 1 })
      .exec();

    return Promise.all(subcategories.map(cat => this.toResponseDto(cat)));
  }

  async createSubcategory(
    restaurantId: string,
    menuId: string,
    parentCategoryId: string,
    dto: CreateCategoryDto,
    user: any,
  ): Promise<CategoryResponseDto> {
    await this.verifyMenuExists(restaurantId, menuId);

    const parentCategory = await this.categoryModel.findOne({
      _id: new Types.ObjectId(parentCategoryId),
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
    });
    if (!parentCategory) {
      throw new NotFoundException('Parent category not found');
    }

    const existingCategory = await this.categoryModel.findOne({
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
      parentId: new Types.ObjectId(parentCategoryId),
      name: dto.name,
    });
    if (existingCategory) {
      throw new BadRequestException('A subcategory with this name already exists in this category');
    }

    const { type: subType, ...subRest } = dto;
    const category = await this.categoryModel.create({
      ...subRest,
      restaurantId: new Types.ObjectId(restaurantId),
      menuId: new Types.ObjectId(menuId),
      parentId: new Types.ObjectId(parentCategoryId),
      sortOrder: dto.sortOrder || 0,
      type: subType,
    });

    return this.toResponseDto(category);
  }
} 