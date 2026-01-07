import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  CreateOrderDto, 
  CreateOrderFromCartDto, 
  OrderResponseDto, 
  OrderStatus,
  OrderStatusEnum,
  ItemStatusEnum, 
  OrderEvent, 
  ORDER_TOPICS, 
  CreateDineInOrderDto, 
  AddItemToOrderDto,
  SendBatchToKitchenDto,
  UpdateBatchStatusDto,
  ServeBatchDto,
  RequestPaymentDto,
  CompletePaymentDto,
  AddBatchToOrderDto
} from '@rm/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { REQUEST } from '@nestjs/core';
import { KafkaService } from '../../kafka/kafka.service';
import { CartService } from './cart.service';
import { DineInOrdersService } from './dine-in-orders.service';
import { DeliveryTakeawayOrdersService } from './delivery-takeaway-orders.service';
import { Order, OrderDocument } from '../schemas/order.schema';
import { ProductsService } from '../../menu/services/products.service';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly kafkaService: KafkaService,
    private readonly cartService: CartService,
    private readonly httpService: HttpService,
    private readonly productsService: ProductsService,
    private readonly dineInOrdersService: DineInOrdersService,
    private readonly deliveryTakeawayOrdersService: DeliveryTakeawayOrdersService,
    @Inject(REQUEST) private readonly request: AuthRequest,
  ) {}

  private getAuthHeaders() {
    // Check if we're in an HTTP request context (has request object with headers)
    if (this.request && this.request.headers) {
      const authHeader = this.request.headers['authorization'];
      const jwtFromCookie = this.request.cookies?.jwt;
      const token = authHeader?.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : jwtFromCookie;

      return token ? { Authorization: `Bearer ${token}` } : {};
    }
    
    // If we're in Kafka event context or no request, return empty headers
    // (get-user-by-email endpoint is public anyway)
    return {};
  }

  private async getUserIdFromEmail(email: string): Promise<string> {
    console.log(`[OrdersService] Getting user ID for email: ${email}`);
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'http://auth-service:3000/auth/get-user-by-email', 
          { email },
          { headers: this.getAuthHeaders() }
        )
      );
      console.log(`[OrdersService] Got user ID: ${response.data.userId} for email: ${email}`);
      return response.data.userId;
    } catch (error) {
      console.error(`[OrdersService] Failed to get user ID for email: ${email}`, error);
      throw new BadRequestException('Invalid customer email');
    }
  }

  // ======================== CART-BASED ORDERS ========================

  async createOrderFromCart(
    userId: string,
    userEmail: string,
    restaurantId: string,
    createOrderDto: CreateOrderFromCartDto,
  ): Promise<OrderDocument> {
    console.log(`[OrdersService] Creating order from cart for user: ${userId}, restaurant: ${restaurantId}`);
    console.log(`[OrdersService] Cart type: ${createOrderDto}`);
    
    // Get cart and validate
    const cart = await this.cartService.getCart(userId, restaurantId);
    if (!cart || cart.items.length === 0) {
      console.log(`[OrdersService] Cart is empty for user: ${userId}, restaurant: ${restaurantId}`);
      throw new BadRequestException('Cart is empty');
    }
    
    console.log(`[OrdersService] Found cart with ${cart.items.length} items, orderType: ${cart.orderType}`);

    // Create order from cart based on order type
    if (cart.orderType === 'DELIVERY') {
      console.log(`[OrdersService] Creating DELIVERY order for ${cart.items.length} items`);
      const deliveryOrder = await this.deliveryTakeawayOrdersService.createDeliveryOrder(userId, {
        restaurantId,
        items: cart.items.map(item => ({
          productId: item.productId.toString(),
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        customerEmail: createOrderDto.customerEmail || userEmail,
        customerName: cart.takeawayName || 'Customer',
        customerPhone: cart.takeawayPhone || '',
        deliveryAddress: cart.deliveryAddress,
        orderNotes: createOrderDto.orderNotes,
      });
      
      console.log(`[OrdersService] Created delivery order: ${deliveryOrder._id}`);
      // Clear cart after successful order
      await this.cartService.clearCart(userId, restaurantId);
      return deliveryOrder;
      
    } else if (cart.orderType === 'TAKEAWAY') {
      console.log(`[OrdersService] Creating TAKEAWAY order for ${cart.items.length} items`);
      const takeawayOrder = await this.deliveryTakeawayOrdersService.createTakeawayOrder(userId, {
        restaurantId,
        items: cart.items.map(item => ({
          productId: item.productId.toString(),
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        customerEmail: createOrderDto.customerEmail || userEmail,
        customerName: cart.takeawayName || 'Customer',
        customerPhone: cart.takeawayPhone || '',
        orderNotes: createOrderDto.orderNotes,
      });
      
      console.log(`[OrdersService] Created takeaway order: ${takeawayOrder._id}`);
      // Clear cart after successful order
      await this.cartService.clearCart(userId, restaurantId);
      return takeawayOrder;
      
    } else {
      // Legacy dine-in from cart (should not happen with new structure)
      console.log(`[OrdersService] Creating legacy DINE_IN order for ${cart.items.length} items - this should not happen!`);
      console.warn(`[OrdersService] DEPRECATED: Legacy dine-in cart flow used. OrderType: ${cart.orderType}`);
      
      const order = new this.orderModel({
        customerId: new Types.ObjectId(userId),
        restaurantId: new Types.ObjectId(restaurantId),
        items: cart.items,
        orderType: cart.orderType || 'DINE_IN',
        tableNumber: cart.tableNumber,
        deliveryAddress: cart.deliveryAddress,
        takeawayPhone: cart.takeawayPhone,
        takeawayName: cart.takeawayName,
        totalAmount: cart.totalAmount,
        status: OrderStatusEnum.PENDING,
        customerEmail: createOrderDto.customerEmail || userEmail,
        orderNotes: createOrderDto.orderNotes,
        createdAt: new Date(),
      });

      const savedOrder = await order.save();
      console.log(`[OrdersService] Created legacy dine-in order: ${savedOrder._id}`);

      // Clear cart after successful order
      await this.cartService.clearCart(userId, restaurantId);

      // Emit CORRECT Dine-in event instead of generic order event
      const event: any = {
        orderId: (savedOrder._id as any).toString(),
        restaurantId: savedOrder.restaurantId.toString(),
        customerId: savedOrder.customerId.toString(),
        orderType: 'DINE_IN',
        status: 'PENDING',
        timestamp: new Date(),
        metadata: {
          tableNumber: savedOrder.tableNumber,
          waiterId: userId, // The user creating the order becomes waiter
          waiterEmail: userEmail,
          customerName: savedOrder.takeawayName || 'Customer',
          items: savedOrder.items?.map(item => ({
            productId: item.productId.toString(),
            quantity: item.quantity,
            price: item.price,
            specialInstructions: item.specialInstructions,
            status: 'PENDING',
          })) || [],
        },
      };
      console.log(`[OrdersService] Emitting dine-in created event:`, JSON.stringify(event, null, 2));
      await this.kafkaService.emitDineInCreated(event);

      return savedOrder;
    }
  }

  // ======================== ORDER QUERIES ========================

  async getUserOrders(
    userId: string,
    restaurantId: string,
    filters: { status?: OrderStatus; page: number; limit: number },
  ): Promise<{ orders: OrderDocument[]; total: number; page: number; totalPages: number }> {
    const query: any = { 
      customerId: new Types.ObjectId(userId), 
      restaurantId: new Types.ObjectId(restaurantId) 
    };
    if (filters.status) {
      query.status = filters.status;
    }

    const skip = (filters.page - 1) * filters.limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getOrderById(orderId: string, userId?: string, restaurantId?: string): Promise<OrderDocument> {
    const query: any = { _id: new Types.ObjectId(orderId) };
    if (userId) query.customerId = new Types.ObjectId(userId);
    if (restaurantId) query.restaurantId = new Types.ObjectId(restaurantId);

    const order = await this.orderModel.findOne(query).exec();
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }
    return order;
  }

  async cancelOrder(orderId: string, userId: string, restaurantId: string): Promise<OrderDocument> {
    const order = await this.getOrderById(orderId, userId, restaurantId);
    
    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    order.status = OrderStatusEnum.CANCELLED;
    const updatedOrder = await order.save();

    // Emit Kafka event
    const event: OrderEvent = {
      orderId: (updatedOrder._id as any).toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      status: updatedOrder.status,
      timestamp: new Date(),
    };
    await this.kafkaService.emitOrderEvent(event);

    return updatedOrder;
  }

  async getOrderTrackingInfo(orderId: string, restaurantId: string): Promise<any> {
    const order = await this.orderModel.findOne({ 
      _id: new Types.ObjectId(orderId), 
      restaurantId: new Types.ObjectId(restaurantId) 
    }).exec();
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // Return simplified tracking info (no sensitive staff information)
    return {
      orderId: order._id,
      status: order.status,
      orderType: order.orderType,
      estimatedPrepTime: order.kitchenDetails?.estimatedPrepTime,
      estimatedDeliveryTime: order.deliveryDetails?.estimatedDeliveryTime,
      kitchenAcceptedAt: order.kitchenDetails?.acceptedAt,
      preparationStartedAt: order.kitchenDetails?.preparationStartedAt,
      readyAt: order.kitchenDetails?.readyAt || order.takeawayDetails?.readyAt,
      pickedUpAt: order.deliveryDetails?.pickedUpAt || order.takeawayDetails?.pickedUpAt,
      actualDeliveryTime: order.deliveryDetails?.deliveredAt,
      createdAt: (order as any).createdAt,
    };
  }

  // ======================== MANAGEMENT METHODS ========================

  async getOrdersForRestaurantManagement(
    restaurantId: string,
    filters: { status?: OrderStatus; orderType?: string; page: number; limit: number },
  ): Promise<{ orders: OrderDocument[]; total: number; page: number; totalPages: number }> {
    const query: any = { restaurantId: new Types.ObjectId(restaurantId) };
    if (filters.status) query.status = filters.status;
    if (filters.orderType) query.orderType = filters.orderType;

    const skip = (filters.page - 1) * filters.limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async updateOrderStatusForManagement(
    orderId: string,
    restaurantId: string,
    status: OrderStatus,
    note?: string,
    metadata?: any,
  ): Promise<OrderDocument> {
    const order = await this.getOrderById(orderId, undefined, restaurantId);
    
    const oldStatus = order.status;
    order.status = status;
    
    // Initialize details objects if needed
    if (!order.kitchenDetails && (status === OrderStatusEnum.KITCHEN_ACCEPTED || status === OrderStatusEnum.PREPARING || status === OrderStatusEnum.READY)) {
      order.kitchenDetails = {};
    }
    if (!order.deliveryDetails && order.orderType === 'DELIVERY' && (status === OrderStatusEnum.PICKED_UP || status === OrderStatusEnum.DELIVERED)) {
      order.deliveryDetails = {};
    }
    if (!order.takeawayDetails && order.orderType === 'TAKEAWAY' && (status === OrderStatusEnum.READY || status === OrderStatusEnum.PICKED_UP)) {
      order.takeawayDetails = {};
    }
    
    if (note) {
      if (order.kitchenDetails) {
        order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${note}`;
      }
    }

    // Save estimatedPrepTime from metadata if provided
    if (metadata?.estimatedPrepTime && order.kitchenDetails) {
      order.kitchenDetails.estimatedPrepTime = metadata.estimatedPrepTime;
    }

    // Update timestamps based on status
    const now = new Date();
    switch (status) {
      case OrderStatusEnum.KITCHEN_ACCEPTED:
        if (order.kitchenDetails) {
          order.kitchenDetails.acceptedAt = now;
        }
        break;
      case OrderStatusEnum.PREPARING:
        if (order.kitchenDetails) {
          order.kitchenDetails.preparationStartedAt = now;
        }
        break;
      case OrderStatusEnum.READY:
      case OrderStatusEnum.READY_FOR_DELIVERY:
      case OrderStatusEnum.READY_FOR_PICKUP:
        if (order.kitchenDetails) {
          order.kitchenDetails.readyAt = now;
        } else if (order.takeawayDetails) {
          order.takeawayDetails.readyAt = now;
        }
        break;
      case OrderStatusEnum.SERVED:
        // For dine-in orders, we don't store servedAt in details objects
        break;
      case OrderStatusEnum.PICKED_UP:
        if (order.deliveryDetails) {
          order.deliveryDetails.pickedUpAt = now;
        } else if (order.takeawayDetails) {
          order.takeawayDetails.pickedUpAt = now;
        }
        break;
      case OrderStatusEnum.DELIVERED:
        if (order.deliveryDetails) {
          order.deliveryDetails.deliveredAt = now;
        }
        break;
    }

    const updatedOrder = await order.save();

    // Emit Kafka event
    const event: OrderEvent = {
      orderId: (updatedOrder._id as any).toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      status: updatedOrder.status,
      timestamp: new Date(),
      metadata: {
        oldStatus,
        note,
        ...metadata,
      },
    };
    await this.kafkaService.emitOrderEvent(event);

    return updatedOrder;
  }

  // ======================== DINE-IN DELEGATION METHODS ========================
  
  // Create enhanced dine-in order with batch-level structure
  async createEnhancedDineInOrder(
    waiterId: string,
    waiterEmail: string,
    restaurantId: string,
    createOrderDto: CreateDineInOrderDto,
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.createDineInOrder(waiterId, waiterEmail, restaurantId, createOrderDto);
  }

  // Send a complete batch to kitchen
  async sendBatchToKitchen(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    batchDto: SendBatchToKitchenDto,
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.sendBatchToKitchen(orderId, restaurantId, waiterId, batchDto);
  }

  // Kitchen accepts a complete batch
  async kitchenAcceptBatch(
    orderId: string,
    restaurantId: string,
    chefId: string,
    batchNumber: number,
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.kitchenAcceptBatch(orderId, restaurantId, chefId, batchNumber);
  }

  // Update batch status (used by kitchen)
  async updateBatchStatus(
    orderId: string,
    restaurantId: string,
    chefId: string,
    updateDto: UpdateBatchStatusDto,
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.updateBatchStatus(orderId, restaurantId, chefId, updateDto);
  }

  // Serve complete batch (used by waiter)
  async serveBatch(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    serveDto: ServeBatchDto,
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.serveBatch(orderId, restaurantId, waiterId, serveDto);
  }

  // Add new batch to existing order
  async addBatchToOrder(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    batchDto: AddBatchToOrderDto,
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.addBatchToOrder(
      orderId,
      restaurantId,
      waiterId,
      batchDto,
    );
  }

  // Request payment for dine-in order
  async requestPayment(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    requestDto: RequestPaymentDto,
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.requestPayment(orderId, restaurantId, waiterId, requestDto);
  }

  // Complete payment for dine-in order
  async completePayment(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    paymentDto: CompletePaymentDto,
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.completePayment(orderId, restaurantId, waiterId, paymentDto);
  }

  // Get active dine-in orders
  async getActiveDineInOrders(restaurantId: string): Promise<OrderDocument[]> {
    return this.dineInOrdersService.getActiveDineInOrders(restaurantId);
  }

  // Get orders ready for service
  async getOrdersReadyForService(restaurantId: string): Promise<OrderDocument[]> {
    return this.dineInOrdersService.getOrdersReadyForService(restaurantId);
  }

  // ======================== DELIVERY/TAKEAWAY DELEGATION METHODS ========================

  // Create delivery order
  async createDeliveryOrder(customerId: string, createOrderDto: any): Promise<OrderDocument> {
    return this.deliveryTakeawayOrdersService.createDeliveryOrder(customerId, createOrderDto);
  }

  // Create takeaway order
  async createTakeawayOrder(customerId: string, createOrderDto: any): Promise<OrderDocument> {
    return this.deliveryTakeawayOrdersService.createTakeawayOrder(customerId, createOrderDto);
  }

  // Kitchen accept delivery order
  async kitchenAcceptDeliveryOrder(orderId: string, restaurantId: string, chefId: string, body?: any): Promise<OrderDocument> {
    return this.deliveryTakeawayOrdersService.kitchenAcceptDeliveryOrder(orderId, restaurantId, chefId, body);
  }

  // Kitchen accept takeaway order
  async kitchenAcceptTakeawayOrder(orderId: string, restaurantId: string, chefId: string, body?: any): Promise<OrderDocument> {
    return this.deliveryTakeawayOrdersService.kitchenAcceptTakeawayOrder(orderId, restaurantId, chefId, body);
  }

  // Update delivery status
  async updateDeliveryStatus(orderId: string, restaurantId: string, chefId: string, updateDto: any): Promise<OrderDocument> {
    return this.deliveryTakeawayOrdersService.updateDeliveryStatus(orderId, restaurantId, chefId, updateDto);
  }

  // Update takeaway status
  async updateTakeawayStatus(orderId: string, restaurantId: string, chefId: string, updateDto: any): Promise<OrderDocument> {
    return this.deliveryTakeawayOrdersService.updateTakeawayStatus(orderId, restaurantId, chefId, updateDto);
  }

  // Complete delivery order
  async completeDeliveryOrder(orderId: string, restaurantId: string, driverId?: string): Promise<OrderDocument> {
    return this.deliveryTakeawayOrdersService.completeDeliveryOrder(orderId, restaurantId, driverId);
  }

  // Complete takeaway order
  async completeTakeawayOrder(orderId: string, restaurantId: string, waiterId?: string): Promise<OrderDocument> {
    return this.deliveryTakeawayOrdersService.completeTakeawayOrder(orderId, restaurantId, waiterId);
  }

  // Get active delivery orders
  async getActiveDeliveryOrders(restaurantId: string): Promise<OrderDocument[]> {
    return this.deliveryTakeawayOrdersService.getActiveDeliveryOrders(restaurantId);
  }

  // Get active takeaway orders
  async getActiveTakeawayOrders(restaurantId: string): Promise<OrderDocument[]> {
    return this.deliveryTakeawayOrdersService.getActiveTakeawayOrders(restaurantId);
  }

  // Get orders ready for delivery
  async getOrdersReadyForDelivery(restaurantId: string): Promise<OrderDocument[]> {
    return this.deliveryTakeawayOrdersService.getOrdersReadyForDelivery(restaurantId);
  }

  // Get orders ready for pickup
  async getOrdersReadyForPickup(restaurantId: string): Promise<OrderDocument[]> {
    return this.deliveryTakeawayOrdersService.getOrdersReadyForPickup(restaurantId);
  }

  // Get pending delivery orders
  async getPendingDeliveryOrders(restaurantId: string): Promise<{ orders: OrderDocument[] }> {
    const orders = await this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DELIVERY',
      status: OrderStatusEnum.PENDING
    })
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 })
    .exec();

    return { orders };
  }

  // Get pending takeaway orders
  async getPendingTakeawayOrders(restaurantId: string): Promise<{ orders: OrderDocument[] }> {
    const orders = await this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'TAKEAWAY',
      status: OrderStatusEnum.PENDING
    })
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 })
    .exec();

    return { orders };
  }

  // Get in progress delivery orders (KITCHEN_ACCEPTED and PREPARING)
  async getInProgressDeliveryOrders(restaurantId: string): Promise<{ orders: OrderDocument[] }> {
    const orders = await this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DELIVERY',
      status: { $in: [OrderStatusEnum.KITCHEN_ACCEPTED, OrderStatusEnum.PREPARING] }
    })
    .populate('customerId', 'name email')
    .sort({ createdAt: -1 })
    .exec();

    return { orders };
  }

  async updateItemStatus(
    orderId: string,
    restaurantId: string,
    batchNumber: number,
    productId: string,
    chefId: string,
    status: string
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.updateItemStatus(
      orderId,
      restaurantId,
      batchNumber,
      productId,
      chefId,
      status
    );
  }

  async batchPreparing(
    orderId: string,
    restaurantId: string,
    batchNumber: number,
    chefId: string,
    note?: string
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.batchPreparing(
      orderId,
      restaurantId,
      batchNumber,
      chefId,
      note
    );
  }

  async batchReady(
    orderId: string,
    restaurantId: string,
    batchNumber: number,
    chefId: string,
    note?: string
  ): Promise<OrderDocument> {
    return this.dineInOrdersService.batchReady(
      orderId,
      restaurantId,
      batchNumber,
      chefId,
      note
    );
  }

  // ======================== KITCHEN/WAITER FILTERING DELEGATIONS ========================

  async getPendingDineInOrdersForKitchen(restaurantId: string) {
    return this.dineInOrdersService.getPendingDineInOrdersForKitchen(restaurantId);
  }

  async getAcceptedDineInOrdersForKitchen(restaurantId: string) {
    return this.dineInOrdersService.getAcceptedDineInOrdersForKitchen(restaurantId);
  }

  async getReadyDineInOrdersForKitchen(restaurantId: string) {
    return this.dineInOrdersService.getReadyDineInOrdersForKitchen(restaurantId);
  }

  async getCurrentOrdersForWaiter(restaurantId: string) {
    return this.dineInOrdersService.getCurrentOrdersForWaiter(restaurantId);
  }

  async getCompletedOrdersForWaiter(restaurantId: string) {
    return this.dineInOrdersService.getCompletedOrdersForWaiter(restaurantId);
  }

  async getReadyBatchesForWaiter(restaurantId: string) {
    return this.dineInOrdersService.getReadyBatchesForWaiter(restaurantId);
  }

  // ======================== TAKEAWAY METHODS ========================

  async pickupTakeawayOrder(
    restaurantId: string,
    orderId: string,
    customerId: string,
    body: { customerName?: string },
  ): Promise<OrderDocument> {
    return this.deliveryTakeawayOrdersService.completeTakeawayOrder(
      orderId,
      restaurantId,
      undefined // No waiter ID for customer pickup
    );
  }

  // ======================== USER PROFILE METHODS ========================

  async getAllUserOrders(
    userId: string,
    filters: { status?: OrderStatus; page: number; limit: number },
  ): Promise<{ orders: OrderDocument[]; total: number; page: number; totalPages: number }> {
    const query: any = { 
      customerId: new Types.ObjectId(userId)
    };
    if (filters.status) {
      query.status = filters.status;
    }

    const skip = (filters.page - 1) * filters.limit;
    const [orders, total] = await Promise.all([
      this.orderModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .populate('restaurantId', 'name address')
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    return {
      orders,
      total,
      page: filters.page,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getRecentUserOrders(userId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({ 
      customerId: new Types.ObjectId(userId) 
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('restaurantId', 'name address')
    .exec();
  }

  async getUserOrderStats(userId: string): Promise<any> {
    const orders = await this.orderModel.find({ 
      customerId: new Types.ObjectId(userId) 
    }).exec();

    const stats = {
      totalOrders: orders.length,
      completedOrders: orders.filter(order => 
        ['DELIVERED', 'COMPLETED', 'PICKED_UP'].includes(order.status)
      ).length,
      pendingOrders: orders.filter(order => 
        ['PENDING', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY_FOR_DELIVERY', 'IN_DELIVERY'].includes(order.status)
      ).length,
      cancelledOrders: orders.filter(order => 
        ['CANCELLED'].includes(order.status)
      ).length,
      totalSpent: orders
        .filter(order => ['DELIVERED', 'COMPLETED', 'PICKED_UP'].includes(order.status))
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0),
      averageOrderValue: 0,
      favoriteRestaurants: [] as any[],
      orderTypes: {
        delivery: orders.filter(order => order.orderType === 'DELIVERY').length,
        takeaway: orders.filter(order => order.orderType === 'TAKEAWAY').length,
        dineIn: orders.filter(order => order.orderType === 'DINE_IN').length,
      }
    };

    // Calculate average order value
    const completedOrders = orders.filter(order => 
      ['DELIVERED', 'COMPLETED', 'PICKED_UP'].includes(order.status)
    );
    if (completedOrders.length > 0) {
      stats.averageOrderValue = stats.totalSpent / completedOrders.length;
    }

    // Get favorite restaurants
    const restaurantCounts = orders.reduce((acc, order) => {
      const restaurantId = order.restaurantId.toString();
      acc[restaurantId] = (acc[restaurantId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    stats.favoriteRestaurants = Object.entries(restaurantCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([restaurantId, count]) => ({ restaurantId, orderCount: count }));

    return stats;
  }

  // ======================== PRODUCT DETAILS ========================
  
  async getProductDetails(restaurantId: string, productId: string): Promise<any> {
    console.log(`[OrdersService] Getting product details for ID: ${productId} in restaurant: ${restaurantId}`);
    try {
      const product = await this.productsService.getProductById(restaurantId, productId);
      console.log(`[OrdersService] Found product: ${product.name}`);
      return {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
      };
    } catch (error) {
      console.error(`[OrdersService] Failed to get product details for ID: ${productId}`, error);
      throw new NotFoundException(`Product not found: ${productId}`);
    }
  }
} 