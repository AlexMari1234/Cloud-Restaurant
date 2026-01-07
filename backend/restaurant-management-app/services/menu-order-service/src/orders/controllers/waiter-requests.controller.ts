import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { 
  WaiterGetAllOrdersRequestEvent,
  WaiterGetAllOrdersResponseEvent,
  WaiterGetReadyBatchesRequestEvent,
  WaiterGetReadyBatchesResponseEvent,
  WaiterGetCurrentOrdersRequestEvent,
  WaiterGetCurrentOrdersResponseEvent,
  WaiterGetCompletedOrdersRequestEvent,
  WaiterGetCompletedOrdersResponseEvent,
  WaiterGetReadyTakeawayRequestEvent,
  WaiterGetReadyTakeawayResponseEvent,
  ORDER_TOPICS
} from '@rm/common';
import { OrdersManagementService } from '../services/orders-management.service';
import { KafkaService } from '../../kafka/kafka.service';

@Controller()
export class WaiterRequestsController {
  private readonly logger = new Logger(WaiterRequestsController.name);

  constructor(
    private readonly ordersManagementService: OrdersManagementService,
    private readonly kafkaService: KafkaService,
  ) {}

  @MessagePattern(ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST)
  async handleGetAllOrdersRequest(@Payload() event: WaiterGetAllOrdersRequestEvent) {
    this.logger.log(`[WaiterRequestsController] Processing get all orders request: ${event.requestId}`);
    this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get all orders using the existing service method
      const result = await this.ordersManagementService.getActiveDineInOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: WaiterGetAllOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[WaiterRequestsController] Sending response for all orders request: ${event.requestId}`);
      this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[WaiterRequestsController] Failed to process get all orders request: ${error.message}`);
      this.logger.error(`[WaiterRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: WaiterGetAllOrdersResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST)
  async handleGetReadyBatchesRequest(@Payload() event: WaiterGetReadyBatchesRequestEvent) {
    this.logger.log(`[WaiterRequestsController] Processing get ready batches request: ${event.requestId}`);
    this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get ready batches using the existing service method
      const result = await this.ordersManagementService.getReadyBatchesForWaiter(event.restaurantId);
      
      // Create response event
      const responseEvent: WaiterGetReadyBatchesResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[WaiterRequestsController] Sending response for ready batches request: ${event.requestId}`);
      this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[WaiterRequestsController] Failed to process get ready batches request: ${error.message}`);
      this.logger.error(`[WaiterRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: WaiterGetReadyBatchesResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST)
  async handleGetCurrentOrdersRequest(@Payload() event: WaiterGetCurrentOrdersRequestEvent) {
    this.logger.log(`[WaiterRequestsController] Processing get current orders request: ${event.requestId}`);
    this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get current orders using the existing service method
      const result = await this.ordersManagementService.getCurrentOrdersForWaiter(event.restaurantId);
      
      // Create response event
      const responseEvent: WaiterGetCurrentOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[WaiterRequestsController] Sending response for current orders request: ${event.requestId}`);
      this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[WaiterRequestsController] Failed to process get current orders request: ${error.message}`);
      this.logger.error(`[WaiterRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: WaiterGetCurrentOrdersResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST)
  async handleGetCompletedOrdersRequest(@Payload() event: WaiterGetCompletedOrdersRequestEvent) {
    this.logger.log(`[WaiterRequestsController] Processing get completed orders request: ${event.requestId}`);
    this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get completed orders using the existing service method
      const result = await this.ordersManagementService.getCompletedOrdersForWaiter(event.restaurantId);
      
      // Create response event
      const responseEvent: WaiterGetCompletedOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[WaiterRequestsController] Sending response for completed orders request: ${event.requestId}`);
      this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[WaiterRequestsController] Failed to process get completed orders request: ${error.message}`);
      this.logger.error(`[WaiterRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: WaiterGetCompletedOrdersResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST)
  async handleGetReadyTakeawayRequest(@Payload() event: WaiterGetReadyTakeawayRequestEvent) {
    this.logger.log(`[WaiterRequestsController] Processing get ready takeaway request: ${event.requestId}`);
    this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get ready takeaway orders using the existing service method
      const result = await this.ordersManagementService.getReadyTakeawayOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: WaiterGetReadyTakeawayResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      this.logger.log(`[WaiterRequestsController] Sending response for ready takeaway request: ${event.requestId}`);
      this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[WaiterRequestsController] Failed to process get ready takeaway request: ${error.message}`);
      this.logger.error(`[WaiterRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: WaiterGetReadyTakeawayResponseEvent = {
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