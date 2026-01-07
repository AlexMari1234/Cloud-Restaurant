import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from '../services/orders.service';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrderStatus, OrderStatusEnum, CreateOrderFromCartDto, CreateDineInOrderDto } from '@rm/common';

@ApiTags('orders')
@Controller('orders/:restaurantId')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('from-cart')
  @ApiOperation({ summary: 'Create order from current cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully from cart' })
  @ApiResponse({ status: 400, description: 'Cart is empty or invalid' })
  async createOrderFromCart(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Body() createOrderDto: CreateOrderFromCartDto,
  ) {
    return this.ordersService.createOrderFromCart(
      req.user._id,
      req.user.email,
      restaurantId,
      createOrderDto,
    );
  }

  @Post('place-direct')
  @ApiOperation({ summary: 'Place order from cart with optional customer email override' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  @ApiResponse({ status: 400, description: 'Cart is empty or invalid' })
  async placeDirectOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Body() createOrderDto: CreateOrderFromCartDto,
  ) {
    return this.ordersService.createOrderFromCart(
      req.user._id,
      req.user.email,
      restaurantId,
      createOrderDto,
    );
  }

  @Post('direct')
  @ApiOperation({ summary: 'Create direct order without cart (waiter functionality)' })
  @ApiResponse({ status: 201, description: 'Direct order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid order data' })
  async createDirectDineInOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Body() createOrderDto: CreateDineInOrderDto,
  ) {
    return this.ordersService.createEnhancedDineInOrder(
      req.user._id,
      req.user.email,
      restaurantId,
      createOrderDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders for a restaurant' })
  @ApiResponse({ status: 200, description: 'Returns user orders' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatusEnum })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Query('status') status?: OrderStatus,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.ordersService.getUserOrders(
      req.user._id,
      restaurantId,
      { status, page, limit },
    );
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get specific order details' })
  @ApiResponse({ status: 200, description: 'Returns order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderById(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.getOrderById(orderId, req.user._id, restaurantId);
  }

  @Put(':orderId/cancel')
  @ApiOperation({ summary: 'Cancel order (only if pending)' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled' })
  async cancelOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.cancelOrder(orderId, req.user._id, restaurantId);
  }

  @Get(':orderId/track')
  @ApiOperation({ summary: 'Track order status (public endpoint)' })
  @ApiResponse({ status: 200, description: 'Returns order tracking info' })
  async trackOrder(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.getOrderTrackingInfo(orderId, restaurantId);
  }

  // ======================== TAKEAWAY ENDPOINTS ========================

  @Get('takeaway/pending')
  @ApiOperation({ summary: 'Get pending takeaway orders for kitchen' })
  @ApiResponse({ status: 200, description: 'Returns pending takeaway orders' })
  async getPendingTakeawayOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersService.getPendingTakeawayOrders(restaurantId);
  }

  @Get('delivery/pending')
  @ApiOperation({ summary: 'Get pending delivery orders for kitchen' })
  @ApiResponse({ status: 200, description: 'Returns pending delivery orders' })
  async getPendingDeliveryOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersService.getPendingDeliveryOrders(restaurantId);
  }

  @Get('product/:productId/details')
  @ApiOperation({ summary: 'Get product details by ID for kitchen' })
  @ApiResponse({ status: 200, description: 'Returns product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductDetails(
    @Param('restaurantId') restaurantId: string,
    @Param('productId') productId: string,
  ) {
    return this.ordersService.getProductDetails(restaurantId, productId);
  }

  @Put(':orderId/pickup')
  @ApiOperation({ summary: 'Customer picks up takeaway order' })
  @ApiResponse({ status: 200, description: 'Takeaway order picked up successfully' })
  async pickupTakeawayOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: { customerName?: string },
  ) {
    return this.ordersService.pickupTakeawayOrder(restaurantId, orderId, req.user._id, body);
  }
} 