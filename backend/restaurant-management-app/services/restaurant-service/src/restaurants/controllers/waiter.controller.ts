import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RestaurantRolesGuard } from '../../auth/guards/restaurant-roles.guard';
import { RestaurantRoles } from '../../auth/decorators/restaurant-roles.decorator';
import { WaiterService } from '../services/waiter.service';
import { 
  CreateDineInOrderDto,
  SendBatchToKitchenDto,
  ServeBatchDto,
  RequestPaymentDto,
  CompletePaymentDto,
  AddBatchToOrderDto,
} from '@rm/common';

@ApiTags('Waiter Management')
@Controller('restaurants/:restaurantId/service')
@UseGuards(AuthGuard, RestaurantRolesGuard)
@RestaurantRoles('owner', 'manager', 'employee', 'waiter')
@ApiBearerAuth()
export class WaiterController {
  private readonly logger = new Logger(WaiterController.name);

  constructor(
    private readonly waiterService: WaiterService,
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

  // ======================== DINE-IN ORDER MANAGEMENT ========================

  @Post('dine-in/create')
  @ApiOperation({ summary: 'Create dine-in order with batches' })
  @ApiResponse({ status: 201, description: 'Dine-in order created successfully' })
  async createDineInOrder(
    @Param('restaurantId') restaurantId: string,
    @Body() createOrderDto: CreateDineInOrderDto,
    @Req() req: any,
  ) {
    this.logger.log(`[WaiterController] Creating dine-in order for restaurant: ${restaurantId}`);
    const token = this.extractToken(req);
    return this.waiterService.createDineInOrder(
      restaurantId,
      req.user._id,
      createOrderDto,
      token,
    );
  }

  @Put(':orderId/send-batch-to-kitchen')
  @ApiOperation({ summary: 'Send a batch to kitchen' })
  @ApiResponse({ status: 200, description: 'Batch sent to kitchen successfully' })
  async sendBatchToKitchen(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() batchDto: SendBatchToKitchenDto,
    @Req() req: any,
  ) {
    this.logger.log(`[WaiterController] Sending batch to kitchen for order: ${orderId}`);
    const token = this.extractToken(req);
    return this.waiterService.sendBatchToKitchen(
      restaurantId,
      orderId,
      req.user._id,
      batchDto,
      token,
    );
  }

  @Put(':orderId/add-batch')
  @ApiOperation({ summary: 'Add a new batch to existing order' })
  @ApiResponse({ status: 200, description: 'Batch added to order successfully' })
  async addBatchToOrder(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() batchDto: AddBatchToOrderDto,
    @Req() req: any,
  ) {
    this.logger.log(`[WaiterController] Adding batch to order: ${orderId}`);
    const token = this.extractToken(req);
    return this.waiterService.addBatchToOrder(
      restaurantId,
      orderId,
      req.user._id,
      batchDto,
      token,
    );
  }

  @Put(':orderId/serve-batch')
  @ApiOperation({ summary: 'Serve a batch to table' })
  @ApiResponse({ status: 200, description: 'Batch served successfully' })
  async serveBatch(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() serveDto: ServeBatchDto,
    @Req() req: any,
  ) {
    this.logger.log(`[WaiterController] Serving batch for order: ${orderId}`);
    const token = this.extractToken(req);
    return this.waiterService.serveBatch(
      restaurantId,
      orderId,
      req.user._id,
      serveDto,
      token,
    );
  }

  @Put(':orderId/request-payment')
  @ApiOperation({ summary: 'Request payment from customer' })
  @ApiResponse({ status: 200, description: 'Payment requested successfully' })
  async requestPayment(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() requestDto: RequestPaymentDto,
    @Req() req: any,
  ) {
    this.logger.log(`[WaiterController] Requesting payment for order: ${orderId}`);
    const token = this.extractToken(req);
    return this.waiterService.requestPayment(
      restaurantId,
      orderId,
      req.user._id,
      requestDto,
      token,
    );
  }

  @Put(':orderId/complete-payment')
  @ApiOperation({ summary: 'Complete payment and finish order' })
  @ApiResponse({ status: 200, description: 'Payment completed successfully' })
  async completePayment(
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() paymentDto: CompletePaymentDto,
    @Req() req: any,
  ) {
    this.logger.log(`[WaiterController] Completing payment for order: ${orderId}`);
    const token = this.extractToken(req);
    return this.waiterService.completePayment(
      restaurantId,
      orderId,
      req.user._id,
      paymentDto,
      token,
    );
  }

  // ======================== VIEW METHODS ========================

  @Get('orders/all')
  @ApiOperation({ summary: 'Get all orders for restaurant' })
  @ApiResponse({ status: 200, description: 'Returns all orders' })
  async getAllOrders(
    @Param('restaurantId') restaurantId: string,
    @Req() req: any,
  ) {
    const token = this.extractToken(req);
    return this.waiterService.getAllOrders(restaurantId, token);
  }

  @Get('orders/ready-batches')
  @ApiOperation({ summary: 'Get batches ready for service' })
  @ApiResponse({ status: 200, description: 'Returns batches ready for service' })
  async getReadyBatches(
    @Param('restaurantId') restaurantId: string,
    @Req() req: any,
  ) {
    const token = this.extractToken(req);
    return this.waiterService.getReadyBatches(restaurantId, token);
  }

  @Get('orders/current')
  @ApiOperation({ summary: 'Get current orders for waiter' })
  @ApiResponse({ status: 200, description: 'Returns current orders' })
  async getCurrentOrders(
    @Param('restaurantId') restaurantId: string,
    @Req() req: any,
  ) {
    const token = this.extractToken(req);
    return this.waiterService.getCurrentOrders(restaurantId, req.user._id, token);
  }

  @Get('orders/completed')
  @ApiOperation({ summary: 'Get completed orders for waiter' })
  @ApiResponse({ status: 200, description: 'Returns completed orders' })
  async getCompletedOrders(
    @Param('restaurantId') restaurantId: string,
    @Req() req: any,
  ) {
    const token = this.extractToken(req);
    return this.waiterService.getCompletedOrders(restaurantId, req.user._id, token);
  }

  // ======================== TAKEAWAY ENDPOINTS ========================

  @Get('takeaway/ready')
  @ApiOperation({ summary: 'Get takeaway orders ready for pickup' })
  @ApiResponse({ status: 200, description: 'Returns takeaway orders ready for pickup' })
  async getReadyTakeawayOrders(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
  ) {
    const token = this.extractToken(req);
    return this.waiterService.getReadyTakeawayOrders(restaurantId, token);
  }

  @Put('takeaway/:orderId/pickup')
  @RestaurantRoles('owner', 'manager', 'waiter')
  @ApiOperation({ summary: 'Customer picks up takeaway order' })
  @ApiResponse({ status: 200, description: 'Takeaway order picked up successfully' })
  async pickupTakeawayOrder(
    @Req() req,
    @Param('restaurantId') restaurantId: string,
    @Param('orderId') orderId: string,
    @Body() body: { customerName?: string; note?: string },
  ) {
    const token = this.extractToken(req);
    return this.waiterService.pickupTakeawayOrder(restaurantId, orderId, req.user._id, body, token);
  }
} 