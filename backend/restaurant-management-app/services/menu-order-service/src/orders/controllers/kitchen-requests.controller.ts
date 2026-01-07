import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { 
  KitchenGetPendingOrdersRequestEvent,
  KitchenGetPendingOrdersResponseEvent,
  KitchenGetDineInPendingRequestEvent,
  KitchenGetDineInPendingResponseEvent,
  KitchenGetActiveOrdersRequestEvent,
  KitchenGetActiveOrdersResponseEvent,
  KitchenGetAcceptedOrdersRequestEvent,
  KitchenGetAcceptedOrdersResponseEvent,
  KitchenGetDineInAcceptedRequestEvent,
  KitchenGetDineInAcceptedResponseEvent,
  KitchenGetReadyTakeawayRequestEvent,
  KitchenGetReadyTakeawayResponseEvent,
  KitchenGetReadyDeliveryRequestEvent,
  KitchenGetReadyDeliveryResponseEvent,
  KitchenGetDineInReadyRequestEvent,
  KitchenGetDineInReadyResponseEvent,
  KitchenGetPendingTakeawayRequestEvent,
  KitchenGetPendingTakeawayResponseEvent,
  ORDER_TOPICS
} from '@rm/common';
import { OrdersManagementService } from '../services/orders-management.service';
import { KafkaService } from '../../kafka/kafka.service';

@Controller()
export class KitchenRequestsController {
  private readonly logger = new Logger(KitchenRequestsController.name);

  constructor(
    private readonly ordersManagementService: OrdersManagementService,
    private readonly kafkaService: KafkaService,
  ) {}

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST)
  async handleGetPendingOrdersRequest(@Payload() event: KitchenGetPendingOrdersRequestEvent) {
    console.log(`[KitchenRequestsController] Processing get pending orders request: ${event.requestId}`);
    console.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get pending orders using the existing service method
      const result = await this.ordersManagementService.getOrdersPendingKitchenAcceptance(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetPendingOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      console.log(`[KitchenRequestsController] Sending response for request: ${event.requestId}`);
      console.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      console.error(`[KitchenRequestsController] Failed to process get pending orders request: ${error.message}`);
      console.error(`[KitchenRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetPendingOrdersResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST)
  async handleGetDineInPendingRequest(@Payload() event: KitchenGetDineInPendingRequestEvent) {
    this.logger.log(`[KitchenRequestsController] Processing get dine-in pending request: ${event.requestId}`);
    this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get pending dine-in orders using the existing service method
      const result = await this.ordersManagementService.getPendingDineInOrdersForKitchen(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetDineInPendingResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[KitchenRequestsController] Sending response for dine-in request: ${event.requestId}`);
      this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[KitchenRequestsController] Failed to process get dine-in pending request: ${error.message}`);
      this.logger.error(`[KitchenRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetDineInPendingResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST)
  async handleGetActiveOrdersRequest(@Payload() event: KitchenGetActiveOrdersRequestEvent) {
    this.logger.log(`[KitchenRequestsController] Processing get active orders request: ${event.requestId}`);
    this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get active orders using the existing service method
      const result = await this.ordersManagementService.getActiveDineInOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetActiveOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[KitchenRequestsController] Sending response for active orders request: ${event.requestId}`);
      this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[KitchenRequestsController] Failed to process get active orders request: ${error.message}`);
      this.logger.error(`[KitchenRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetActiveOrdersResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST)
  async handleGetAcceptedOrdersRequest(@Payload() event: KitchenGetAcceptedOrdersRequestEvent) {
    this.logger.log(`[KitchenRequestsController] Processing get accepted orders request: ${event.requestId}`);
    this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get accepted orders using the existing service method
      const result = await this.ordersManagementService.getKitchenAcceptedOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetAcceptedOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[KitchenRequestsController] Sending response for accepted orders request: ${event.requestId}`);
      this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[KitchenRequestsController] Failed to process get accepted orders request: ${error.message}`);
      this.logger.error(`[KitchenRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetAcceptedOrdersResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST)
  async handleGetDineInAcceptedRequest(@Payload() event: KitchenGetDineInAcceptedRequestEvent) {
    this.logger.log(`[KitchenRequestsController] Processing get dine-in accepted request: ${event.requestId}`);
    this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get accepted dine-in orders using the existing service method
      const result = await this.ordersManagementService.getAcceptedDineInOrdersForKitchen(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetDineInAcceptedResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[KitchenRequestsController] Sending response for dine-in accepted request: ${event.requestId}`);
      this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[KitchenRequestsController] Failed to process get dine-in accepted request: ${error.message}`);
      this.logger.error(`[KitchenRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetDineInAcceptedResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_DINE_IN_READY_REQUEST)
  async handleGetDineInReadyRequest(@Payload() event: KitchenGetDineInReadyRequestEvent) {
    this.logger.log(`[KitchenRequestsController] Processing get dine-in ready request: ${event.requestId}`);
    this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get ready dine-in orders using the existing service method
      const result = await this.ordersManagementService.getReadyDineInOrdersForKitchen(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetDineInReadyResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[KitchenRequestsController] Sending response for dine-in ready request: ${event.requestId}`);
      this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[KitchenRequestsController] Failed to process get dine-in ready request: ${error.message}`);
      this.logger.error(`[KitchenRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetDineInReadyResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST)
  async handleGetReadyTakeawayRequest(@Payload() event: KitchenGetReadyTakeawayRequestEvent) {
    this.logger.log(`[KitchenRequestsController] Processing get ready takeaway request: ${event.requestId}`);
    this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get ready takeaway orders using the existing service method
      const result = await this.ordersManagementService.getReadyTakeawayOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetReadyTakeawayResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[KitchenRequestsController] Sending response for ready takeaway request: ${event.requestId}`);
      this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[KitchenRequestsController] Failed to process get ready takeaway request: ${error.message}`);
      this.logger.error(`[KitchenRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetReadyTakeawayResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST)
  async handleGetReadyDeliveryRequest(@Payload() event: KitchenGetReadyDeliveryRequestEvent) {
    this.logger.log(`[KitchenRequestsController] Processing get ready delivery request: ${event.requestId}`);
    this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get ready delivery orders using the existing service method
      const result = await this.ordersManagementService.getReadyDeliveryOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetReadyDeliveryResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[KitchenRequestsController] Sending response for ready delivery request: ${event.requestId}`);
      this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[KitchenRequestsController] Failed to process get ready delivery request: ${error.message}`);
      this.logger.error(`[KitchenRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetReadyDeliveryResponseEvent = {
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



  @MessagePattern(ORDER_TOPICS.KITCHEN_GET_PENDING_TAKEAWAY_REQUEST)
  async handleGetPendingTakeawayRequest(@Payload() event: KitchenGetPendingTakeawayRequestEvent) {
    this.logger.log(`[KitchenRequestsController] Processing get pending takeaway request: ${event.requestId}`);
    this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get pending takeaway orders using the existing service method
      const result = await this.ordersManagementService.getPendingTakeawayOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: KitchenGetPendingTakeawayResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[KitchenRequestsController] Sending response for pending takeaway request: ${event.requestId}`);
      this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[KitchenRequestsController] Failed to process get pending takeaway request: ${error.message}`);
      this.logger.error(`[KitchenRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: KitchenGetPendingTakeawayResponseEvent = {
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