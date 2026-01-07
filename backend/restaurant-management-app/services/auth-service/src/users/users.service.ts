import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { REQUEST } from '@nestjs/core';
import { AuthRequest } from '../auth/guards/auth.guard';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly request: AuthRequest,
  ) {}

  private extractToken(req: any): string {
    const authHeader = req.headers['authorization'];
    const jwtFromCookie = req.cookies?.jwt;

    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : jwtFromCookie;

    if (!token) {
      throw new Error('Missing or invalid token');
    }

    return token;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userModel.findById(id);
  }

  async create(user: Partial<User>): Promise<User> {
    return this.userModel.create(user);
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(id, user, { new: true });
  }

  async updateLastLoginAt(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
  }

  async promoteUserRole(userId: string, role: 'manager' | 'employee'): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, { role, status: 'active' }, { new: true });
  }
  
  async disableUser(userId: string): Promise<User | null> {
    return this.userModel.findByIdAndUpdate(userId, { status: 'disabled' }, { new: true });
  }

  async findActiveManagers(): Promise<User[]> {
    return this.userModel.find({ 
      role: 'manager', 
      status: 'active' 
    }).select('-passwordHash');
  }

  async findAll(): Promise<any[]> {
    return this.userModel.find().select('-passwordHash').exec();
  }

  async findById(id: string): Promise<any | null> {
    return this.userModel.findById(id).select('-passwordHash').exec();
  }

  async getUserProfile(userId: string): Promise<any> {
    // Get user basic info only
    const user = await this.userModel.findById(userId).select('-passwordHash').exec();
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        status: user.status,
        createdAt: (user as any).createdAt,
        lastLoginAt: user.lastLoginAt,
      }
    };
  }

  async getUserOrders(userId: string): Promise<any> {
    // Get user orders from menu-order-service
    let orders = [];
    try {
      // Extract token from request
      const token = this.extractToken(this.request);
      
      const response = await firstValueFrom(
        this.httpService.get(`http://menu-order-service:3003/users/${userId}/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      
      // The response contains an object with orders array, not just an array
      orders = response.data.orders || [];
    } catch (error) {
      console.log('Could not fetch orders:', error.message);
      // Continue without orders for now
    }

    return {
      orders: orders,
      stats: {
        totalOrders: orders.length,
        completedOrders: orders.filter((order: any) =>
          ['DELIVERED', 'COMPLETED', 'PICKED_UP'].includes(order.status)
        ).length,
        pendingOrders: orders.filter((order: any) =>
          ['PENDING', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY_FOR_DELIVERY', 'IN_DELIVERY'].includes(order.status)
        ).length,
      }
    };
  }
} 