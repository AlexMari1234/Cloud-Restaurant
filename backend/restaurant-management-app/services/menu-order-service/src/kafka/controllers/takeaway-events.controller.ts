import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { 
  TakeawayOrderCreatedEvent,
  KitchenAcceptTakeawayEvent,
  KitchenPreparingTakeawayEvent,
  KitchenReadyTakeawayEvent,
  CustomerPickupTakeawayEvent
} from '@rm/common';
import { DeliveryTakeawayOrdersService } from '../../orders/services/delivery-takeaway-orders.service';

@Controller()
export class TakeawayEventsController {
  private readonly logger = new Logger(TakeawayEventsController.name);

  constructor(
    private readonly deliveryTakeawayOrdersService: DeliveryTakeawayOrdersService,
  ) {}

  @EventPattern('takeaway.order.created')
  async handleTakeawayOrderCreated(@Payload() event: TakeawayOrderCreatedEvent) {
    console.log(`Processing takeaway order created: ${event.orderId}`);
    
    try {
      // Order is already created in DB, just log for audit
      console.log(`Takeaway order ${event.orderId} created successfully`);
    } catch (error) {
      console.error(`Failed to process takeaway order created: ${error.message}`);
    }
  }

  @EventPattern('takeaway.kitchen.accept')
  async handleKitchenAcceptTakeaway(@Payload() event: KitchenAcceptTakeawayEvent) {
    console.log(`[TakeawayEventsController] Received takeaway.kitchen.accept event:`, JSON.stringify(event, null, 2));
    console.log(`Processing kitchen accept takeaway: ${event.orderId}`);
    
    try {
      console.log(`[TakeawayEventsController] Calling kitchenAcceptTakeawayOrder with orderId: ${event.orderId}, restaurantId: ${event.restaurantId}, chefId: ${event.metadata.chefId}`);
      
      // Prepare body with note and estimatedPrepTime from event metadata
      const body = {
        note: event.metadata.note,
        estimatedPrepTime: event.metadata.estimatedPrepTime
      };
      
      // Update order status in database
      const updatedOrder = await this.deliveryTakeawayOrdersService.kitchenAcceptTakeawayOrder(
        event.orderId,
        event.restaurantId,
        event.metadata.chefId,
        body
      );
      
      console.log(`[TakeawayEventsController] Order updated successfully. New status: ${updatedOrder.status}`);
      
      // Update the event with the actual customerId from the database
      event.customerId = updatedOrder.customerId.toString();
      
      console.log(`Takeaway order ${event.orderId} accepted by kitchen`);
    } catch (error) {
      console.error(`[TakeawayEventsController] Error processing kitchen accept:`, error);
      console.error(`Failed to process kitchen accept takeaway: ${error.message}`);
    }
  }

  @EventPattern('takeaway.kitchen.preparing')
  async handleKitchenPreparingTakeaway(@Payload() event: KitchenPreparingTakeawayEvent) {
    console.log(`[TakeawayEventsController] Received takeaway.kitchen.preparing event:`, JSON.stringify(event, null, 2));
    console.log(`Processing kitchen preparing takeaway: ${event.orderId}`);
    
    try {
      console.log(`[TakeawayEventsController] Calling updateTakeawayStatus with orderId: ${event.orderId}, restaurantId: ${event.restaurantId}, chefId: ${event.metadata.chefId}`);
      
      // Update order status in database
      const updatedOrder = await this.deliveryTakeawayOrdersService.updateTakeawayStatus(
        event.orderId,
        event.restaurantId,
        event.metadata.chefId,
        { status: 'PREPARING', note: event.metadata.note }
      );
      
      console.log(`[TakeawayEventsController] Order updated successfully. New status: ${updatedOrder.status}`);
      
      // Update the event with the actual customerId from the database
      event.customerId = updatedOrder.customerId.toString();
      
      console.log(`Takeaway order ${event.orderId} marked as preparing`);
    } catch (error) {
      console.error(`[TakeawayEventsController] Error processing kitchen preparing:`, error);
      console.error(`Failed to process kitchen preparing takeaway: ${error.message}`);
    }
  }

  @EventPattern('takeaway.kitchen.ready')
  async handleKitchenReadyTakeaway(@Payload() event: KitchenReadyTakeawayEvent) {
    console.log(`[TakeawayEventsController] Received takeaway.kitchen.ready event:`, JSON.stringify(event, null, 2));
    console.log(`Processing kitchen ready takeaway: ${event.orderId}`);
    
    try {
      console.log(`[TakeawayEventsController] Calling updateTakeawayStatus with orderId: ${event.orderId}, restaurantId: ${event.restaurantId}, chefId: ${event.metadata.chefId}`);
      
      // Update order status in database
      const updatedOrder = await this.deliveryTakeawayOrdersService.updateTakeawayStatus(
        event.orderId,
        event.restaurantId,
        event.metadata.chefId,
        { status: 'READY', note: event.metadata.note }
      );
      
      console.log(`[TakeawayEventsController] Order updated successfully. New status: ${updatedOrder.status}`);
      
      // Update the event with the actual customerId from the database
      event.customerId = updatedOrder.customerId.toString();
      
      console.log(`Takeaway order ${event.orderId} marked as ready for pickup`);
    } catch (error) {
      console.error(`[TakeawayEventsController] Error processing kitchen ready:`, error);
      console.error(`Failed to process kitchen ready takeaway: ${error.message}`);
    }
  }

  @EventPattern('takeaway.customer.pickup')
  async handleCustomerPickupTakeaway(@Payload() event: CustomerPickupTakeawayEvent) {
    console.log(`[TakeawayEventsController] Received takeaway.customer.pickup event:`, JSON.stringify(event, null, 2));
    console.log(`Processing customer pickup takeaway: ${event.orderId}`);
    
    try {
      console.log(`[TakeawayEventsController] Calling completeTakeawayOrder with orderId: ${event.orderId}, restaurantId: ${event.restaurantId}, waiterId: ${event.metadata.waiterId}`);
      
      // Update order status in database
      const updatedOrder = await this.deliveryTakeawayOrdersService.completeTakeawayOrder(
        event.orderId,
        event.restaurantId,
        event.metadata.waiterId
      );
      
      console.log(`[TakeawayEventsController] Order updated successfully. New status: ${updatedOrder.status}`);
      
      // Update the event with the actual customerId from the database
      event.customerId = updatedOrder.customerId.toString();
      
      console.log(`Takeaway order ${event.orderId} picked up by customer`);
    } catch (error) {
      console.error(`[TakeawayEventsController] Error processing customer pickup:`, error);
      console.error(`Failed to process customer pickup takeaway: ${error.message}`);
    }
  }
} 