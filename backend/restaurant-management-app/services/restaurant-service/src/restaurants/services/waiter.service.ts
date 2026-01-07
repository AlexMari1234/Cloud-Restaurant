import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { 
  CreateDineInOrderDto,
  SendBatchToKitchenDto,
  AddBatchToOrderDto,
  ServeBatchDto,
  RequestPaymentDto,
  CompletePaymentDto,
  WaiterCreateDineInEvent,
  WaiterSendBatchEvent,
  WaiterAddBatchEvent,
  WaiterServeBatchEvent,
  WaiterRequestPaymentEvent,
  WaiterCompletePaymentEvent,
  WaiterGetAllOrdersRequestEvent,
  WaiterGetReadyBatchesRequestEvent,
  WaiterGetCurrentOrdersRequestEvent,
  WaiterGetCompletedOrdersRequestEvent,
  WaiterGetReadyTakeawayRequestEvent
} from '@rm/common';
import { KafkaService } from '../../kafka/kafka.service';

@Injectable()
export class WaiterService {
  constructor(
    private readonly httpService: HttpService,
    private readonly kafkaService: KafkaService,
  ) {}

  async getReadyBatches(restaurantId: string, token: string) {
    console.log(`[WaiterService] Getting ready batches for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `ready-batches-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: WaiterGetReadyBatchesRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'waiter-service'
        }
      };

      console.log(`[WaiterService] Sending waiter get ready batches request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendWaiterGetReadyBatchesRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[WaiterService] Received ready batches response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[WaiterService] Received successful response for ready batches request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[WaiterService] Error in ready batches response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[WaiterService] Error fetching ready batches:`, error.message);
      return { orders: [] };
    }
  }

  async createDineInOrder(
    restaurantId: string,
    waiterId: string,
    createDto: CreateDineInOrderDto,
    token: string,
  ) {
    console.log(`[WaiterService] Creating dine-in order for restaurant: ${restaurantId} by waiter: ${waiterId}`);
    
    // Emit Kafka event for menu-order-service processing - NO temp ID, let menu-order-service create real order
    const event: WaiterCreateDineInEvent = {
      orderId: '', // Will be filled by menu-order-service when creating real order
      restaurantId,
      customerId: createDto.customerEmail || '',
      orderType: 'DINE_IN',
      status: 'PENDING',
      timestamp: new Date(),
      metadata: {
        waiterId,
        waiterEmail: '', // Will be filled by consumer
        customerEmail: createDto.customerEmail,
        customerName: createDto.customerName,
        tableNumber: createDto.tableNumber,
        items: createDto.batches.flatMap(batch => 
          batch.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: 0, // Will be filled by consumer
            specialInstructions: item.specialInstructions,
            status: 'PENDING',
          }))
        ),
        orderNotes: createDto.orderNotes,
      },
    };

    console.log(`[WaiterService] Emitting dine-in.waiter.create event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitWaiterCreateDineIn(event);
    
    console.log(`[WaiterService] Event emitted successfully`);

    return { success: true, message: 'Dine-in order creation request sent to menu-order-service' };
  }

  async sendBatchToKitchen(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    batchDto: SendBatchToKitchenDto,
    token: string,
  ) {
    console.log(`[WaiterService] Sending batch to kitchen: ${orderId} batch ${batchDto.batchNumber} by waiter: ${waiterId}`);
    
    // Emit Kafka event
    const event: WaiterSendBatchEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'SENT_TO_KITCHEN',
      timestamp: new Date(),
      metadata: {
        waiterId,
        batchNumber: batchDto.batchNumber,
        items: [], // Will be filled by consumer
        sentAt: new Date(),
        note: batchDto.kitchenNote,
      },
    };

    console.log(`[WaiterService] Emitting dine-in.waiter.send-batch event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitWaiterSendBatch(event);
    
    console.log(`[WaiterService] Event emitted successfully`);

    return { success: true, message: 'Batch sent to kitchen' };
  }

  async addBatchToOrder(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    batchDto: AddBatchToOrderDto,
    token: string,
  ) {
    console.log(`[WaiterService] Adding batch to order: ${orderId} by waiter: ${waiterId}`);
    
    // Emit Kafka event
    const event: WaiterAddBatchEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: batchDto.sendToKitchen ? 'SENT_TO_KITCHEN' : 'PENDING',
      timestamp: new Date(),
      metadata: {
        waiterId,
        batchNumber: 0, // Will be determined by consumer
        items: batchDto.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: 0, // Will be filled by consumer
          specialInstructions: item.specialInstructions,
          status: batchDto.sendToKitchen ? 'SENT_TO_KITCHEN' : 'PENDING',
        })),
        addedAt: new Date(),
        note: batchDto.batchNote,
      },
    };

    console.log(`[WaiterService] Emitting dine-in.waiter.add-batch event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitWaiterAddBatch(event);
    
    console.log(`[WaiterService] Event emitted successfully`);

    return { success: true, message: 'Batch added to order' };
  }

  async serveBatch(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    serveDto: ServeBatchDto,
    token: string,
  ) {
    console.log(`[WaiterService] Serving batch: ${orderId} batch ${serveDto.batchNumber} by waiter: ${waiterId}`);
    
    // Emit Kafka event
    const event: WaiterServeBatchEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'SERVED',
      timestamp: new Date(),
      metadata: {
        waiterId,
        batchNumber: serveDto.batchNumber,
        servedAt: new Date(),
        note: serveDto.note,
      },
    };

    console.log(`[WaiterService] Emitting dine-in.waiter.serve-batch event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitWaiterServeBatch(event);
    
    console.log(`[WaiterService] Event emitted successfully`);

    return { success: true, message: 'Batch served' };
  }

  async requestPayment(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    requestDto: RequestPaymentDto,
    token: string,
  ) {
    console.log(`[WaiterService] Requesting payment: ${orderId} by waiter: ${waiterId}`);
    
    // Emit Kafka event
    const event: WaiterRequestPaymentEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'PAYMENT_REQUESTED',
      timestamp: new Date(),
      metadata: {
        waiterId,
        requestedAt: new Date(),
        note: requestDto.note,
      },
    };

    console.log(`[WaiterService] Emitting dine-in.waiter.request-payment event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitWaiterRequestPayment(event);
    
    console.log(`[WaiterService] Event emitted successfully`);

    return { success: true, message: 'Payment requested' };
  }

  async completePayment(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    paymentDto: CompletePaymentDto,
    token: string,
  ) {
    console.log(`[WaiterService] Completing payment: ${orderId} by waiter: ${waiterId}`);
    
    // Emit Kafka event
    const event: WaiterCompletePaymentEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'COMPLETED',
      timestamp: new Date(),
      metadata: {
        waiterId,
        completedAt: new Date(),
        paymentMethod: paymentDto.paymentMethod,
        note: paymentDto.note,
      },
    };

    console.log(`[WaiterService] Emitting dine-in.waiter.complete-payment event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitWaiterCompletePayment(event);
    
    console.log(`[WaiterService] Event emitted successfully`);

    return { success: true, message: 'Payment completed' };
  }

  // ======================== VIEW METHODS ========================

  async getAllOrders(restaurantId: string, token: string) {
    console.log(`[WaiterService] Getting all orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `all-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: WaiterGetAllOrdersRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'waiter-service'
        }
      };

      console.log(`[WaiterService] Sending waiter get all orders request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendWaiterGetAllOrdersRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[WaiterService] Received all orders response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[WaiterService] Received successful response for all orders request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[WaiterService] Error in all orders response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[WaiterService] Error fetching all orders:`, error.message);
      return { orders: [] };
    }
  }

  async getReadyTakeawayOrders(restaurantId: string, token: string) {
    console.log(`[WaiterService] Getting ready takeaway orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `ready-takeaway-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: WaiterGetReadyTakeawayRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'waiter-service'
        }
      };

      console.log(`[WaiterService] Sending waiter get ready takeaway request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendWaiterGetReadyTakeawayRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[WaiterService] Received ready takeaway response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[WaiterService] Received successful response for ready takeaway request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[WaiterService] Error in ready takeaway response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[WaiterService] Error fetching ready takeaway orders:`, error.message);
      return { orders: [] };
    }
  }

  async pickupTakeawayOrder(
    restaurantId: string,
    orderId: string,
    waiterId: string,
    body: { customerName?: string; note?: string },
    token: string,
  ) {
    console.log(`[WaiterService] Pickup takeaway order: ${orderId} by waiter: ${waiterId}`);
    
    // Just emit Kafka event
    return { success: true, message: 'Takeaway order picked up' };
  }

  async getCurrentOrders(restaurantId: string, waiterId?: string, token?: string) {
    console.log(`[WaiterService] Getting current orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `current-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: WaiterGetCurrentOrdersRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: waiterId || 'waiter-service'
        }
      };

      console.log(`[WaiterService] Sending waiter get current orders request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendWaiterGetCurrentOrdersRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[WaiterService] Received current orders response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[WaiterService] Received successful response for current orders request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[WaiterService] Error in current orders response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[WaiterService] Error fetching current orders:`, error.message);
      return { orders: [] };
    }
  }

  async getCompletedOrders(restaurantId: string, waiterId?: string, token?: string) {
    console.log(`[WaiterService] Getting completed orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `completed-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: WaiterGetCompletedOrdersRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: waiterId || 'waiter-service'
        }
      };

      console.log(`[WaiterService] Sending waiter get completed orders request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendWaiterGetCompletedOrdersRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[WaiterService] Received completed orders response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[WaiterService] Received successful response for completed orders request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[WaiterService] Error in completed orders response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[WaiterService] Error fetching completed orders:`, error.message);
      return { orders: [] };
    }
  }
} 