import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { 
  DriverGetReadyOrdersRequestEvent,
  DriverGetReadyOrdersResponseEvent,
  DriverGetAssignedOrdersRequestEvent,
  DriverGetAssignedOrdersResponseEvent,
  DriverGetCompletedOrdersRequestEvent,
  DriverGetCompletedOrdersResponseEvent,
  ORDER_TOPICS
} from '@rm/common';
import { OrdersManagementService } from '../services/orders-management.service';
import { OrdersService } from '../services/orders.service';
import { KafkaService } from '../../kafka/kafka.service';

@Controller()
export class DriverRequestsController {
  private readonly logger = new Logger(DriverRequestsController.name);

  constructor(
    private readonly ordersManagementService: OrdersManagementService,
    private readonly ordersService: OrdersService,
    private readonly kafkaService: KafkaService,
  ) {}

  @MessagePattern(ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST)
  async handleGetReadyOrdersRequest(@Payload() event: DriverGetReadyOrdersRequestEvent) {
    console.log(`[DriverRequestsController] Processing get ready orders request: ${event.requestId}`);
    console.log(`[DriverRequestsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get ready delivery orders using the existing service method
      const result = await this.ordersManagementService.getReadyDeliveryOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: DriverGetReadyOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };

      console.log(`[DriverRequestsController] Sending response for ready orders request: ${event.requestId}`);
      console.log(`[DriverRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      console.error(`[DriverRequestsController] Failed to process get ready orders request: ${error.message}`);
      console.error(`[DriverRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: DriverGetReadyOrdersResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST)
  async handleGetAssignedOrdersRequest(@Payload() event: DriverGetAssignedOrdersRequestEvent) {
    try {
      // Get assigned delivery orders using the existing service method
      const result = await this.ordersManagementService.getAssignedDeliveryOrders(event.restaurantId);
      
      // Create response event
      const responseEvent: DriverGetAssignedOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        timestamp: new Date(),
        orders: result.orders || [],
        success: true
      };
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[DriverRequestsController] Failed to process get assigned orders request: ${error.message}`);
      this.logger.error(`[DriverRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: DriverGetAssignedOrdersResponseEvent = {
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

  @MessagePattern(ORDER_TOPICS.DRIVER_GET_COMPLETED_ORDERS_REQUEST)
  async handleGetCompletedOrdersRequest(@Payload() event: DriverGetCompletedOrdersRequestEvent) {
    try {
      // Get completed delivery orders by driver - query directly like kitchen does
      const result = await this.ordersService.getOrdersForRestaurantManagement(
        event.restaurantId,
        {
          orderType: 'DELIVERY',
          status: 'DELIVERED',
          page: 1,
          limit: 100,
        }
      );

      // Filter orders by driver ID (convert ObjectId to string for comparison)
      const completedDriverOrders = result.orders.filter(order => 
        order.deliveryDetails?.driverId?.toString() === event.driverId
      );
      
      // Create response event
      const responseEvent: DriverGetCompletedOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        driverId: event.driverId,
        timestamp: new Date(),
        orders: completedDriverOrders || [],
        success: true
      };
      
      // Return response directly for MessagePattern
      return responseEvent;
    } catch (error) {
      this.logger.error(`[DriverRequestsController] Failed to process get completed orders request: ${error.message}`);
      this.logger.error(`[DriverRequestsController] Full error:`, error);
      
      // Send error response
      const errorResponseEvent: DriverGetCompletedOrdersResponseEvent = {
        requestId: event.requestId,
        restaurantId: event.restaurantId,
        driverId: event.driverId,
        timestamp: new Date(),
        orders: [],
        success: false,
        error: error.message
      };

      return errorResponseEvent;
    }
  }
} 