import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { OrderStatus, OrderStatusEnum } from '@rm/common';
import { OrdersService } from '../services/orders.service';

@ApiTags('User Profile')
@Controller('users')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class UserProfileController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':userId/orders')
  @ApiOperation({ summary: 'Get all orders for a user across all restaurants' })
  @ApiResponse({ status: 200, description: 'Returns user orders from all restaurants' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatusEnum })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserOrders(
    @Req() req,
    @Param('userId') userId: string,
    @Query('status') status?: OrderStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    // Verify that the user is requesting their own orders
    if (req.user._id !== userId) {
      throw new Error('Unauthorized: Can only access own orders');
    }

    return this.ordersService.getAllUserOrders(
      userId,
      { status, page, limit },
    );
  }

  @Get(':userId/orders/recent')
  @ApiOperation({ summary: 'Get recent orders for a user (last 10)' })
  @ApiResponse({ status: 200, description: 'Returns recent user orders' })
  async getRecentOrders(
    @Req() req,
    @Param('userId') userId: string,
  ) {
    // Verify that the user is requesting their own orders
    if (req.user._id !== userId) {
      throw new Error('Unauthorized: Can only access own orders');
    }

    return this.ordersService.getRecentUserOrders(userId);
  }

  @Get(':userId/orders/stats')
  @ApiOperation({ summary: 'Get order statistics for a user' })
  @ApiResponse({ status: 200, description: 'Returns user order statistics' })
  async getUserOrderStats(
    @Req() req,
    @Param('userId') userId: string,
  ) {
    // Verify that the user is requesting their own stats
    if (req.user._id !== userId) {
      throw new Error('Unauthorized: Can only access own statistics');
    }

    return this.ordersService.getUserOrderStats(userId);
  }
} 