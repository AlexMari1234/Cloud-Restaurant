import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, MessagePattern } from '@nestjs/microservices';
import { Types } from 'mongoose';
import { 
  DeliveryOrderCreatedEvent,
  DriverAcceptDeliveryEvent,
  DriverPickupDeliveryEvent,
  DriverDeliverOrderEvent,
  KitchenAcceptDeliveryEvent,
  KitchenPreparingDeliveryEvent,
  KitchenReadyDeliveryEvent,
  KitchenGetPendingDeliveryRequestEvent,
  KitchenGetPendingDeliveryResponseEvent,
  KitchenGetInProgressDeliveryRequestEvent,
  KitchenGetInProgressDeliveryResponseEvent,
  ORDER_TOPICS,
  OrderEvent
} from '@rm/common';
import { DeliveryTakeawayOrdersService } from '../../orders/services/delivery-takeaway-orders.service';
import { OrdersService } from '../../orders/services/orders.service';
import { KafkaService } from '../kafka.service';

@Controller()
export class DeliveryEventsController {
  private readonly logger = new Logger(DeliveryEventsController.name);

  constructor(
    private readonly deliveryTakeawayOrdersService: DeliveryTakeawayOrdersService,
    private readonly ordersService: OrdersService,
    private readonly kafkaService: KafkaService,
  ) {}

  @EventPattern('delivery.order.created')
  async handleDeliveryOrderCreated(@Payload() event: DeliveryOrderCreatedEvent) {
    console.log(`[DeliveryEventsController] Processing delivery order created: ${event.orderId}`);
    console.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Order is already created in DB by the service, just log for audit
      console.log(`[DeliveryEventsController] Delivery order ${event.orderId} created successfully`);
    } catch (error) {
      console.error(`[DeliveryEventsController] Failed to process delivery order created: ${error.message}`);
      console.error(`[DeliveryEventsController] Full error:`, error);
    }
  }

  @EventPattern('delivery.driver.accept')
  async handleDriverAcceptDelivery(@Payload() event: DriverAcceptDeliveryEvent) {
    console.log(`[DeliveryEventsController] Processing driver accept delivery: ${event.orderId}`);
    console.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get order to fill customerId and validate status
      const order = await this.deliveryTakeawayOrdersService.getDeliveryOrderById(event.orderId, event.restaurantId);
      event.customerId = order.customerId.toString();
      
      this.logger.log(`[DeliveryEventsController] Found order with customerId: ${event.customerId}`);
      
      // Validate that order is ready for driver acceptance
      if (order.status !== 'READY_FOR_DELIVERY') {
        throw new Error(`Order ${event.orderId} is not ready for driver acceptance. Current status: ${order.status}. Expected: READY_FOR_DELIVERY`);
      }
      
      // Update order directly
      order.status = 'DRIVER_ACCEPTED' as any;
      
      // Update delivery details
      if (!order.deliveryDetails) {
        order.deliveryDetails = {};
      }
      order.deliveryDetails.driverId = new Types.ObjectId(event.metadata.driverId);
      order.deliveryDetails.acceptedAt = new Date();
      
      // Save estimated delivery time and note from driver accept event
      if (event.metadata.estimatedDeliveryTime) {
        // Convert string to number (extract numeric part for database)
        const timeMatch = event.metadata.estimatedDeliveryTime.match(/(\d+)/);
        if (timeMatch) {
          order.deliveryDetails.estimatedDeliveryTime = parseInt(timeMatch[1]);
        }
      }
      
      if (event.metadata.note) {
        order.deliveryDetails.notes = (order.deliveryDetails.notes || '') + `\nAccept: ${event.metadata.note}`;
      }
      
      const updatedOrder = await order.save();
      
      console.log(`[DeliveryEventsController] Order ${event.orderId} status updated to DRIVER_ACCEPTED`);
      console.log(`[DeliveryEventsController] Updated order:`, {
        orderId: updatedOrder._id,
        status: updatedOrder.status,
        driverId: event.metadata.driverId
      });
      
      // Emit the event with customerId filled to WebSocket gateway
      const orderEvent = {
        orderId: event.orderId,
        restaurantId: event.restaurantId,
        customerId: event.customerId,
        orderType: 'DELIVERY' as const,
        status: 'DRIVER_ACCEPTED',
        timestamp: new Date(),
        metadata: {
          driverId: event.metadata.driverId,
          acceptedAt: new Date(),
          estimatedDeliveryTime: event.metadata.estimatedDeliveryTime,
          note: event.metadata.note
        }
      } as any;
      await this.kafkaService.emitOrderEvent(orderEvent);
      
    } catch (error) {
      console.error(`[DeliveryEventsController] Failed to process driver accept delivery: ${error.message}`);
      console.error(`[DeliveryEventsController] Full error:`, error);
    }
  }

  @EventPattern('delivery.driver.pickup')
  async handleDriverPickupDelivery(@Payload() event: DriverPickupDeliveryEvent) {
    console.log(`[DeliveryEventsController] Processing driver pickup delivery: ${event.orderId}`);
    console.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get order to fill customerId and validate status
      const order = await this.deliveryTakeawayOrdersService.getDeliveryOrderById(event.orderId, event.restaurantId);
      event.customerId = order.customerId.toString();
      
      this.logger.log(`[DeliveryEventsController] Found order with customerId: ${event.customerId}`);
      
      // Validate that order was accepted by driver first
      if (order.status !== 'DRIVER_ACCEPTED') {
        throw new Error(`Order ${event.orderId} cannot be picked up. Current status: ${order.status}. Expected: DRIVER_ACCEPTED`);
      }
      
      // Validate that the same driver is picking up
      if (order.deliveryDetails?.driverId?.toString() !== event.metadata.driverId) {
        throw new Error(`Order ${event.orderId} can only be picked up by the driver who accepted it`);
      }
      
      // Update order directly
      order.status = 'IN_DELIVERY' as any;
      
      // Update delivery details
      if (!order.deliveryDetails) {
        order.deliveryDetails = {};
      }
      order.deliveryDetails.driverId = new Types.ObjectId(event.metadata.driverId);
      order.deliveryDetails.pickedUpAt = new Date();
      
      // Only save note from pickup event (estimatedDeliveryTime should already be set from accept)
      if (event.metadata.note) {
        order.deliveryDetails.notes = (order.deliveryDetails.notes || '') + `\nPickup: ${event.metadata.note}`;
      }
      
      const updatedOrder = await order.save();
      
      console.log(`[DeliveryEventsController] Order ${event.orderId} status updated to IN_DELIVERY`);
      console.log(`[DeliveryEventsController] Updated order:`, {
        orderId: updatedOrder._id,
        status: updatedOrder.status,
        driverId: event.metadata.driverId
      });
      
      // Emit the event with customerId filled to WebSocket gateway
      const orderEvent = {
        orderId: event.orderId,
        restaurantId: event.restaurantId,
        customerId: event.customerId,
        orderType: 'DELIVERY' as const,
        status: 'PICKED_UP',
        timestamp: new Date(),
        metadata: {
          driverId: event.metadata.driverId,
          pickedUpAt: new Date(),
          note: event.metadata.note
        }
      } as any;
      await this.kafkaService.emitOrderEvent(orderEvent);
      
    } catch (error) {
      console.error(`[DeliveryEventsController] Failed to process driver pickup delivery: ${error.message}`);
      console.error(`[DeliveryEventsController] Full error:`, error);
    }
  }

  @EventPattern('delivery.driver.deliver')
  async handleDriverDeliverOrder(@Payload() event: DriverDeliverOrderEvent) {
    console.log(`[DeliveryEventsController] Processing driver deliver order: ${event.orderId}`);
    console.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get order to fill customerId and totalAmount
      const order = await this.deliveryTakeawayOrdersService.getDeliveryOrderById(event.orderId, event.restaurantId);
      event.customerId = order.customerId.toString();
      event.metadata.totalAmount = order.totalAmount;
      
      console.log(`[DeliveryEventsController] Found order with customerId: ${event.customerId}, totalAmount: ${event.metadata.totalAmount}`);
      
      // Complete delivery order - status becomes DELIVERED
      const updatedOrder = await this.deliveryTakeawayOrdersService.completeDeliveryOrder(
        event.orderId,
        event.restaurantId,
        event.metadata.driverId
      );
      
      console.log(`[DeliveryEventsController] Order ${event.orderId} completed and delivered`);
      console.log(`[DeliveryEventsController] Updated order:`, {
        orderId: updatedOrder._id,
        status: updatedOrder.status,
        driverId: event.metadata.driverId,
        deliveredAt: event.metadata.deliveredAt
      });
      
      // Emit the event with customerId filled to WebSocket gateway
      const orderEvent = {
        orderId: event.orderId,
        restaurantId: event.restaurantId,
        customerId: event.customerId,
        orderType: 'DELIVERY' as const,
        status: 'DELIVERED',
        timestamp: new Date(),
        metadata: {
          driverId: event.metadata.driverId,
          deliveredAt: event.metadata.deliveredAt,
          totalAmount: event.metadata.totalAmount
        }
      } as any;
      await this.kafkaService.emitOrderEvent(orderEvent);
      
    } catch (error) {
      console.error(`[DeliveryEventsController] Failed to process driver deliver order: ${error.message}`);
      console.error(`[DeliveryEventsController] Full error:`, error);
    }
  }

  // ======================== KITCHEN EVENTS ========================

  @EventPattern('delivery.kitchen.accept')
  async handleKitchenAcceptDelivery(@Payload() event: KitchenAcceptDeliveryEvent) {
    console.log(`[DeliveryEventsController] Processing kitchen accept delivery: ${event.orderId}`);
    console.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get order to fill customerId
      const order = await this.deliveryTakeawayOrdersService.getDeliveryOrderById(event.orderId, event.restaurantId);
      event.customerId = order.customerId.toString();
      
      console.log(`[DeliveryEventsController] Found order with customerId: ${event.customerId}`);
      
      // Use the existing kitchen accept method
      await this.deliveryTakeawayOrdersService.kitchenAcceptDeliveryOrder(
        event.orderId,
        event.restaurantId,
        event.metadata.chefId,
        {
          note: event.metadata.note,
          estimatedPrepTime: event.metadata.estimatedPrepTime
        }
      );
      
      console.log(`[DeliveryEventsController] Kitchen accepted delivery order: ${event.orderId}`);
      
      // Note: No need to emit event manually - kitchenAcceptDeliveryOrder already emits it
      
    } catch (error) {
      console.error(`[DeliveryEventsController] Failed to process kitchen accept delivery: ${error.message}`);
      console.error(`[DeliveryEventsController] Full error:`, error);
    }
  }

  @EventPattern('delivery.kitchen.preparing')
  async handleKitchenPreparingDelivery(@Payload() event: KitchenPreparingDeliveryEvent) {
    console.log(`[DeliveryEventsController] Processing kitchen preparing delivery: ${event.orderId}`);
    console.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get order to fill customerId
      const order = await this.deliveryTakeawayOrdersService.getDeliveryOrderById(event.orderId, event.restaurantId);
      event.customerId = order.customerId.toString();
      
      console.log(`[DeliveryEventsController] Found order with customerId: ${event.customerId}`);
      
      // Use the existing update delivery status method
      await this.deliveryTakeawayOrdersService.updateDeliveryStatus(
        event.orderId,
        event.restaurantId,
        event.metadata.chefId,
        {
          status: 'PREPARING',
          note: event.metadata.note
        }
      );
      
      console.log(`[DeliveryEventsController] Kitchen marked delivery order as preparing: ${event.orderId}`);
      
      // Note: No need to emit event manually - updateDeliveryStatus already emits it
      
    } catch (error) {
      console.error(`[DeliveryEventsController] Failed to process kitchen preparing delivery: ${error.message}`);
      console.error(`[DeliveryEventsController] Full error:`, error);
    }
  }

  @EventPattern('delivery.kitchen.ready')
  async handleKitchenReadyDelivery(@Payload() event: KitchenReadyDeliveryEvent) {
    console.log(`[DeliveryEventsController] Processing kitchen ready delivery: ${event.orderId}`);
    console.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get order to fill customerId
      const order = await this.deliveryTakeawayOrdersService.getDeliveryOrderById(event.orderId, event.restaurantId);
      event.customerId = order.customerId.toString();
      
      console.log(`[DeliveryEventsController] Found order with customerId: ${event.customerId}`);
      
      // Use the existing update delivery status method
      await this.deliveryTakeawayOrdersService.updateDeliveryStatus(
        event.orderId,
        event.restaurantId,
        event.metadata.chefId,
        {
          status: 'READY_FOR_DELIVERY',
          note: event.metadata.note
        }
      );
      
      console.log(`[DeliveryEventsController] Kitchen marked delivery order as ready: ${event.orderId}`);
      
      // Note: No need to emit event manually - updateDeliveryStatus already emits it
      
    } catch (error) {
      console.error(`[DeliveryEventsController] Failed to process kitchen ready delivery: ${error.message}`);
      console.error(`[DeliveryEventsController] Full error:`, error);
    }
  }

  // ======================== DELIVERY REQUESTS ========================

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_PENDING_DELIVERY_REQUEST)
  async handleGetPendingDeliveryRequest(@Payload() event: KitchenGetPendingDeliveryRequestEvent) {
    console.log(`[DeliveryEventsController] Processing get pending delivery request: ${event.requestId}`);
    console.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get pending delivery orders using the existing service method
      const result = await this.ordersService.getPendingDeliveryOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetPendingDeliveryResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      console.log(`[DeliveryEventsController] Sending response for pending delivery request: ${event.requestId}`);
      console.log(`[DeliveryEventsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      console.error(`[DeliveryEventsController] Failed to process get pending delivery request: ${error.message}`);
      console.error(`[DeliveryEventsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetPendingDeliveryResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: [],
        success: false,
        error: error.message
      };

      return errorResponseEvent;
    }
  }

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_IN_PROGRESS_DELIVERY_REQUEST)
  async handleGetInProgressDeliveryRequest(@Payload() event: KitchenGetInProgressDeliveryRequestEvent) {
    console.log(`[DeliveryEventsController] Processing get in progress delivery request: ${event.requestId}`);
    console.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get in progress delivery orders using the existing service method
      const result = await this.ordersService.getInProgressDeliveryOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetInProgressDeliveryResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      console.log(`[DeliveryEventsController] Sending response for in progress delivery request: ${event.requestId}`);
      console.log(`[DeliveryEventsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      console.error(`[DeliveryEventsController] Failed to process get in progress delivery request: ${error.message}`);
      console.error(`[DeliveryEventsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetInProgressDeliveryResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: [],
        success: false,
        error: error.message
      };

      return errorResponseEvent;
    }
  }
} 