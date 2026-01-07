import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  OrderStatusEnum,
  ItemStatusEnum,
  TakeawayOrderCreatedEvent,
  DeliveryOrderCreatedEvent
} from '@rm/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { REQUEST } from '@nestjs/core';
import { KafkaService } from '../../kafka/kafka.service';
import { Order, OrderDocument } from '../schemas/order.schema';
import { ProductsService } from '../../menu/services/products.service';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';

// Delivery/Takeaway specific interfaces
interface OrderItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  specialInstructions?: string;
  status: 'PENDING' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'PICKED_UP';
  sentToKitchenAt?: Date;
  kitchenAcceptedAt?: Date;
  preparationStartedAt?: Date;
  readyAt?: Date;
  completedAt?: Date;
  chefId?: Types.ObjectId;
}

@Injectable()
export class DeliveryTakeawayOrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly kafkaService: KafkaService,
    private readonly httpService: HttpService,
    private readonly productsService: ProductsService,
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
    console.log(`[DeliveryTakeawayOrdersService] Getting user ID for email: ${email}`);
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'http://auth-service:3000/auth/get-user-by-email', 
          { email },
          { headers: this.getAuthHeaders() }
        )
      );
      console.log(`[DeliveryTakeawayOrdersService] Got user ID: ${response.data.userId} for email: ${email}`);
      return response.data.userId;
    } catch (error) {
      console.error(`[DeliveryTakeawayOrdersService] Failed to get user ID for email: ${email}`, error);
      throw new BadRequestException('Invalid customer email');
    }
  }

  // Create delivery order from cart
  async createDeliveryOrder(
    customerId: string,
    createOrderDto: any,
  ): Promise<OrderDocument> {
    console.log(`[DeliveryTakeawayOrdersService] Creating delivery order for customer: ${customerId}, restaurant: ${createOrderDto.restaurantId}`);
    console.log(`[DeliveryTakeawayOrdersService] Order items count: ${createOrderDto.items.length}`);
    
    // Build order items with prices
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of createOrderDto.items) {
      const product = await this.productsService.getProductById(
        createOrderDto.restaurantId, 
        item.productId
      );
      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: new Types.ObjectId(item.productId),
        quantity: item.quantity,
        price: itemPrice,
        specialInstructions: item.specialInstructions,
        status: 'PENDING',
        sentToKitchenAt: new Date(), // Sent immediately
        kitchenAcceptedAt: undefined,
        preparationStartedAt: undefined,
        readyAt: undefined,
        completedAt: undefined,
        chefId: undefined,
      });
    }

    const orderData = {
      restaurantId: new Types.ObjectId(createOrderDto.restaurantId),
      customerId: new Types.ObjectId(customerId),
      orderType: 'DELIVERY',
      status: OrderStatusEnum.PENDING,
      items: orderItems,
      totalAmount,
      customerEmail: createOrderDto.customerEmail,
      customerName: createOrderDto.customerName || 'Customer', // Default fallback
      customerPhone: createOrderDto.customerPhone || '', // Default fallback
      deliveryAddress: createOrderDto.deliveryAddress, // Keep as complete object
      orderNotes: createOrderDto.orderNotes,
      paymentStatus: 'PENDING',
      kitchenDetails: {
        sentToKitchenAt: new Date()
      },
      deliveryDetails: {}
    };

    const savedOrder = await this.orderModel.create(orderData);
    console.log(`[DeliveryTakeawayOrdersService] Created delivery order: ${savedOrder._id}, totalAmount: ${totalAmount}`);

    // Emit event for delivery order creation
    const event: DeliveryOrderCreatedEvent = {
      orderId: savedOrder._id.toString(),
      restaurantId: savedOrder.restaurantId.toString(),
      customerId: savedOrder.customerId.toString(),
      orderType: 'DELIVERY',
      status: 'PENDING',
      timestamp: new Date(),
      items: savedOrder.items!.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions,
        status: 'PENDING',
      })),
      metadata: {
        deliveryAddress: savedOrder.deliveryAddress!,
        customerPhone: savedOrder.customerPhone!,
        customerName: savedOrder.customerName!,
        totalAmount: savedOrder.totalAmount,
      },
    };
    
    console.log(`[DeliveryTakeawayOrdersService] Emitting delivery order created event:`, JSON.stringify(event, null, 2));
    await this.kafkaService.emitDeliveryOrderCreated(event);

    return savedOrder;
  }

  // Create takeaway order from cart
  async createTakeawayOrder(
    customerId: string,
    createOrderDto: any,
  ): Promise<OrderDocument> {
    console.log(`[DeliveryTakeawayOrdersService] Creating takeaway order for customer: ${customerId}, restaurant: ${createOrderDto.restaurantId}`);
    console.log(`[DeliveryTakeawayOrdersService] Order items count: ${createOrderDto.items.length}`);
    
    // Build order items with prices
    const orderItems: OrderItem[] = [];
    let totalAmount = 0;

    for (const item of createOrderDto.items) {
      const product = await this.productsService.getProductById(
        createOrderDto.restaurantId, 
        item.productId
      );
      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: new Types.ObjectId(item.productId),
        quantity: item.quantity,
        price: itemPrice,
        specialInstructions: item.specialInstructions,
        status: 'PENDING',
        sentToKitchenAt: new Date(), // Sent immediately
        kitchenAcceptedAt: undefined,
        preparationStartedAt: undefined,
        readyAt: undefined,
        completedAt: undefined,
        chefId: undefined,
      });
    }

    const orderData = {
      restaurantId: new Types.ObjectId(createOrderDto.restaurantId),
      customerId: new Types.ObjectId(customerId),
      orderType: 'TAKEAWAY',
      status: OrderStatusEnum.PENDING,
      items: orderItems,
      totalAmount,
      customerEmail: createOrderDto.customerEmail,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      orderNotes: createOrderDto.orderNotes,
      paymentStatus: 'PENDING',
      kitchenDetails: {
        sentToKitchenAt: new Date()
      },
      takeawayDetails: {
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone
      }
    };

    const savedOrder = await this.orderModel.create(orderData);
    console.log(`[DeliveryTakeawayOrdersService] Created takeaway order: ${savedOrder._id}, totalAmount: ${totalAmount}`);

    // Emit event for takeaway order creation
    const event: TakeawayOrderCreatedEvent = {
      orderId: savedOrder._id.toString(),
      restaurantId: savedOrder.restaurantId.toString(),
      customerId: savedOrder.customerId.toString(),
      orderType: 'TAKEAWAY',
      status: 'PENDING',
      timestamp: new Date(),
      items: savedOrder.items!.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions,
        status: 'PENDING',
      })),
      metadata: {
        customerPhone: savedOrder.customerPhone!,
        customerName: savedOrder.customerName!,
        totalAmount: savedOrder.totalAmount,
      },
    };
    
    console.log(`[DeliveryTakeawayOrdersService] Emitting takeaway order created event:`, JSON.stringify(event, null, 2));
    await this.kafkaService.emitTakeawayOrderCreated(event);

    return savedOrder;
  }

  // Kitchen accepts delivery order
  async kitchenAcceptDeliveryOrder(
    orderId: string,
    restaurantId: string,
    chefId: string,
    body?: { note?: string; estimatedPrepTime?: string },
  ): Promise<OrderDocument> {
    console.log(`[DeliveryTakeawayOrdersService] kitchenAcceptDeliveryOrder called with orderId: ${orderId}, restaurantId: ${restaurantId}, chefId: ${chefId}`);
    
    const order = await this.getDeliveryOrderById(orderId, restaurantId);
    console.log(`[DeliveryTakeawayOrdersService] Found order with status: ${order.status}`);

    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BadRequestException('Order is not pending kitchen acceptance');
    }

    // Update order status
    order.status = OrderStatusEnum.KITCHEN_ACCEPTED;
    
    // Update kitchen details
    if (!order.kitchenDetails) {
      order.kitchenDetails = {};
    }
    order.kitchenDetails.chefId = new Types.ObjectId(chefId);
    order.kitchenDetails.acceptedAt = new Date();
    
    // Save estimated prep time if provided
    if (body?.estimatedPrepTime) {
      order.kitchenDetails.estimatedPrepTime = body.estimatedPrepTime;
    }
    
    // Save note if provided
    if (body?.note) {
      order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${body.note}`;
    }
    
    console.log(`[DeliveryTakeawayOrdersService] Updated order status to: ${order.status}`);
    console.log(`[DeliveryTakeawayOrdersService] Kitchen details:`, order.kitchenDetails);
    
    // Update all items status
    order.items!.forEach(item => {
      (item as any).status = 'KITCHEN_ACCEPTED';
      (item as any).kitchenAcceptedAt = new Date();
      (item as any).chefId = new Types.ObjectId(chefId);
    });

    const updatedOrder = await order.save();
    console.log(`[DeliveryTakeawayOrdersService] Order saved successfully with status: ${updatedOrder.status}`);

    // Emit Kafka event
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      orderType: updatedOrder.orderType,
      status: updatedOrder.status,
      timestamp: new Date(),
      metadata: {
        chefId,
        acceptedItems: updatedOrder.items!.map(item => item.productId.toString()),
      },
    };
    
    console.log(`[DeliveryTakeawayOrdersService] Emitting order event:`, JSON.stringify(event, null, 2));
    await this.kafkaService.emitOrderEvent(event);

    return updatedOrder;
  }

  // Kitchen accepts takeaway order
  async kitchenAcceptTakeawayOrder(
    orderId: string,
    restaurantId: string,
    chefId: string,
    body?: { note?: string; estimatedPrepTime?: string },
  ): Promise<OrderDocument> {
    console.log(`[DeliveryTakeawayOrdersService] kitchenAcceptTakeawayOrder called with orderId: ${orderId}, restaurantId: ${restaurantId}, chefId: ${chefId}`);
    
    const order = await this.getTakeawayOrderById(orderId, restaurantId);
    console.log(`[DeliveryTakeawayOrdersService] Found order with status: ${order.status}`);

    if (order.status !== OrderStatusEnum.PENDING) {
      throw new BadRequestException('Order is not pending kitchen acceptance');
    }

    // Update order status
    order.status = OrderStatusEnum.KITCHEN_ACCEPTED;
    
    // Update kitchen details
    if (!order.kitchenDetails) {
      order.kitchenDetails = {};
    }
    order.kitchenDetails.chefId = new Types.ObjectId(chefId);
    order.kitchenDetails.acceptedAt = new Date();
    
    // Save estimated prep time if provided
    if (body?.estimatedPrepTime) {
      order.kitchenDetails.estimatedPrepTime = body.estimatedPrepTime;
    }
    
    // Save note if provided
    if (body?.note) {
      order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${body.note}`;
    }
    
    console.log(`[DeliveryTakeawayOrdersService] Updated order status to: ${order.status}`);
    console.log(`[DeliveryTakeawayOrdersService] Kitchen details:`, order.kitchenDetails);
    
    // Update all items status
    order.items!.forEach(item => {
      (item as any).status = 'KITCHEN_ACCEPTED';
      (item as any).kitchenAcceptedAt = new Date();
      (item as any).chefId = new Types.ObjectId(chefId);
    });

    const updatedOrder = await order.save();
    console.log(`[DeliveryTakeawayOrdersService] Order saved successfully with status: ${updatedOrder.status}`);

    // Emit Kafka event
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      orderType: updatedOrder.orderType,
      status: updatedOrder.status,
      timestamp: new Date(),
      metadata: {
        chefId,
        acceptedItems: updatedOrder.items!.map(item => item.productId.toString()),
      },
    };
    
    console.log(`[DeliveryTakeawayOrdersService] Emitting order event:`, JSON.stringify(event, null, 2));
    await this.kafkaService.emitOrderEvent(event);

    return updatedOrder;
  }

  // Update delivery status
  async updateDeliveryStatus(
    orderId: string,
    restaurantId: string,
    chefId: string,
    updateDto: any,
  ): Promise<OrderDocument> {
    console.log(`[DeliveryTakeawayOrdersService] updateDeliveryStatus called with orderId: ${orderId}, status: ${updateDto.status}`);
    const order = await this.getDeliveryOrderById(orderId, restaurantId);

    const oldStatus = order.status;
    
    // Validate status transitions for kitchen operations
    if (updateDto.status === 'PREPARING' && order.status !== 'KITCHEN_ACCEPTED') {
      throw new BadRequestException(`Cannot start preparing. Order must be kitchen accepted first. Current status: ${order.status}`);
    }
    
    if (updateDto.status === 'READY_FOR_DELIVERY' && order.status !== 'PREPARING') {
      throw new BadRequestException(`Cannot mark as ready. Order must be in preparing status first. Current status: ${order.status}`);
    }
    
    order.status = updateDto.status;

    // Update kitchen details based on status
    if (!order.kitchenDetails) {
      order.kitchenDetails = {};
    }
    order.kitchenDetails.chefId = new Types.ObjectId(chefId);
    
    switch (updateDto.status) {
      case 'PREPARING':
        order.kitchenDetails.preparationStartedAt = new Date();
        break;
      case 'READY_FOR_DELIVERY':
        order.kitchenDetails.readyAt = new Date();
        break;
    }

    // Add notes if provided
    if (updateDto.note) {
      order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${updateDto.note}`;
    }

    // Update delivery details if needed
    if (updateDto.status === 'READY_FOR_DELIVERY') {
      if (!order.deliveryDetails) {
        order.deliveryDetails = {};
      }
      order.deliveryDetails.readyAt = new Date();
      console.log(`[DeliveryTakeawayOrdersService] Updated deliveryDetails.readyAt for order ${orderId}`);
    }

    // Update delivery details if status is driver-related
    if (['DRIVER_ACCEPTED', 'IN_DELIVERY', 'DELIVERED'].includes(updateDto.status)) {
      if (!order.deliveryDetails) {
        order.deliveryDetails = {};
      }
      
      switch (updateDto.status) {
        case 'DRIVER_ACCEPTED':
          order.deliveryDetails.driverId = new Types.ObjectId(chefId); // This should be driverId
          order.deliveryDetails.acceptedAt = new Date();
          break;
        case 'IN_DELIVERY':
          order.deliveryDetails.pickedUpAt = new Date();
          break;
        case 'DELIVERED':
          order.deliveryDetails.deliveredAt = new Date();
          break;
      }
    }

    // Update all items status and timestamps
    order.items!.forEach(item => {
      const newItemStatus = this.mapOrderStatusToItemStatus(updateDto.status);
      (item as any).status = newItemStatus;
      (item as any).chefId = new Types.ObjectId(chefId);

      // Update timestamps based on status
      switch (newItemStatus) {
        case 'PREPARING':
          (item as any).preparationStartedAt = new Date();
          break;
        case 'READY':
          (item as any).readyAt = new Date();
          console.log(`[DeliveryTakeawayOrdersService] Updated item ${item.productId} readyAt for order ${orderId}`);
          break;
        case 'DELIVERED':
          (item as any).completedAt = new Date();
          break;
      }
    });

    const updatedOrder = await order.save();

    // Emit Kafka event
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      orderType: updatedOrder.orderType,
      status: updatedOrder.status,
      timestamp: new Date(),
      metadata: {
        oldStatus,
        chefId,
        timestamp: new Date(),
      },
    };
    
    await this.kafkaService.emitOrderEvent(event);

    return updatedOrder;
  }

  // Update takeaway status
  async updateTakeawayStatus(
    orderId: string,
    restaurantId: string,
    chefId: string,
    updateDto: any,
  ): Promise<OrderDocument> {
    const order = await this.getTakeawayOrderById(orderId, restaurantId);

    const oldStatus = order.status;
    
    // Validate status transitions for kitchen operations
    if (updateDto.status === 'PREPARING' && order.status !== 'KITCHEN_ACCEPTED') {
      throw new BadRequestException(`Cannot start preparing. Order must be kitchen accepted first. Current status: ${order.status}`);
    }
    
    if (updateDto.status === 'READY' && order.status !== 'PREPARING') {
      throw new BadRequestException(`Cannot mark as ready. Order must be in preparing status first. Current status: ${order.status}`);
    }
    
    order.status = updateDto.status;

    // Update kitchen details based on status
    if (!order.kitchenDetails) {
      order.kitchenDetails = {};
    }
    order.kitchenDetails.chefId = new Types.ObjectId(chefId);
    
    switch (updateDto.status) {
      case 'PREPARING':
        order.kitchenDetails.preparationStartedAt = new Date();
        break;
      case 'READY':
        order.kitchenDetails.readyAt = new Date();
        break;
    }

    // Add notes if provided
    if (updateDto.note) {
      order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${updateDto.note}`;
    }

    // Update takeaway details if needed
    if (updateDto.status === 'READY' && !order.takeawayDetails) {
      order.takeawayDetails = {};
    }
    
    if (updateDto.status === 'READY' && order.takeawayDetails) {
      order.takeawayDetails.readyAt = new Date();
    }

    // Update all items status and timestamps
    order.items!.forEach(item => {
      const newItemStatus = this.mapOrderStatusToItemStatus(updateDto.status);
      (item as any).status = newItemStatus;
      (item as any).chefId = new Types.ObjectId(chefId);

      // Update timestamps based on status
      switch (newItemStatus) {
        case 'PREPARING':
          (item as any).preparationStartedAt = new Date();
          break;
        case 'READY':
          (item as any).readyAt = new Date();
          break;
        case 'PICKED_UP':
          (item as any).completedAt = new Date();
          break;
      }
    });

    const updatedOrder = await order.save();

    // Emit Kafka event
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      orderType: updatedOrder.orderType,
      status: updatedOrder.status,
      timestamp: new Date(),
      metadata: {
        oldStatus,
        chefId,
        timestamp: new Date(),
      },
    };
    
    await this.kafkaService.emitOrderEvent(event);

    return updatedOrder;
  }

  // Complete delivery order
  async completeDeliveryOrder(
    orderId: string,
    restaurantId: string,
    driverId?: string,
  ): Promise<OrderDocument> {
    console.log(`[DeliveryTakeawayOrdersService] completeDeliveryOrder called with orderId: ${orderId}, restaurantId: ${restaurantId}, driverId: ${driverId}`);
    
    const order = await this.getDeliveryOrderById(orderId, restaurantId);
    console.log(`[DeliveryTakeawayOrdersService] Found order with status: ${order.status}`);

    // Accept IN_DELIVERY status as valid for completion too
    if (order.status !== OrderStatusEnum.READY_FOR_DELIVERY && order.status !== 'IN_DELIVERY' as any && order.status !== 'DRIVER_ACCEPTED' as any) {
      throw new BadRequestException(`Order is not ready for delivery completion. Current status: ${order.status}. Expected: READY_FOR_DELIVERY, DRIVER_ACCEPTED, or IN_DELIVERY`);
    }

    order.status = OrderStatusEnum.DELIVERED;
    order.paymentStatus = 'COMPLETED';

    // Update delivery details
    if (!order.deliveryDetails) {
      order.deliveryDetails = {};
    }
    if (driverId) {
      order.deliveryDetails.driverId = new Types.ObjectId(driverId);
    }
    order.deliveryDetails.deliveredAt = new Date();
    
    console.log(`[DeliveryTakeawayOrdersService] Updated order status to: ${order.status}`);
    console.log(`[DeliveryTakeawayOrdersService] Delivery details:`, order.deliveryDetails);

    // Update all items status
    order.items!.forEach(item => {
      (item as any).status = 'DELIVERED';
      (item as any).completedAt = new Date();
    });

    const updatedOrder = await order.save();
    console.log(`[DeliveryTakeawayOrdersService] Order saved successfully with status: ${updatedOrder.status}`);

    // Emit Kafka event
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      orderType: updatedOrder.orderType,
      status: OrderStatusEnum.DELIVERED,
      timestamp: new Date(),
      metadata: {
        totalAmount: updatedOrder.totalAmount,
        driverId: driverId,
        deliveredAt: new Date(),
      },
    };
    
    console.log(`[DeliveryTakeawayOrdersService] Emitting order delivered event:`, JSON.stringify(event, null, 2));
    await this.kafkaService.emitOrderDelivered(event);

    return updatedOrder;
  }

  // Complete takeaway order
  async completeTakeawayOrder(
    orderId: string,
    restaurantId: string,
    waiterId?: string,
  ): Promise<OrderDocument> {
    console.log(`[DeliveryTakeawayOrdersService] completeTakeawayOrder called with orderId: ${orderId}, restaurantId: ${restaurantId}, waiterId: ${waiterId}`);
    
    const order = await this.getTakeawayOrderById(orderId, restaurantId);
    console.log(`[DeliveryTakeawayOrdersService] Found order with status: ${order.status}`);

    if (order.status !== OrderStatusEnum.READY) {
      throw new BadRequestException('Order is not ready for pickup');
    }

    order.status = OrderStatusEnum.PICKED_UP;
    order.paymentStatus = 'COMPLETED';
    
    // Update takeaway details
    if (!order.takeawayDetails) {
      order.takeawayDetails = {};
    }
    if (waiterId) {
      order.takeawayDetails.waiterId = new Types.ObjectId(waiterId);
    }
    order.takeawayDetails.pickedUpAt = new Date();
    
    console.log(`[DeliveryTakeawayOrdersService] Updated order status to: ${order.status}`);
    console.log(`[DeliveryTakeawayOrdersService] Takeaway details:`, order.takeawayDetails);

    // Update all items status
    order.items!.forEach(item => {
      (item as any).status = 'PICKED_UP';
      (item as any).completedAt = new Date();
    });

    const updatedOrder = await order.save();
    console.log(`[DeliveryTakeawayOrdersService] Order saved successfully with status: ${updatedOrder.status}`);

    // Emit Kafka event
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      orderType: updatedOrder.orderType,
      status: OrderStatusEnum.PICKED_UP,
      timestamp: new Date(),
      metadata: {
        totalAmount: updatedOrder.totalAmount,
        waiterId: waiterId,
        pickedUpAt: new Date(),
      },
    };
    
    console.log(`[DeliveryTakeawayOrdersService] Emitting order completed event:`, JSON.stringify(event, null, 2));
    await this.kafkaService.emitOrderCompleted(event);

    return updatedOrder;
  }

  // Utility methods
  private mapOrderStatusToItemStatus(orderStatus: any): string {
    switch (orderStatus) {
      case OrderStatusEnum.PENDING:
        return 'PENDING';
      case OrderStatusEnum.KITCHEN_ACCEPTED:
        return 'KITCHEN_ACCEPTED';
      case OrderStatusEnum.PREPARING:
        return 'PREPARING';
      case OrderStatusEnum.READY:
        return 'READY';
      case 'READY_FOR_DELIVERY':
        return 'READY';
      case 'OUT_FOR_DELIVERY':
        return 'READY'; // Items remain ready when out for delivery
      case OrderStatusEnum.DELIVERED:
        return 'DELIVERED';
      case OrderStatusEnum.PICKED_UP:
        return 'PICKED_UP';
      default:
        return 'PENDING';
    }
  }

  async getDeliveryOrderById(orderId: string, restaurantId: string): Promise<OrderDocument> {
    const query: any = { 
      _id: new Types.ObjectId(orderId),
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DELIVERY'
    };

    const order = await this.orderModel.findOne(query).exec();
    if (!order) {
      throw new NotFoundException(`Delivery order with id ${orderId} not found`);
    }
    if (!order.items) {
      throw new BadRequestException('This is not a valid delivery order (missing items)');
    }
    return order;
  }

  async getTakeawayOrderById(orderId: string, restaurantId: string): Promise<OrderDocument> {
    const query: any = { 
      _id: new Types.ObjectId(orderId),
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'TAKEAWAY'
    };

    const order = await this.orderModel.findOne(query).exec();
    if (!order) {
      throw new NotFoundException(`Takeaway order with id ${orderId} not found`);
    }
    if (!order.items) {
      throw new BadRequestException('This is not a valid takeaway order (missing items)');
    }
    return order;
  }

  async getActiveDeliveryOrders(restaurantId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DELIVERY',
      status: { $in: [
        OrderStatusEnum.PENDING, 
        OrderStatusEnum.KITCHEN_ACCEPTED, 
        OrderStatusEnum.PREPARING, 
        OrderStatusEnum.READY,
        'OUT_FOR_DELIVERY'
      ]},
    }).exec();
  }

  async getActiveTakeawayOrders(restaurantId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'TAKEAWAY',
      status: { $in: [
        OrderStatusEnum.PENDING, 
        OrderStatusEnum.KITCHEN_ACCEPTED, 
        OrderStatusEnum.PREPARING, 
        OrderStatusEnum.READY
      ]},
    }).exec();
  }

  async getOrdersReadyForDelivery(restaurantId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DELIVERY',
      status: OrderStatusEnum.READY,
    }).exec();
  }

  async getOrdersReadyForPickup(restaurantId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'TAKEAWAY',
      status: OrderStatusEnum.READY,
    }).exec();
  }
} 