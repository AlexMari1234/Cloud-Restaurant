import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { OrdersManagementService } from '../services/orders-management.service';
import { 
  OrderStatus,
  OrderStatusEnum, 
  UpdateOrderStatusDto, 
  AddItemToOrderDto,
  CreateDineInOrderDto,
  SendBatchToKitchenDto,
  KitchenAcceptBatchDto,
  UpdateBatchStatusDto,
  ServeBatchDto,
  RequestPaymentDto,
  CompletePaymentDto,
  AddBatchToOrderDto
} from '@rm/common';

// This controller is for restaurant management only - internal service calls
@ApiTags('orders-management')
@Controller('orders/:restaurantId/manage')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class OrdersManagementController {
  constructor(private readonly ordersManagementService: OrdersManagementService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get orders by status and type for restaurant management' })
  @ApiResponse({ status: 200, description: 'Returns filtered orders' })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatusEnum })
  @ApiQuery({ name: 'orderType', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getOrdersByStatus(
    @Param('restaurantId') restaurantId: string,
    @Query('status') status?: OrderStatus,
    @Query('orderType') orderType?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.ordersManagementService.getOrdersByStatus(
      restaurantId,
      { status, orderType, page, limit },
    );
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get order details by ID for restaurant management' })
  @ApiResponse({ status: 200, description: 'Returns order details' })
  async getOrderById(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersManagementService.getOrderById(restaurantId, orderId);
  }

  @Put(':orderId/status')
  @ApiOperation({ summary: 'Update order status for restaurant management' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  async updateOrderStatus(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() updateData: UpdateOrderStatusDto,
  ) {
    return this.ordersManagementService.updateOrderStatus(
      restaurantId,
      orderId,
      updateData,
    );
  }

  @Put(':orderId/add-item')
  @ApiOperation({ summary: 'Add item to existing order (legacy - use add-batch for dine-in)' })
  @ApiResponse({ status: 200, description: 'Item added to order successfully' })
  async addItemToOrder(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() addItemDto: AddItemToOrderDto,
    @Req() req: any,
  ) {
    // For dine-in orders, convert single item to batch format
    const batchDto = {
      items: [addItemDto],
      note: 'Single item added via legacy endpoint'
    };
    return this.ordersManagementService.addBatchToOrder(
      restaurantId, 
      orderId, 
      req.user._id, // waiterId
      batchDto
    );
  }

  // ======================== VIEW-ONLY ENDPOINTS FOR FRONTEND ========================
  // CRUD operations now handled via Kafka from restaurant-service

  @Get('dine-in/active')
  @ApiOperation({ summary: 'Get active dine-in orders' })
  @ApiResponse({ status: 200, description: 'Returns active dine-in orders' })
  async getActiveDineInOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getActiveDineInOrders(restaurantId);
  }

  @Get('dine-in/ready-for-service')
  @ApiOperation({ summary: 'Get orders ready for waiter service' })
  @ApiResponse({ status: 200, description: 'Returns orders ready for service' })
  async getOrdersReadyForService(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersReadyForService(restaurantId);
  }

  @Get('kitchen/pending-acceptance')
  @ApiOperation({ summary: 'Get orders/items sent to kitchen awaiting acceptance' })
  @ApiResponse({ status: 200, description: 'Returns orders with items in SENT_TO_KITCHEN status' })
  async getOrdersPendingKitchenAcceptance(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersPendingKitchenAcceptance(restaurantId);
  }

  @Get('kitchen/accepted-orders')
  @ApiOperation({ summary: 'Get orders accepted by kitchen for preparation' })
  @ApiResponse({ status: 200, description: 'Returns orders with items accepted by kitchen' })
  async getKitchenAcceptedOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getKitchenAcceptedOrders(restaurantId);
  }

  // ======================== FILTERED ENDPOINTS FOR FRONTEND ========================

  @Get('pending/dine-in')
  @ApiOperation({ summary: 'Get pending dine-in orders' })
  @ApiResponse({ status: 200, description: 'Returns pending dine-in orders' })
  async getPendingDineInOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersByStatus(
      restaurantId,
      { status: OrderStatusEnum.PENDING, orderType: 'DINE_IN', page: 1, limit: 50 },
    );
  }

  @Get('pending/takeaway')
  @ApiOperation({ summary: 'Get pending takeaway orders' })
  @ApiResponse({ status: 200, description: 'Returns pending takeaway orders' })
  async getPendingTakeawayOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersByStatus(
      restaurantId,
      { status: OrderStatusEnum.PENDING, orderType: 'TAKEAWAY', page: 1, limit: 50 },
    );
  }

  @Get('pending/delivery')
  @ApiOperation({ summary: 'Get pending delivery orders' })
  @ApiResponse({ status: 200, description: 'Returns pending delivery orders' })
  async getPendingDeliveryOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersByStatus(
      restaurantId,
      { status: OrderStatusEnum.PENDING, orderType: 'DELIVERY', page: 1, limit: 50 },
    );
  }

  @Get('ready/dine-in')
  @ApiOperation({ summary: 'Get ready dine-in orders for waiter notification' })
  @ApiResponse({ status: 200, description: 'Returns dine-in orders ready for service' })
  async getReadyDineInOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersByStatus(
      restaurantId,
      { status: OrderStatusEnum.ALL_READY, orderType: 'DINE_IN', page: 1, limit: 50 },
    );
  }

  @Get('ready/takeaway')
  @ApiOperation({ summary: 'Get ready takeaway orders for pickup notification' })
  @ApiResponse({ status: 200, description: 'Returns takeaway orders ready for pickup' })
  async getReadyTakeawayOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersByStatus(
      restaurantId,
      { status: OrderStatusEnum.READY, orderType: 'TAKEAWAY', page: 1, limit: 50 },
    );
  }

  @Get('ready/delivery')
  @ApiOperation({ summary: 'Get ready delivery orders for driver notification' })
  @ApiResponse({ status: 200, description: 'Returns delivery orders ready for pickup' })
  async getReadyDeliveryOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersByStatus(
      restaurantId,
      { status: 'READY_FOR_DELIVERY' as any, orderType: 'DELIVERY', page: 1, limit: 50 },
    );
  }

  @Get('kitchen/preparing')
  @ApiOperation({ summary: 'Get all orders currently being prepared in kitchen' })
  @ApiResponse({ status: 200, description: 'Returns orders being prepared' })
  async getPreparingOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersByStatus(
      restaurantId,
      { status: OrderStatusEnum.PREPARING, page: 1, limit: 50 },
    );
  }

  @Get('kitchen/accepted')
  @ApiOperation({ summary: 'Get all orders accepted by kitchen but not yet preparing' })
  @ApiResponse({ status: 200, description: 'Returns kitchen accepted orders' })
  async getKitchenAcceptedAllOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getOrdersByStatus(
      restaurantId,
      { status: OrderStatusEnum.KITCHEN_ACCEPTED, page: 1, limit: 50 },
    );
  }

  // ======================== SPECIFIC KITCHEN/WAITER ENDPOINTS ========================

  @Get('kitchen/dine-in/pending')
  @ApiOperation({ summary: 'Get dine-in orders with batches pending kitchen acceptance' })
  @ApiResponse({ status: 200, description: 'Returns dine-in orders with pending batches' })
  async getKitchenPendingDineInOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getPendingDineInOrdersForKitchen(restaurantId);
  }

  @Get('kitchen/dine-in/accepted')
  @ApiOperation({ summary: 'Get dine-in orders accepted by kitchen but not all ready' })
  @ApiResponse({ status: 200, description: 'Returns dine-in orders accepted by kitchen' })
  async getKitchenAcceptedDineInOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getAcceptedDineInOrdersForKitchen(restaurantId);
  }

  @Get('waiter/current-orders')
  @ApiOperation({ summary: 'Get current active orders for waiter (not completed/cancelled)' })
  @ApiResponse({ status: 200, description: 'Returns current active orders' })
  async getWaiterCurrentOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getCurrentOrdersForWaiter(restaurantId);
  }

  @Get('waiter/completed-orders')
  @ApiOperation({ summary: 'Get recently completed orders for waiter' })
  @ApiResponse({ status: 200, description: 'Returns recently completed orders' })
  async getWaiterCompletedOrders(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getCompletedOrdersForWaiter(restaurantId);
  }

  @Get('waiter/ready-batches')
  @ApiOperation({ summary: 'Get dine-in orders with ready batches to serve' })
  @ApiResponse({ status: 200, description: 'Returns orders with ready batches' })
  async getWaiterReadyBatches(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.ordersManagementService.getReadyBatchesForWaiter(restaurantId);
  }

  // All kitchen/waiter operations now handled via Kafka from restaurant-service
} 