import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  CreateDineInOrderDto,
  SendBatchToKitchenDto,
  UpdateBatchStatusDto,
  ServeBatchDto,
  RequestPaymentDto,
  CompletePaymentDto,
  AddBatchToOrderDto,
  OrderStatusEnum,
  ItemStatusEnum,
  DineInOrderCreatedEvent,
  BatchSentToKitchenEvent,
  PaymentRequestedEvent,
  DineInCompletedEvent
} from '@rm/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { REQUEST } from '@nestjs/core';
import { KafkaService } from '../../kafka/kafka.service';
import { Order, OrderDocument } from '../schemas/order.schema';
import { ProductsService } from '../../menu/services/products.service';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';

// Dine-in specific interfaces
interface DineInOrderBatchItem {
  productId: Types.ObjectId;
  quantity: number;
  price: number;
  specialInstructions?: string;
  itemStatus: 'PENDING' | 'SENT_TO_KITCHEN' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
  sentToKitchenAt?: Date;
  kitchenAcceptedAt?: Date;
  preparationStartedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  chefId?: Types.ObjectId;
}

interface DineInOrderBatch {
  batchNumber: number;
  items: DineInOrderBatchItem[];
  batchStatus: 'PENDING' | 'SENT_TO_KITCHEN' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED';
  batchNote?: string;
  sentToKitchenAt?: Date;
  kitchenAcceptedAt?: Date;
  allItemsReadyAt?: Date;
  allItemsServedAt?: Date;
  chefId?: Types.ObjectId;
}

@Injectable()
export class DineInOrdersService {
  private readonly logger = new Logger(DineInOrdersService.name);

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
    console.log(`[DineInOrdersService] Getting user ID for email: ${email}`);
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          'http://auth-service:3000/auth/get-user-by-email', 
          { email },
          { headers: this.getAuthHeaders() }
        )
      );
      console.log(`[DineInOrdersService] Got user ID: ${response.data.userId} for email: ${email}`);
      return response.data.userId;
    } catch (error) {
      console.error(`[DineInOrdersService] Failed to get user ID for email: ${email}`, error);
      throw new BadRequestException('Invalid customer email');
    }
  }

  // Create dine-in order with batch structure
  async createDineInOrder(
    waiterId: string,
    waiterEmail: string,
    restaurantId: string,
    createOrderDto: CreateDineInOrderDto,
  ): Promise<OrderDocument> {
    // Get customer ID from email
    const customerId = await this.getUserIdFromEmail(createOrderDto.customerEmail);

    // Process each batch and build order batches
    const orderBatches: DineInOrderBatch[] = [];
    let totalAmount = 0;

    for (let batchIndex = 0; batchIndex < createOrderDto.batches.length; batchIndex++) {
      const batch = createOrderDto.batches[batchIndex];
      const batchItems: DineInOrderBatchItem[] = [];

      for (const item of batch.items) {
        const product = await this.productsService.getProductById(restaurantId, item.productId);
        const itemPrice = product.price;
        const itemTotal = itemPrice * item.quantity;
        totalAmount += itemTotal;

        batchItems.push({
          productId: new Types.ObjectId(item.productId),
          quantity: item.quantity,
          price: itemPrice,
          specialInstructions: item.specialInstructions,
          itemStatus: 'PENDING',
          sentToKitchenAt: undefined,
          kitchenAcceptedAt: undefined,
          preparationStartedAt: undefined,
          readyAt: undefined,
          servedAt: undefined,
          chefId: undefined,
        });
      }

      orderBatches.push({
        batchNumber: batchIndex + 1, // 1-based numbering
        items: batchItems,
        batchStatus: 'PENDING',
        batchNote: batch.batchNote,
        sentToKitchenAt: undefined,
        kitchenAcceptedAt: undefined,
        allItemsReadyAt: undefined,
        allItemsServedAt: undefined,
        chefId: undefined,
      });
    }

    const orderData = {
      restaurantId: new Types.ObjectId(restaurantId),
      customerId: new Types.ObjectId(customerId),
      orderType: 'DINE_IN',
      status: OrderStatusEnum.DRAFT,
      tableNumber: createOrderDto.tableNumber,
      batches: orderBatches,
      totalAmount,
      customerEmail: createOrderDto.customerEmail,
      customerName: createOrderDto.customerName,
      orderNotes: createOrderDto.orderNotes,
      waiterId: new Types.ObjectId(waiterId),
      paymentStatus: 'PENDING',
    };

    const savedOrder = await this.orderModel.create(orderData);


    // This allows proper temp order cleanup

    // Emit event for dine-in order creation
    const event: DineInOrderCreatedEvent = {
      orderId: savedOrder._id.toString(),
      restaurantId: savedOrder.restaurantId.toString(),
      customerId: savedOrder.customerId.toString(),
      orderType: savedOrder.orderType,
      status: OrderStatusEnum.DRAFT,
      timestamp: new Date(),
      batches: savedOrder.batches!.map(batch => ({
        batchNumber: batch.batchNumber,
        batchStatus: batch.batchStatus as any,
        batchNote: batch.batchNote,
        items: batch.items.map(item => ({
          productId: item.productId.toString(),
          quantity: item.quantity,
          price: item.price,
          specialInstructions: item.specialInstructions,
          itemStatus: item.itemStatus,
        })),
      })),
      metadata: {
        tableNumber: savedOrder.tableNumber!,
        waiterId: waiterId,
        customerEmail: savedOrder.customerEmail!,
      },
    };
    
    await this.kafkaService.emitDineInCreated(event);

    return savedOrder;
  }

  // Send a complete batch to kitchen
  async sendBatchToKitchen(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    batchDto: SendBatchToKitchenDto,
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);
    
    // Find the specific batch by number
    const batch = order.batches!.find(b => b.batchNumber === batchDto.batchNumber);
    if (!batch) {
      throw new BadRequestException(`Batch ${batchDto.batchNumber} not found`);
    }

    if (batch.batchStatus !== 'PENDING') {
      throw new BadRequestException(`Batch ${batchDto.batchNumber} has already been sent to kitchen`);
    }

    // Update batch status and timing
    batch.batchStatus = 'SENT_TO_KITCHEN';
    batch.sentToKitchenAt = new Date();
    
    // Update all items in the batch
    const sentItems: string[] = [];
    batch.items.forEach(item => {
      item.itemStatus = 'SENT_TO_KITCHEN';
      item.sentToKitchenAt = new Date();
      sentItems.push(item.productId.toString());
    });

    // Update order status based on remaining pending batches
    const hasPendingBatches = order.batches!.some(b => b.batchStatus === 'PENDING');
    order.status = hasPendingBatches ? OrderStatusEnum.PARTIAL_KITCHEN : OrderStatusEnum.PARTIAL_KITCHEN;
    
    if (batchDto.kitchenNote) {
      // Initialize kitchenDetails if needed for notes
      if (!order.kitchenDetails) {
        order.kitchenDetails = {};
      }
      order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\nBatch ${batchDto.batchNumber}: ${batchDto.kitchenNote}`;
    }

    const updatedOrder = await order.save();

    // Emit Kafka event
    const event: BatchSentToKitchenEvent = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      orderType: updatedOrder.orderType,
      status: OrderStatusEnum.PARTIAL_KITCHEN,
      timestamp: new Date(),
      metadata: {
        batchNumber: batchDto.batchNumber,
        itemIds: sentItems,
        sentAt: new Date(),
      },
    };
    
    await this.kafkaService.emitBatchSentToKitchen(event);

    return updatedOrder;
  }

  // Kitchen accepts a complete batch
  async kitchenAcceptBatch(
    orderId: string,
    restaurantId: string,
    chefId: string,
    batchNumber: number,
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);
    
    // Find the specific batch
    const batch = order.batches!.find(b => b.batchNumber === batchNumber);
    if (!batch) {
      throw new BadRequestException(`Batch ${batchNumber} not found`);
    }

    if (batch.batchStatus !== 'SENT_TO_KITCHEN') {
      throw new BadRequestException(`Batch ${batchNumber} is not awaiting kitchen acceptance`);
    }

    // Update batch status and timing
    batch.batchStatus = 'KITCHEN_ACCEPTED';
    batch.kitchenAcceptedAt = new Date();
    batch.chefId = new Types.ObjectId(chefId);
    
    // Update all items in the batch
    const acceptedItems: string[] = [];
    batch.items.forEach(item => {
      item.itemStatus = 'KITCHEN_ACCEPTED';
      item.kitchenAcceptedAt = new Date();
      item.chefId = new Types.ObjectId(chefId);
      acceptedItems.push(item.productId.toString());
    });

    // Update order status if all batches are accepted by kitchen
    const hasUnacceptedBatches = order.batches!.some(b => 
      b.batchStatus === 'PENDING' || b.batchStatus === 'SENT_TO_KITCHEN'
    );
    
    if (!hasUnacceptedBatches) {
      order.status = OrderStatusEnum.KITCHEN_ACCEPTED;
    }

    const updatedOrder = await order.save();

    // Emit event following DELIVERY PATTERN (use emitOrderEvent)
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      waiterId: updatedOrder.waiterId?.toString(),
      orderType: updatedOrder.orderType,
      status: 'BATCH_ACCEPTED',
      timestamp: new Date(),
      metadata: {
        batchNumber,
        acceptedItems,
        chefId,
        tableNumber: updatedOrder.tableNumber,
      },
    };
    
    await this.kafkaService.emitOrderEvent(event);

    return updatedOrder;
  }

  // Update batch status (used by kitchen)
  async updateBatchStatus(
    orderId: string,
    restaurantId: string,
    chefId: string,
    updateDto: UpdateBatchStatusDto,
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);
    const batchNum = Number(updateDto.batchNumber);
    const batch = order.batches!.find(b => b.batchNumber === batchNum);
    if (!batch) {
      throw new BadRequestException(`Batch ${updateDto.batchNumber} not found`);
    }
    const oldStatus = batch.batchStatus;
    batch.batchStatus = updateDto.batchStatus;
    batch.chefId = new Types.ObjectId(chefId);
    // --- update la nivel de item daca exista itemStatuses ---
    if (Array.isArray(updateDto.itemStatuses) && updateDto.itemStatuses.length > 0) {
      for (const itemStatusUpdate of updateDto.itemStatuses) {
        const item = batch.items.find(i => i.productId.toString() === itemStatusUpdate.productId);
        if (item) {
          item.itemStatus = ItemStatusEnum[itemStatusUpdate.status as keyof typeof ItemStatusEnum] as typeof item.itemStatus;
          item.chefId = new Types.ObjectId(chefId);
          switch (itemStatusUpdate.status) {
            case 'PREPARING':
              item.preparationStartedAt = new Date();
              break;
            case 'READY':
              item.readyAt = new Date();
              break;
          }
        }
      }
    } else {
      // fallback: update toate itemele la batchStatus
      batch.items.forEach(item => {
        item.itemStatus = updateDto.batchStatus;
        item.chefId = new Types.ObjectId(chefId);
        switch (updateDto.batchStatus) {
          case 'PREPARING':
            item.preparationStartedAt = new Date();
            break;
          case 'READY':
            item.readyAt = new Date();
            break;
        }
      });
    }
    // Update batch-level timestamps
    switch (updateDto.batchStatus) {
      case 'READY':
        batch.allItemsReadyAt = new Date();
        break;
    }
    // Check if all batches are ready
    const allBatchesReady = order.batches!.every(b =>
      b.batchStatus === 'READY' || b.batchStatus === 'SERVED'
    );
    if (allBatchesReady && order.status !== OrderStatusEnum.ALL_READY) {
      order.status = OrderStatusEnum.ALL_READY;
    }
    const updatedOrder = await order.save();
    // Emit Kafka event for batch status change
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      waiterId: updatedOrder.waiterId?.toString(),
      orderType: updatedOrder.orderType,
      status: `BATCH_${updateDto.batchStatus}`,
      timestamp: new Date(),
      metadata: {
        batchNumber: updateDto.batchNumber,
        oldStatus: oldStatus,
        newStatus: updateDto.batchStatus,
        chefId: chefId,
        timestamp: new Date(),
        tableNumber: updatedOrder.tableNumber,
      },
    };
    
    // Emit specific event based on status following DELIVERY PATTERN
    switch (updateDto.batchStatus) {
      case 'PREPARING':
        event.status = 'BATCH_PREPARING';
        await this.kafkaService.emitOrderEvent(event);
        break;
      case 'READY':
        event.status = 'BATCH_READY';
        await this.kafkaService.emitOrderEvent(event);
        break;
      default:
        await this.kafkaService.emitOrderEvent(event);
    }
    
    return updatedOrder;
  }

  // Serve complete batch (used by waiter)
  async serveBatch(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    serveDto: ServeBatchDto,
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);
    const batchNum = Number(serveDto.batchNumber);
    const batch = order.batches!.find(b => b.batchNumber === batchNum);
    if (!batch) {
      throw new BadRequestException(`Batch ${serveDto.batchNumber} not found`);
    }
    if (batch.batchStatus !== 'READY') {
      throw new BadRequestException(`Batch ${serveDto.batchNumber} is not ready for service`);
    }
    batch.batchStatus = 'SERVED';
    batch.allItemsServedAt = new Date();
    batch.items.forEach(item => {
      item.itemStatus = 'SERVED';
      item.servedAt = new Date();
    });
    
    // Add serve notes to waiter notes
    if (serveDto.note) {
      order.waiterNotes = (order.waiterNotes || '') + `\nServed Batch ${serveDto.batchNumber}: ${serveDto.note}`;
    }
    // Check if all batches are served
    const allBatchesServed = order.batches!.every(b => b.batchStatus === 'SERVED');
    if (allBatchesServed) {
      order.status = 'SERVED';
    } else {
      order.status = 'PARTIAL_SERVED';
    }
    order.updatedAt = new Date();
    const updatedOrder = await order.save();
    // Emit event following DELIVERY PATTERN (use emitOrderEvent)
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      waiterId: waiterId,
      orderType: updatedOrder.orderType,
      status: 'BATCH_SERVED',
      timestamp: new Date(),
      metadata: {
        batchNumber: serveDto.batchNumber,
        servedAt: new Date(),
        waiterId: waiterId,
        tableNumber: updatedOrder.tableNumber,
        note: serveDto.note,
      },
    };
    await this.kafkaService.emitOrderEvent(event);
    
    return updatedOrder;
  }

  // Add new batch to existing order
  async addBatchToOrder(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    batchDto: AddBatchToOrderDto,
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);

    // Calculate next batch number
    const nextBatchNumber = Math.max(...order.batches!.map(b => b.batchNumber)) + 1;

    // Fetch prices for all items and build batch items
    const batchItems: DineInOrderBatchItem[] = [];
    let batchTotal = 0;

    for (const item of batchDto.items) {
      const product = await this.productsService.getProductById(restaurantId, item.productId);
      const itemPrice = product.price;
      const itemTotal = itemPrice * item.quantity;
      batchTotal += itemTotal;

      batchItems.push({
        productId: new Types.ObjectId(item.productId),
        quantity: item.quantity,
        price: itemPrice,
        specialInstructions: item.specialInstructions,
        itemStatus: 'PENDING',
        sentToKitchenAt: undefined,
        kitchenAcceptedAt: undefined,
        preparationStartedAt: undefined,
        readyAt: undefined,
        servedAt: undefined,
        chefId: undefined,
      });
    }

    // Create new batch
    const newBatch: DineInOrderBatch = {
      batchNumber: nextBatchNumber,
      items: batchItems,
      batchStatus: batchDto.sendToKitchen ? 'SENT_TO_KITCHEN' : 'PENDING',
      batchNote: batchDto.batchNote,
      sentToKitchenAt: batchDto.sendToKitchen ? new Date() : undefined,
      kitchenAcceptedAt: undefined,
      allItemsReadyAt: undefined,
      allItemsServedAt: undefined,
      chefId: undefined,
    };

    // If sending to kitchen, update item statuses
    if (batchDto.sendToKitchen) {
      newBatch.items.forEach(item => {
        item.itemStatus = 'SENT_TO_KITCHEN';
        item.sentToKitchenAt = new Date();
      });
    }

    // Add batch to order
    order.batches!.push(newBatch as any);
    order.totalAmount += batchTotal;

    const updatedOrder = await order.save();

    // Emit appropriate Kafka event
    if (batchDto.sendToKitchen) {
      const event: BatchSentToKitchenEvent = {
        orderId: updatedOrder._id.toString(),
        restaurantId: updatedOrder.restaurantId.toString(),
        customerId: updatedOrder.customerId.toString(),
        orderType: updatedOrder.orderType,
        status: OrderStatusEnum.PARTIAL_KITCHEN,
        timestamp: new Date(),
        metadata: {
          batchNumber: nextBatchNumber,
          itemIds: batchItems.map(item => item.productId.toString()),
          sentAt: new Date(),
        },
      };
      await this.kafkaService.emitBatchSentToKitchen(event);
    }

    return updatedOrder;
  }

  // Request payment for dine-in order
  async requestPayment(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    requestDto: RequestPaymentDto,
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);

    // Check if all batches are served
    const allBatchesServed = order.batches!.every(b => b.batchStatus === 'SERVED');
    if (!allBatchesServed) {
      throw new BadRequestException('Cannot request payment until all items are served');
    }

    order.status = OrderStatusEnum.PAYMENT_REQUESTED;
    order.paymentStatus = 'REQUESTED';

    const updatedOrder = await order.save();

    // Emit Kafka event
    const event: PaymentRequestedEvent = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      orderType: updatedOrder.orderType,
      status: OrderStatusEnum.PAYMENT_REQUESTED,
      timestamp: new Date(),
      metadata: {
        totalAmount: updatedOrder.totalAmount,
        waiterId: waiterId,
        note: requestDto.note,
      },
    };
    
    await this.kafkaService.emitPaymentRequested(event);

    return updatedOrder;
  }

  // Complete payment for dine-in order
  async completePayment(
    orderId: string,
    restaurantId: string,
    waiterId: string,
    paymentDto: CompletePaymentDto,
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);
    if (order.status !== OrderStatusEnum.PAYMENT_REQUESTED) {
      throw new BadRequestException('Payment has not been requested for this order');
    }
    order.status = OrderStatusEnum.DINE_IN_COMPLETED;
    order.paymentStatus = 'COMPLETED';
    // Adaugam detalii plata
    (order as any).paymentMethod = paymentDto.paymentMethod;
    (order as any).amountPaid = paymentDto.amountPaid;
    // Add waiter completion notes
    if (paymentDto.note) {
      order.waiterNotes = (order.waiterNotes || '') + `\nPayment completed: ${paymentDto.note}`;
    }
    order.updatedAt = new Date();
    const updatedOrder = await order.save();
    // Emit Kafka event
    const event: DineInCompletedEvent = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      orderType: updatedOrder.orderType,
      status: OrderStatusEnum.DINE_IN_COMPLETED,
      timestamp: new Date(),
      metadata: {
        totalAmount: updatedOrder.totalAmount,
        paymentMethod: paymentDto.paymentMethod,
        amountPaid: paymentDto.amountPaid,
        waiterId: waiterId,
        completedAt: new Date(),
      },
    };
    await this.kafkaService.emitDineInCompleted(event);
    
    return updatedOrder;
  }

  // Utility methods
  async getDineInOrderById(orderId: string, restaurantId: string): Promise<OrderDocument> {
    const query: any = { 
      _id: new Types.ObjectId(orderId),
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DINE_IN'
    };

    const order = await this.orderModel.findOne(query).exec();
    if (!order) {
      throw new NotFoundException(`Dine-in order with id ${orderId} not found`);
    }
    if (!order.batches) {
      throw new BadRequestException('This is not a valid dine-in order (missing batches)');
    }
    return order;
  }

  async getActiveDineInOrders(restaurantId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DINE_IN',
      status: { $in: [
        OrderStatusEnum.DRAFT, 
        OrderStatusEnum.PARTIAL_KITCHEN, 
        OrderStatusEnum.KITCHEN_ACCEPTED, 
        OrderStatusEnum.PREPARING, 
        OrderStatusEnum.ALL_READY, 
        OrderStatusEnum.PARTIAL_SERVED
      ]},
    }).exec();
  }

  async getOrdersReadyForService(restaurantId: string): Promise<OrderDocument[]> {
    return this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DINE_IN',
      'batches.batchStatus': 'READY',
    }).exec();
  }

  async updateItemStatus(
    orderId: string,
    restaurantId: string,
    batchNumber: number,
    productId: string,
    chefId: string,
    status: string
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);
    const batchNum = Number(batchNumber);
    const batch = order.batches!.find(b => b.batchNumber === batchNum);
    if (!batch) {
      throw new BadRequestException(`Batch ${batchNumber} not found`);
    }
    const item = batch.items.find(i => i.productId.toString() === productId);
    if (!item) {
      throw new BadRequestException(`Item with productId ${productId} not found in batch ${batchNumber}`);
    }
    // type guard pentru status
    const allowed: string[] = [
      'PENDING', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'SENT_TO_KITCHEN'
    ];
    if (!allowed.includes(status)) {
      throw new BadRequestException('Invalid item status');
    }
    item.itemStatus = ItemStatusEnum[status as keyof typeof ItemStatusEnum] as typeof item.itemStatus;
    item.chefId = new Types.ObjectId(chefId);
    switch (status) {
      case 'PREPARING':
        item.preparationStartedAt = new Date();
        break;
      case 'READY':
        item.readyAt = new Date();
        break;
    }
    // Optionally, update batch status if all items are READY
    if (batch.items.every(i => i.itemStatus === 'READY')) {
      batch.batchStatus = 'READY';
      batch.allItemsReadyAt = new Date();
    }
    const updatedOrder = await order.save();
    
    return updatedOrder;
  }

  async batchPreparing(
    orderId: string,
    restaurantId: string,
    batchNumber: number,
    chefId: string,
    note?: string
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);
    const batchNum = Number(batchNumber);
    const batch = order.batches!.find(b => b.batchNumber === batchNum);
    if (!batch) {
      throw new BadRequestException(`Batch ${batchNumber} not found`);
    }
    batch.batchStatus = 'PREPARING';
    batch.chefId = new Types.ObjectId(chefId);
    batch.kitchenAcceptedAt = batch.kitchenAcceptedAt || new Date();
    batch.preparationStartedAt = new Date();
    batch.items.forEach(item => {
      item.itemStatus = 'PREPARING';
      item.chefId = new Types.ObjectId(chefId);
      item.preparationStartedAt = new Date();
    });
    if (note) {
      // Initialize kitchenDetails if needed for notes
      if (!order.kitchenDetails) {
        order.kitchenDetails = {};
      }
      order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\nBatch ${batchNumber}: ${note}`;
    }
    // Daca e primul batch PREPARING, seteaza order.status
    if (order.status !== 'PREPARING') {
      order.status = 'PREPARING';
    }
    order.updatedAt = new Date();
    const updatedOrder = await order.save();
    
    // Emit event following DELIVERY PATTERN (use emitOrderEvent)
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      waiterId: updatedOrder.waiterId?.toString(),
      orderType: updatedOrder.orderType,
      status: 'BATCH_PREPARING',
      timestamp: new Date(),
      metadata: {
        batchNumber,
        chefId,
        tableNumber: updatedOrder.tableNumber,
        note,
      },
    };
    
    await this.kafkaService.emitOrderEvent(event);
    
    return updatedOrder;
  }

  async batchReady(
    orderId: string,
    restaurantId: string,
    batchNumber: number,
    chefId: string,
    note?: string
  ): Promise<OrderDocument> {
    const order = await this.getDineInOrderById(orderId, restaurantId);
    const batchNum = Number(batchNumber);
    const batch = order.batches!.find(b => b.batchNumber === batchNum);
    if (!batch) {
      throw new BadRequestException(`Batch ${batchNumber} not found`);
    }
    batch.batchStatus = 'READY';
    batch.chefId = new Types.ObjectId(chefId);
    batch.allItemsReadyAt = new Date();
    batch.readyAt = new Date();
    batch.items.forEach(item => {
      item.itemStatus = 'READY';
      item.chefId = new Types.ObjectId(chefId);
      item.readyAt = new Date();
    });
    if (note) {
      // Initialize kitchenDetails if needed for notes
      if (!order.kitchenDetails) {
        order.kitchenDetails = {};
      }
      order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\nBatch ${batchNumber}: ${note}`;
    }
    // Daca toate batch-urile sunt READY, seteaza order.status
    const allBatchesReady = order.batches!.every(b => b.batchStatus === 'READY');
    if (allBatchesReady) {
      order.status = 'ALL_READY';
    }
    order.updatedAt = new Date();
    const updatedOrder = await order.save();
    
    // Emit event following DELIVERY PATTERN (use emitOrderEvent)
    const event: any = {
      orderId: updatedOrder._id.toString(),
      restaurantId: updatedOrder.restaurantId.toString(),
      customerId: updatedOrder.customerId.toString(),
      waiterId: updatedOrder.waiterId?.toString(),
      orderType: updatedOrder.orderType,
      status: 'BATCH_READY',
      timestamp: new Date(),
      metadata: {
        batchNumber,
        chefId,
        tableNumber: updatedOrder.tableNumber,
        note,
      },
    };
    
    await this.kafkaService.emitOrderEvent(event);
    
    return updatedOrder;
  }

  // ======================== SPECIFIC KITCHEN/WAITER FILTERING METHODS ========================

  async getPendingDineInOrdersForKitchen(restaurantId: string): Promise<{ orders: OrderDocument[] }> {
    // Find dine-in orders that have batches with status 'SENT_TO_KITCHEN' (pending kitchen acceptance)
    // BUT exclude orders that have any batches already accepted by kitchen
    const orders = await this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DINE_IN',
      'batches.batchStatus': 'SENT_TO_KITCHEN'
    }).exec();
    
    // Filter out orders that have any batches already accepted by kitchen
    const filteredOrders = orders.filter(order => {
      // Check if any batch is already accepted/preparing/ready
      const hasAcceptedBatches = order.batches?.some(batch => 
        ['KITCHEN_ACCEPTED', 'PREPARING', 'READY'].includes(batch.batchStatus)
      );
      return !hasAcceptedBatches;
    });
    
    return { orders: filteredOrders };
  }

  async getAcceptedDineInOrdersForKitchen(restaurantId: string): Promise<{ orders: OrderDocument[] }> {
    // Find dine-in orders that have been accepted by kitchen but not all batches are ready
    const orders = await this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DINE_IN',
      $and: [
        { 'batches.batchStatus': { $in: ['KITCHEN_ACCEPTED', 'PREPARING'] } },
        { 'batches.batchStatus': { $ne: 'READY' } }
      ]
    }).exec();
    
    return { orders };
  }

  async getReadyDineInOrdersForKitchen(restaurantId: string): Promise<{ orders: OrderDocument[] }> {
    // Find dine-in orders with ready batches (ALL_READY status, SERVED, PAYMENT_REQUESTED)
    // These are orders ready for waiter service but kitchen still needs to see them
    const orders = await this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DINE_IN',
      status: { 
        $in: ['ALL_READY', 'SERVED', 'PAYMENT_REQUESTED'] 
      }
    }).exec();
    
    return { orders };
  }

  async getCurrentOrdersForWaiter(restaurantId: string): Promise<{ orders: OrderDocument[] }> {
    // Get all orders that are not completed/cancelled (active orders)
    const orders = await this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      status: { 
        $nin: [
          'COMPLETED', 
          'CANCELLED', 
          'DINE_IN_COMPLETED',
          'DELIVERED',
          'PICKED_UP'
        ] 
      }
    }).sort({ createdAt: -1 }).exec();
    
    return { orders };
  }

  async getCompletedOrdersForWaiter(restaurantId: string): Promise<{ orders: OrderDocument[] }> {
    // Get recently completed orders (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const orders = await this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      status: { 
        $in: [
          'COMPLETED', 
          'DINE_IN_COMPLETED',
          'DELIVERED',
          'PICKED_UP'
        ] 
      },
      updatedAt: { $gte: yesterday }
    }).sort({ updatedAt: -1 }).exec();
    
    return { orders };
  }

  async getReadyBatchesForWaiter(restaurantId: string): Promise<{ orders: OrderDocument[] }> {
    // Get dine-in orders that are ready for service (similar to how getAcceptedDineInOrdersForKitchen works)
    // Include orders with status: ALL_READY, PARTIAL_SERVED, SERVED, PAYMENT_REQUESTED
    // Exclude completed orders
    const orders = await this.orderModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      orderType: 'DINE_IN',
      status: { 
        $in: ['ALL_READY', 'PARTIAL_SERVED', 'SERVED', 'PAYMENT_REQUESTED'] 
      }
    }).exec();
    
    return { orders };
  }
} 