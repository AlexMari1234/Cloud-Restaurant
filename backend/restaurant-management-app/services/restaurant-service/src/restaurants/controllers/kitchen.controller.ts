import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  Post,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RestaurantRolesGuard } from '../../auth/guards/restaurant-roles.guard';
import { RestaurantRoles } from '../../auth/decorators/restaurant-roles.decorator';
import { KitchenService } from '../services/kitchen.service';
import {
  KitchenAcceptOrderDto,
  KitchenStartPreparingDto,
  KitchenMarkReadyDto,
  KitchenAcceptDeliveryOrderDto,
  KitchenAcceptTakeawayOrderDto,
  KitchenStartPreparingDeliveryOrderDto,
  KitchenStartPreparingTakeawayOrderDto,
  KitchenMarkReadyDeliveryOrderDto,
  KitchenMarkReadyTakeawayOrderDto,
  KitchenAcceptBatchDto,
  UpdateBatchStatusDto
} from '@rm/common';

@ApiTags('Kitchen Management')
@Controller('restaurants/:restaurantId/kitchen')
@UseGuards(AuthGuard, RestaurantRolesGuard)
@RestaurantRoles('owner', 'manager', 'chef')
@ApiBearerAuth()
export class KitchenController {
  constructor(
    private readonly kitchenService: KitchenService,
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

  @Get('orders/pending')
  @ApiOperation({ summary: 'Get pending orders for kitchen' })
  @ApiResponse({ status: 200, description: 'Returns pending orders' })
  async getPendingOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getPendingOrders(restaurantId, token);
  }

  @Put('orders/:orderId/accept')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Kitchen accepts order with estimated preparation time' })
  @ApiResponse({ status: 200, description: 'Order accepted by kitchen' })
  async acceptOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenAcceptOrderDto,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.acceptOrder(restaurantId, orderId, req.user._id, body, token);
  }

  @Put('orders/:orderId/start-preparing')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Start preparing order (notifies cooking has begun)' })
  @ApiResponse({ status: 200, description: 'Order preparation started' })
  async startPreparing(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenStartPreparingDto,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.startPreparing(restaurantId, orderId, req.user._id, body, token);
  }

  @Put('orders/:orderId/ready')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Mark order as ready for pickup/delivery' })
  @ApiResponse({ status: 200, description: 'Order marked as ready' })
  async markReady(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenMarkReadyDto,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.markReady(restaurantId, orderId, req.user._id, body, token);
  }

  @Get('orders/active')
  @ApiOperation({ summary: 'Get active orders in kitchen' })
  @ApiResponse({ status: 200, description: 'Returns active kitchen orders' })
  async getActiveOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getActiveOrders(restaurantId, token);
  }

  // ======================== TAKEAWAY ENDPOINTS ========================

  @Get('takeaway/pending')
  @ApiOperation({ summary: 'Get pending takeaway orders for kitchen' })
  @ApiResponse({ status: 200, description: 'Returns pending takeaway orders' })
  async getPendingTakeawayOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getPendingTakeawayOrders(restaurantId, token);
  }

  @Put('takeaway/:orderId/accept')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Kitchen accepts takeaway order with estimated prep time' })
  @ApiResponse({ status: 200, description: 'Takeaway order accepted by kitchen' })
  async acceptTakeawayOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenAcceptTakeawayOrderDto,
  ) {
    return this.kitchenService.acceptTakeawayOrder(restaurantId, orderId, req.user._id, body);
  }

  @Put('takeaway/:orderId/preparing')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Mark takeaway order as preparing' })
  @ApiResponse({ status: 200, description: 'Takeaway order marked as preparing' })
  async preparingTakeawayOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenStartPreparingTakeawayOrderDto,
  ) {
    return this.kitchenService.preparingTakeawayOrder(restaurantId, orderId, req.user._id, body);
  }

  @Put('takeaway/:orderId/ready')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Mark takeaway order as ready for pickup' })
  @ApiResponse({ status: 200, description: 'Takeaway order marked as ready' })
  async readyTakeawayOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenMarkReadyTakeawayOrderDto,
  ) {
    return this.kitchenService.readyTakeawayOrder(restaurantId, orderId, req.user._id, body);
  }

  @Get('takeaway/ready')
  @ApiOperation({ summary: 'Get takeaway orders ready for pickup' })
  @ApiResponse({ status: 200, description: 'Returns takeaway orders ready for pickup' })
  async getReadyTakeawayOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getReadyTakeawayOrders(restaurantId, token);
  }

  // ======================== DELIVERY ENDPOINTS ========================

  @Get('delivery/pending')
  @ApiOperation({ summary: 'Get pending delivery orders for kitchen' })
  @ApiResponse({ status: 200, description: 'Returns pending delivery orders' })
  async getPendingDeliveryOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getPendingDeliveryOrders(restaurantId, token);
  }

  @Put('delivery/:orderId/accept')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Kitchen accepts delivery order with estimated prep time' })
  @ApiResponse({ status: 200, description: 'Delivery order accepted by kitchen' })
  async acceptDeliveryOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenAcceptDeliveryOrderDto,
  ) {
    return this.kitchenService.acceptDeliveryOrder(restaurantId, orderId, req.user._id, body);
  }

  @Put('delivery/:orderId/preparing')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Mark delivery order as preparing' })
  @ApiResponse({ status: 200, description: 'Delivery order marked as preparing' })
  async preparingDeliveryOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenStartPreparingDeliveryOrderDto,
  ) {
    return this.kitchenService.preparingDeliveryOrder(restaurantId, orderId, req.user._id, body);
  }

  @Put('delivery/:orderId/ready')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Mark delivery order as ready for delivery' })
  @ApiResponse({ status: 200, description: 'Delivery order marked as ready for delivery' })
  async readyDeliveryOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenMarkReadyDeliveryOrderDto,
  ) {
    return this.kitchenService.readyDeliveryOrder(restaurantId, orderId, req.user._id, body);
  }

  @Get('delivery/in-progress')
  @ApiOperation({ summary: 'Get delivery orders in progress (accepted/preparing)' })
  @ApiResponse({ status: 200, description: 'Returns delivery orders that are accepted or being prepared' })
  async getInProgressDeliveryOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getInProgressDeliveryOrders(restaurantId, token);
  }

  @Get('delivery/ready')
  @ApiOperation({ summary: 'Get delivery orders ready for pickup' })
  @ApiResponse({ status: 200, description: 'Returns delivery orders ready for pickup' })
  async getReadyDeliveryOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getReadyDeliveryOrders(restaurantId, token);
  }

  // ======================== DINE-IN ENDPOINTS ========================

  @Put('dine-in/:orderId/accept-batch')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Kitchen accepts a dine-in batch' })
  @ApiResponse({ status: 200, description: 'Dine-in batch accepted by kitchen' })
  async acceptDineInBatch(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: KitchenAcceptBatchDto,
  ) {
    return this.kitchenService.acceptDineInBatch(restaurantId, orderId, req.user._id, body);
  }

  @Put('dine-in/:orderId/update-batch-status')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Update dine-in batch status (preparing/ready)' })
  @ApiResponse({ status: 200, description: 'Dine-in batch status updated' })
  async updateDineInBatchStatus(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: UpdateBatchStatusDto,
  ) {
    return this.kitchenService.updateDineInBatchStatus(restaurantId, orderId, req.user._id, body);
  }

  @Put('dine-in/:orderId/batch/:batchNumber/preparing')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Mark dine-in batch as preparing' })
  @ApiResponse({ status: 200, description: 'Dine-in batch marked as preparing' })
  async preparingDineInBatch(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Param('batchNumber') batchNumber: number,
    @Body() body: { note?: string },
  ) {
    return this.kitchenService.preparingDineInBatch(restaurantId, orderId, req.user._id, batchNumber, body);
  }

  @Put('dine-in/:orderId/batch/:batchNumber/ready')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Mark dine-in batch as ready' })
  @ApiResponse({ status: 200, description: 'Dine-in batch marked as ready' })
  async readyDineInBatch(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Param('batchNumber') batchNumber: number,
    @Body() body: { note?: string },
  ) {
    return this.kitchenService.readyDineInBatch(restaurantId, orderId, req.user._id, batchNumber, body);
  }

  @Put('dine-in/:orderId/item/:batchNumber/:productId/status')
  @RestaurantRoles('owner', 'manager', 'chef')
  @ApiOperation({ summary: 'Update individual item status in dine-in batch' })
  @ApiResponse({ status: 200, description: 'Item status updated' })
  async updateDineInItemStatus(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Param('batchNumber') batchNumber: number,
    @Param('productId') productId: string,
    @Body() body: { status: string },
  ) {
    return this.kitchenService.updateDineInItemStatus(restaurantId, orderId, req.user._id, batchNumber, productId, body);
  }

  @Get('dine-in/pending-acceptance')
  @ApiOperation({ summary: 'Get dine-in orders pending kitchen acceptance' })
  @ApiResponse({ status: 200, description: 'Returns dine-in orders pending kitchen acceptance' })
  async getPendingDineInOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getPendingDineInOrders(restaurantId, token);
  }

  @Get('dine-in/accepted')
  @ApiOperation({ summary: 'Get kitchen-accepted dine-in orders' })
  @ApiResponse({ status: 200, description: 'Returns kitchen-accepted dine-in orders' })
  async getAcceptedDineInOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getAcceptedDineInOrders(restaurantId, token);
  }

  @Get('dine-in/ready')
  @ApiOperation({ summary: 'Get ready dine-in orders (ALL_READY, PARTIAL_SERVED, SERVED, PAYMENT_REQUESTED)' })
  @ApiResponse({ status: 200, description: 'Returns ready dine-in orders for kitchen view' })
  async getReadyDineInOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.kitchenService.getReadyDineInOrders(restaurantId, token);
  }

} 