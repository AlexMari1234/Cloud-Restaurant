import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Menu, MenuDocument } from '../schemas/menu.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CreateMenuDto, UpdateMenuDto, MenuResponseDto } from '@rm/common';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu.name)
    private readonly menuModel: Model<MenuDocument>,
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly request: AuthRequest,
  ) {}

  private getAuthHeaders() {
    const authHeader = this.request.headers['authorization'];
    const jwtFromCookie = this.request.cookies?.jwt;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : jwtFromCookie;

    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async toResponseDto(doc: MenuDocument): Promise<MenuResponseDto> {
    const response: MenuResponseDto = {
      _id: doc._id.toString(),
      restaurantId: doc.restaurantId.toString(),
      name: doc.name,
      description: doc.description,
      isActive: doc.isActive,
      currency: doc.currency || 'RON',
      language: doc.language || 'ro',
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return response;
  }

  private async verifyRestaurantExists(restaurantId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `http://restaurant-service:3001/restaurants/${restaurantId}`,
          { headers: this.getAuthHeaders() }
        )
      );
      
      if (!response.data) {
        throw new NotFoundException('Restaurant not found');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error verifying restaurant:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        throw new NotFoundException('Restaurant not found');
      }
      throw new BadRequestException('Could not verify restaurant');
    }
  }

  async getMenus(restaurantId: string): Promise<MenuResponseDto[]> {
    await this.verifyRestaurantExists(restaurantId);
    const menus = await this.menuModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
    }).sort({ createdAt: -1 });
    
    return Promise.all(menus.map(menu => this.toResponseDto(menu)));
  }

  async getMenu(restaurantId: string, menuId: string): Promise<MenuResponseDto> {
    await this.verifyRestaurantExists(restaurantId);
    const menu = await this.menuModel.findOne({
      _id: new Types.ObjectId(menuId),
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }
    return this.toResponseDto(menu);
  }

  async createMenu(restaurantId: string, dto: CreateMenuDto, user: any): Promise<MenuResponseDto> {
    await this.verifyRestaurantExists(restaurantId);

    const menu = await this.menuModel.create({
      ...dto,
      restaurantId: new Types.ObjectId(restaurantId),
      lastUpdatedBy: new Types.ObjectId(user._id),
      currency: dto.currency || 'RON',
      language: dto.language || 'ro',
      isActive: dto.isActive ?? true,
    });

    return this.toResponseDto(menu);
  }

  async updateMenu(restaurantId: string, menuId: string, dto: UpdateMenuDto, user: any): Promise<MenuResponseDto> {
    await this.verifyRestaurantExists(restaurantId);

    const menu = await this.menuModel.findOne({
      _id: new Types.ObjectId(menuId),
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    const updatedMenu = await this.menuModel.findByIdAndUpdate(
      menu._id,
      {
        ...dto,
        lastUpdatedBy: new Types.ObjectId(user._id),
        currency: dto.currency || menu.currency || 'RON',
        language: dto.language || menu.language || 'ro',
      },
      { new: true },
    );

    if (!updatedMenu) {
      throw new NotFoundException('Menu not found');
    }

    return this.toResponseDto(updatedMenu);
  }

  async deleteMenu(restaurantId: string, menuId: string, user: any): Promise<{ message: string }> {
    await this.verifyRestaurantExists(restaurantId);

    const menu = await this.menuModel.findOne({
      _id: new Types.ObjectId(menuId),
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    // Ștergerea în cascadă este gestionată de middleware-ul din schema Menu
    await this.menuModel.findByIdAndDelete(menu._id);
    return { message: 'Menu deleted successfully' };
  }
} 