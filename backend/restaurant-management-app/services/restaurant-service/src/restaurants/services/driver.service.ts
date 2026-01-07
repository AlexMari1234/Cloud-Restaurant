import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { 
  OrderEvent, 
  OrderStatus, 
  OrderStatusEnum, 
  DriverAcceptDeliveryEvent, 
  DriverPickupDeliveryEvent, 
  DriverDeliverOrderEvent,
  DriverGetReadyOrdersRequestEvent,
  DriverGetAssignedOrdersRequestEvent,
  DriverGetCompletedOrdersRequestEvent
} from '@rm/common';
import { KafkaService } from '../../kafka/kafka.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DriverService {

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly httpService: HttpService,
  ) {}

  // ======================== DRIVER CONTROLLER BUSINESS LOGIC METHODS ========================

  async getReadyOrders(restaurantId: string, token: string) {
    console.log(`[DriverService] Getting ready orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `ready-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: DriverGetReadyOrdersRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'driver-service'
        }
      };

      console.log(`[DriverService] Sending driver get ready orders request:`, JSON.stringify(requestEvent, null, 2));
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendDriverGetReadyOrdersRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      console.log(`[DriverService] Received ready orders response:`, JSON.stringify(response, null, 2));
      
      if (response && response.success) {
        console.log(`[DriverService] Received successful response for ready orders request: ${requestId}`);
        return { orders: response.orders || [] };
      } else {
        console.error(`[DriverService] Error in ready orders response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[DriverService] Error fetching ready orders:`, error.message);
      return { orders: [] };
    }
  }

  async acceptDelivery(
    restaurantId: string, 
    orderId: string, 
    driverId: string, 
    body: { estimatedDeliveryTime: string; note?: string }
  ) {
    console.log(`[DriverService] Driver accepting delivery order: ${orderId} by driver: ${driverId}`);
    
    // Emit Kafka event for menu-order-service processing
    const event: DriverAcceptDeliveryEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DELIVERY',
      status: 'DRIVER_ACCEPTED',
      timestamp: new Date(),
      metadata: {
        driverId,
        acceptedAt: new Date(),
        estimatedDeliveryTime: body.estimatedDeliveryTime,
        note: body.note,
      },
    };

    console.log(`[DriverService] Emitting delivery.driver.accept event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitDriverAcceptDelivery(event);
    
    console.log(`[DriverService] Event emitted successfully`);
    
    return { success: true, message: 'Order accepted by driver' };
  }

  async pickupDeliveryOrder(
    restaurantId: string, 
    orderId: string, 
    driverId: string, 
    body: { note?: string }
  ) {
    console.log(`[DriverService] Driver picking up delivery order: ${orderId} by driver: ${driverId}`);
    
    // Emit Kafka event instead of HTTP call
    const event: DriverPickupDeliveryEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DELIVERY',
      status: 'IN_DELIVERY',
      timestamp: new Date(),
      metadata: {
        driverId,
        pickedUpAt: new Date(),
        note: body.note,
      },
    };

    console.log(`[DriverService] Emitting delivery.driver.pickup event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitDriverPickupDelivery(event);
    
    console.log(`[DriverService] Event emitted successfully`);
    
    return { success: true, message: 'Order picked up for delivery' };
  }

  async deliverOrder(restaurantId: string, orderId: string, driverId: string, token: string) {
    console.log(`[DriverService] Driver delivering order: ${orderId} by driver: ${driverId}`);
    
    // Emit Kafka event instead of HTTP call
    const event: DriverDeliverOrderEvent = {
      orderId,
      restaurantId,
      customerId: '', // Will be filled by consumer
      orderType: 'DELIVERY',
      status: 'DELIVERED',
      timestamp: new Date(),
      metadata: {
        driverId,
        deliveredAt: new Date(),
        totalAmount: 0, // Will be filled by consumer
      },
    };

    console.log(`[DriverService] Emitting delivery.driver.deliver event:`, JSON.stringify(event, null, 2));
    
    await this.kafkaService.emitDriverDeliverOrder(event);
    
    console.log(`[DriverService] Event emitted successfully`);
    
    return { success: true, message: 'Order delivered successfully' };
  }

  async getAssignedOrders(restaurantId: string, token: string) {
    console.log(`[DriverService] Getting assigned orders for restaurant: ${restaurantId}`);
    try {
      // Generate unique request ID
      const requestId = `assigned-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: DriverGetAssignedOrdersRequestEvent = {
        requestId,
        restaurantId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'driver-service'
        }
      };
      
      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendDriverGetAssignedOrdersRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      if (response && response.success) {
        return { orders: response.orders || [] };
      } else {
        console.error(`[DriverService] Error in assigned orders response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[DriverService] Error fetching assigned orders:`, error.message);
      return { orders: [] };
    }
  }

  async getCompletedOrders(restaurantId: string, driverId: string, token: string) {
    console.log(`[DriverService] Getting completed orders for restaurant: ${restaurantId}, driver: ${driverId}`);
    try {
      // Generate unique request ID
      const requestId = `completed-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create request event
      const requestEvent: DriverGetCompletedOrdersRequestEvent = {
        requestId,
        restaurantId,
        driverId,
        timestamp: new Date(),
        metadata: {
          token,
          userId: 'driver-service'
        }
      };

      // Send request and wait for response
      const responseObservable = await this.kafkaService.sendDriverGetCompletedOrdersRequest(requestEvent);
      const response = await firstValueFrom(responseObservable);
      
      if (response && response.success) {
        return { orders: response.orders || [] };
      } else {
        console.error(`[DriverService] Error in completed orders response for request: ${requestId}`, response?.error);
        return { orders: [] };
      }
    } catch (error) {
      console.error(`[DriverService] Error fetching completed orders:`, error.message);
      return { orders: [] };
    }
  }
} 