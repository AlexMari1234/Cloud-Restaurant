import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { 
  KitchenGetPendingOrdersResponseEvent,
  KitchenGetDineInPendingResponseEvent,
  ORDER_TOPICS
} from '@rm/common';

@Controller()
export class KitchenResponsesController {
  private readonly logger = new Logger(KitchenResponsesController.name);

  // Store pending responses
  private pendingResponses = new Map<string, any>();

  @EventPattern(ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_RESPONSE)
  async handleGetPendingOrdersResponse(@Payload() event: KitchenGetPendingOrdersResponseEvent) {
    this.logger.log(`[KitchenResponsesController] Received pending orders response: ${event.requestId}`);
    this.logger.log(`[KitchenResponsesController] Response data:`, JSON.stringify(event, null, 2));
    
    // Store the response for the corresponding request
    this.pendingResponses.set(event.requestId, {
      success: event.success,
      orders: event.orders,
      error: event.error,
      timestamp: event.timestamp
    });
    
    this.logger.log(`[KitchenResponsesController] Response stored for request: ${event.requestId}`);
  }

  @EventPattern(ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_RESPONSE)
  async handleGetDineInPendingResponse(@Payload() event: KitchenGetDineInPendingResponseEvent) {
    this.logger.log(`[KitchenResponsesController] Received dine-in pending response: ${event.requestId}`);
    this.logger.log(`[KitchenResponsesController] Response data:`, JSON.stringify(event, null, 2));
    
    // Store the response for the corresponding request
    this.pendingResponses.set(event.requestId, {
      success: event.success,
      orders: event.orders,
      error: event.error,
      timestamp: event.timestamp
    });
    
    this.logger.log(`[KitchenResponsesController] Response stored for dine-in request: ${event.requestId}`);
  }

  // Method to get response for a specific request
  getResponse(requestId: string): any | null {
    const response = this.pendingResponses.get(requestId);
    if (response) {
      this.pendingResponses.delete(requestId); // Clean up after retrieval
      return response;
    }
    return null;
  }

  // Method to wait for response with timeout
  async waitForResponse(requestId: string, timeoutMs: number = 5000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const response = this.getResponse(requestId);
      if (response) {
        return response;
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before checking again
    }
    
    // Timeout reached
    this.logger.warn(`[KitchenResponsesController] Timeout waiting for response: ${requestId}`);
    return null;
  }
} 