import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { KitchenAcceptOrderDto, KitchenStartPreparingDto, KitchenMarkReadyDto, OrderStatusEnum, OrderStatus, ORDER_TOPICS } from '@rm/common';
import { KafkaService } from '../../kafka/kafka.service';
import { KitchenResponsesController } from '../kafka/kitchen-responses.controller';

import { 
  KitchenAcceptTakeawayEvent,
  KitchenPreparingTakeawayEvent,
  KitchenReadyTakeawayEvent,
  KitchenAcceptDeliveryEvent,
  KitchenPreparingDeliveryEvent,
  KitchenReadyDeliveryEvent,
  KitchenAcceptDeliveryOrderDto,
  KitchenAcceptTakeawayOrderDto,
  KitchenStartPreparingDeliveryOrderDto,
  KitchenStartPreparingTakeawayOrderDto,
  KitchenMarkReadyDeliveryOrderDto,
  KitchenMarkReadyTakeawayOrderDto,
  KitchenAcceptBatchEvent,
  KitchenBatchPreparingEvent,
  KitchenBatchReadyEvent,
  KitchenItemPreparingEvent,
  KitchenItemReadyEvent,
  KitchenAcceptBatchDto,
  UpdateBatchStatusDto,
  KitchenGetPendingOrdersRequestEvent,
  KitchenGetDineInPendingRequestEvent,
  KitchenGetActiveOrdersRequestEvent,
  KitchenGetReadyTakeawayRequestEvent,
  KitchenGetReadyDeliveryRequestEvent,
  KitchenGetDineInAcceptedRequestEvent,
  KitchenGetPendingTakeawayRequestEvent,
  KitchenGetPendingDeliveryRequestEvent,
  KitchenGetInProgressDeliveryRequestEvent
} from '@rm/common';



@Injectable()
export class KitchenService {
  constructor(
    private readonly httpService: HttpService,
    private readonly kafkaService: KafkaService,
    private readonly kitchenResponsesController: KitchenResponsesController,
  ) {}

  async getPendingOrders(restaurantId: string, token: string) {
    console.log(`[KitchenService] Getting pending orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `pending-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: KitchenGetPendingOrdersRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get pending orders request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetPendingOrdersRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching pending orders:`, error.message);
      return { orders: [] };
    }
  }

  async acceptOrder(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenAcceptOrderDto,
    token: string,
  ) {
    console.log(`[KitchenService] Accepting regular order: ${orderId} by chef: ${chefId}`);
    
    // This method handles regular dine-in orders
    // Emit Kafka event for dine-in batch acceptance
    const event: any = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'KITCHEN_ACCEPTED',
      timestamp: new Date(),
      metadata: {
        chefId,
        batchNumber: 1, // Default batch for regular orders
        acceptedAt: new Date(),
        estimatedPrepTime: body.estimatedPrepTime,
        note: body.kitchenNote || `Accepted by chef ${chefId}`,
      },
    };

    console.log(`[KitchenService] Emitting dine-in.kitchen.accept-batch event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenAcceptBatch(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Order accepted by kitchen' };
  }

  async startPreparing(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenStartPreparingDto,
    token: string,
  ) {
    console.log(`[KitchenService] Starting preparation for regular order: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event for dine-in batch preparing
    const event: any = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'PREPARING',
      timestamp: new Date(),
      metadata: {
        chefId,
        batchNumber: 1, // Default batch for regular orders
        preparingAt: new Date(),
        note: body.note || `Started by chef ${chefId}`,
      },
    };

    console.log(`[KitchenService] Emitting dine-in.kitchen.batch-preparing event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenBatchPreparing(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Order preparation started' };
  }

  async markReady(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenMarkReadyDto,
    token: string,
  ) {
    console.log(`[KitchenService] Marking regular order as ready: ${orderId} by chef: ${chefId}`);
    
    // For regular orders, assume they are dine-in orders
    // Emit Kafka event for dine-in batch ready
    const event: any = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'READY',
      timestamp: new Date(),
      metadata: {
        chefId,
        batchNumber: 1, // Default batch for regular orders
        readyAt: new Date(),
        note: body.note || `Ready - prepared by chef ${chefId}`,
      },
    };

    console.log(`[KitchenService] Emitting dine-in.kitchen.batch-ready event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenBatchReady(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Order marked as READY' };
  }

  async getActiveOrders(restaurantId: string, token: string) {
    console.log(`[KitchenService] Getting active orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `active-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: KitchenGetActiveOrdersRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get active orders request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetActiveOrdersRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received active orders response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for active orders request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in active orders response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching active orders:`, error.message);
      return { orders: [] };
    }
  }

  // ======================== TAKEAWAY METHODS ========================

  async acceptTakeawayOrder(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenAcceptTakeawayOrderDto,
  ) {
    console.log(`[KitchenService] Accepting takeaway order: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event for menu-order-service processing
    const event: KitchenAcceptTakeawayEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'TAKEAWAY',
      status: 'KITCHEN_ACCEPTED',
      timestamp: new Date(),
      metadata: {
        chefId,
        acceptedItems: [], // Will be filled by consumer
        acceptedAt: new Date(),
        estimatedPrepTime: body.estimatedPrepTime,
        note: body.note,
      },
    };

    console.log(`[KitchenService] Emitting takeaway.kitchen.accept event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenAcceptTakeaway(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Takeaway order accepted by kitchen' };
  }

  async preparingTakeawayOrder(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenStartPreparingTakeawayOrderDto,
  ) {
    console.log(`[KitchenService] Marking takeaway order as preparing: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event for menu-order-service processing
    const event: KitchenPreparingTakeawayEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'TAKEAWAY',
      status: 'PREPARING',
      timestamp: new Date(),
      metadata: {
        chefId,
        preparationStartedAt: new Date(),
        note: body.note,
      },
    };

    console.log(`[KitchenService] Emitting takeaway.kitchen.preparing event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenPreparingTakeaway(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Takeaway order marked as preparing' };
  }

  async readyTakeawayOrder(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenMarkReadyTakeawayOrderDto,
  ) {
    console.log(`[KitchenService] Marking takeaway order as ready: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event for menu-order-service processing
    const event: KitchenReadyTakeawayEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'TAKEAWAY',
      status: 'READY',
      timestamp: new Date(),
      metadata: {
        chefId,
        readyAt: new Date(),
        note: body.note,
      },
    };

    console.log(`[KitchenService] Emitting takeaway.kitchen.ready event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenReadyTakeaway(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Takeaway order marked as ready' };
  }

  async getReadyTakeawayOrders(restaurantId: string, token?: string) {
    console.log(`[KitchenService] Getting ready takeaway orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `ready-takeaway-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: KitchenGetReadyTakeawayRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get ready takeaway request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetReadyTakeawayRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received ready takeaway response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for ready takeaway request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in ready takeaway response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching ready takeaway orders:`, error.message);
      return { orders: [] };
    }
  }

  async getPendingTakeawayOrders(restaurantId: string, token?: string) {
    console.log(`[KitchenService] Getting pending takeaway orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `takeaway-pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: KitchenGetPendingTakeawayRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get pending takeaway request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetPendingTakeawayRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received takeaway response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for takeaway request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in takeaway response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching pending takeaway orders:`, error.message);
      return { orders: [] };
    }
  }

  // ======================== DELIVERY METHODS ========================

  async acceptDeliveryOrder(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenAcceptDeliveryOrderDto,
  ) {
    console.log(`[KitchenService] Accepting delivery order: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event for menu-order-service processing
    const event: KitchenAcceptDeliveryEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DELIVERY',
      status: 'KITCHEN_ACCEPTED',
      timestamp: new Date(),
      metadata: {
        chefId,
        acceptedItems: [], // Will be filled by consumer
        acceptedAt: new Date(),
        estimatedPrepTime: body.estimatedPrepTime,
        note: body.note,
      },
    };

    console.log(`[KitchenService] Emitting delivery.kitchen.accept event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenAcceptDelivery(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Delivery order accepted by kitchen' };
  }

  async preparingDeliveryOrder(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenStartPreparingDeliveryOrderDto,
  ) {
    console.log(`[KitchenService] Marking delivery order as preparing: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event for menu-order-service processing
    const event: KitchenPreparingDeliveryEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DELIVERY',
      status: 'PREPARING',
      timestamp: new Date(),
      metadata: {
        chefId,
        preparationStartedAt: new Date(),
        note: body.note,
      },
    };

    console.log(`[KitchenService] Emitting delivery.kitchen.preparing event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenPreparingDelivery(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Delivery order marked as preparing' };
  }

  async readyDeliveryOrder(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenMarkReadyDeliveryOrderDto,
  ) {
    console.log(`[KitchenService] Marking delivery order as ready: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event for menu-order-service processing
    const event: KitchenReadyDeliveryEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DELIVERY',
      status: 'READY_FOR_DELIVERY',
      timestamp: new Date(),
      metadata: {
        chefId,
        readyAt: new Date(),
        note: body.note,
      },
    };

    console.log(`[KitchenService] Emitting delivery.kitchen.ready event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenReadyDelivery(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Delivery order marked as ready' };
  }

  async getReadyDeliveryOrders(restaurantId: string, token?: string) {
    console.log(`[KitchenService] Getting ready delivery orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `ready-delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: KitchenGetReadyDeliveryRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get ready delivery request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetReadyDeliveryRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received ready delivery response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for ready delivery request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in ready delivery response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching ready delivery orders:`, error.message);
      return { orders: [] };
    }
  }

  async getPendingDeliveryOrders(restaurantId: string, token?: string) {
    console.log(`[KitchenService] Getting pending delivery orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `delivery-pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: KitchenGetPendingDeliveryRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get pending delivery request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetPendingDeliveryRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received delivery response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for delivery request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in delivery response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching pending delivery orders:`, error.message);
      return { orders: [] };
    }
  }

  async getInProgressDeliveryOrders(restaurantId: string, token?: string) {
    console.log(`[KitchenService] Getting in progress delivery orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `delivery-in-progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: KitchenGetInProgressDeliveryRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get in progress delivery request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetInProgressDeliveryRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received in progress delivery response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for in progress delivery request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in in progress delivery response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching in progress delivery orders:`, error.message);
      return { orders: [] };
    }
  }

  // ======================== DINE-IN METHODS ========================

  async acceptDineInBatch(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: KitchenAcceptBatchDto,
  ) {
    console.log(`[KitchenService] Accepting dine-in batch for order: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event for menu-order-service processing
    const event: KitchenAcceptBatchEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'KITCHEN_ACCEPTED',
      timestamp: new Date(),
      metadata: {
        chefId,
        batchNumber: body.batchNumber,
        acceptedAt: new Date(),
        estimatedPrepTime: body.note, // Note in DTO field maps to estimatedPrepTime
        note: body.note,
      },
    };

    console.log(`[KitchenService] Emitting dine-in.kitchen.accept-batch event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenAcceptBatch(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Dine-in batch accepted by kitchen' };
  }

  async updateDineInBatchStatus(
    restaurantId: string,
    orderId: string,
    chefId: string,
    body: UpdateBatchStatusDto,
  ) {
    console.log(`[KitchenService] Updating dine-in batch status for order: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event based on status
    if (body.batchStatus === 'PREPARING') {
      const event: KitchenBatchPreparingEvent = {
        orderId,
        restaurantId,
        customerId: '', // Will be filled by consumer
        orderType: 'DINE_IN',
        status: 'PREPARING',
        timestamp: new Date(),
        metadata: {
          chefId,
          batchNumber: body.batchNumber,
          preparingAt: new Date(),
          note: body.note,
        },
      };

      console.log(`[KitchenService] Emitting dine-in.kitchen.batch-preparing event:`, JSON.stringify(event, null, 2));
      await this.kafkaService.emitKitchenBatchPreparing(event);
    } else if (body.batchStatus === 'READY') {
      const event: KitchenBatchReadyEvent = {
        orderId,
        restaurantId,
        customerId: '', // Will be filled by consumer
        orderType: 'DINE_IN',
        status: 'READY',
        timestamp: new Date(),
        metadata: {
          chefId,
          batchNumber: body.batchNumber,
          readyAt: new Date(),
          note: body.note,
        },
      };

      console.log(`[KitchenService] Emitting dine-in.kitchen.batch-ready event:`, JSON.stringify(event, null, 2));
      await this.kafkaService.emitKitchenBatchReady(event);
    }
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: `Dine-in batch status updated to ${body.batchStatus}` };
  }

  async preparingDineInBatch(
    restaurantId: string,
    orderId: string,
    chefId: string,
    batchNumber: number,
    body: { note?: string },
  ) {
    console.log(`[KitchenService] Marking dine-in batch ${batchNumber} as preparing: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event
    const event: KitchenBatchPreparingEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'PREPARING',
      timestamp: new Date(),
      metadata: {
        chefId,
        batchNumber,
        preparingAt: new Date(),
        note: body.note,
      },
    };

    console.log(`[KitchenService] Emitting dine-in.kitchen.batch-preparing event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenBatchPreparing(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Dine-in batch marked as preparing' };
  }

  async readyDineInBatch(
    restaurantId: string,
    orderId: string,
    chefId: string,
    batchNumber: number,
    body: { note?: string },
  ) {
    console.log(`[KitchenService] Marking dine-in batch ${batchNumber} as ready: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event
    const event: KitchenBatchReadyEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DINE_IN',
      status: 'READY',
      timestamp: new Date(),
      metadata: {
        chefId,
        batchNumber,
        readyAt: new Date(),
        note: body.note,
      },
    };

    console.log(`[KitchenService] Emitting dine-in.kitchen.batch-ready event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitKitchenBatchReady(event);
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: 'Dine-in batch marked as ready' };
  }

  async updateDineInItemStatus(
    restaurantId: string,
    orderId: string,
    chefId: string,
    batchNumber: number,
    productId: string,
    body: { status: string; note?: string },
  ) {
    console.log(`[KitchenService] Updating dine-in item status for product ${productId} in batch ${batchNumber}: ${orderId} by chef: ${chefId}`);
    
    // Emit Kafka event based on status
    if (body.status === 'PREPARING') {
      const event: KitchenItemPreparingEvent = {
        orderId,
        restaurantId,
        customerId: '', // Will be filled by consumer
        orderType: 'DINE_IN',
        status: 'PREPARING',
        timestamp: new Date(),
        metadata: {
          chefId,
          batchNumber,
          productId,
          preparingAt: new Date(),
          note: body.note,
        },
      };

      console.log(`[KitchenService] Emitting dine-in.kitchen.item-preparing event:`, JSON.stringify(event, null, 2));
      await this.kafkaService.emitKitchenItemPreparing(event);
    } else if (body.status === 'READY') {
      const event: KitchenItemReadyEvent = {
        orderId,
        restaurantId,
        customerId: '', // Will be filled by consumer
        orderType: 'DINE_IN',
        status: 'READY',
        timestamp: new Date(),
        metadata: {
          chefId,
          batchNumber,
          productId,
          readyAt: new Date(),
          note: body.note,
        },
      };

      console.log(`[KitchenService] Emitting dine-in.kitchen.item-ready event:`, JSON.stringify(event, null, 2));
      await this.kafkaService.emitKitchenItemReady(event);
    }
    
    console.log(`[KitchenService] Event emitted successfully`);

    return { success: true, message: `Dine-in item status updated to ${body.status}` };
  }

  async getPendingDineInOrders(restaurantId: string, token?: string) {
    console.log(`[KitchenService] Getting pending dine-in orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `dine-in-pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: KitchenGetDineInPendingRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get dine-in pending request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetDineInPendingRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received dine-in response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for dine-in request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in dine-in response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching pending dine-in orders:`, error.message);
      return { orders: [] };
    }
  }

  async getAcceptedDineInOrders(restaurantId: string, token?: string) {
    console.log(`[KitchenService] Getting accepted dine-in orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `dine-in-accepted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: KitchenGetDineInAcceptedRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get dine-in accepted request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetDineInAcceptedRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received dine-in accepted response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for dine-in accepted request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in dine-in accepted response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching accepted dine-in orders:`, error.message);
      return { orders: [] };
    }
  }

  async getReadyDineInOrders(restaurantId: string, token?: string) {
    console.log(`[KitchenService] Getting ready dine-in orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `dine-in-ready-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'kitchen-service'
        }
      };

      console.log(`[KitchenService] Sending kitchen get dine-in ready request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request via Kafka and wait for response
      const responseObservable = await this.kafkaService.sendKitchenGetDineInReadyRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[KitchenService] Received dine-in ready response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[KitchenService] Received successful response for dine-in ready request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[KitchenService] Error in dine-in ready response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[KitchenService] Error fetching ready dine-in orders:`, error.message);
      return { orders: [] };
    }
  }


} 