import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { 
  TakeawayOrderCreatedEvent,
  KitchenAcceptTakeawayEvent,
  KitchenPreparingTakeawayEvent,
  KitchenReadyTakeawayEvent,
  CustomerPickupTakeawayEvent
} from '@rm/common';

@Injectable()
export class TakeawayConsumer {
  private readonly logger = new Logger(TakeawayConsumer.name);

  @EventPattern('takeaway.order.created')
  async handleTakeawayOrderCreated(@Payload() event: TakeawayOrderCreatedEvent) {
    this.logger.log(`New takeaway order created: ${event.orderId}`);
    
    try {
      // Notify kitchen staff about new takeaway order
      await this.notifyKitchenAboutNewTakeaway(event);
      
      // Log for analytics
      this.logger.log(`Takeaway order details: ${JSON.stringify({
        orderId: event.orderId,
        restaurantId: event.restaurantId,
        customerName: event.metadata.customerName,
        totalAmount: event.metadata.totalAmount,
        itemsCount: event.items.length
      })}`);
      
    } catch (error) {
      this.logger.error(`Failed to process takeaway order created: ${error.message}`);
    }
  }

  @EventPattern('takeaway.kitchen.accept')
  async handleKitchenAcceptTakeaway(@Payload() event: KitchenAcceptTakeawayEvent) {
    this.logger.log(`Kitchen accepted takeaway order: ${event.orderId}`);
    
    try {
      // Notify customer that order was accepted by kitchen
      await this.notifyCustomerOrderAccepted(event);
      
      // Log for analytics
      this.logger.log(`Kitchen acceptance details: ${JSON.stringify({
        orderId: event.orderId,
        chefId: event.metadata.chefId,
        acceptedAt: event.metadata.acceptedAt,
        acceptedItems: event.metadata.acceptedItems
      })}`);
      
    } catch (error) {
      this.logger.error(`Failed to process kitchen accept takeaway: ${error.message}`);
    }
  }

  @EventPattern('takeaway.kitchen.preparing')
  async handleKitchenPreparingTakeaway(@Payload() event: KitchenPreparingTakeawayEvent) {
    this.logger.log(`Kitchen started preparing takeaway order: ${event.orderId}`);
    
    try {
      // Notify customer that preparation has started
      await this.notifyCustomerPreparationStarted(event);
      
      // Log for analytics
      this.logger.log(`Preparation started details: ${JSON.stringify({
        orderId: event.orderId,
        chefId: event.metadata.chefId,
        preparationStartedAt: event.metadata.preparationStartedAt,
        note: event.metadata.note
      })}`);
      
    } catch (error) {
      this.logger.error(`Failed to process kitchen preparing takeaway: ${error.message}`);
    }
  }

  @EventPattern('takeaway.kitchen.ready')
  async handleKitchenReadyTakeaway(@Payload() event: KitchenReadyTakeawayEvent) {
    this.logger.log(`Takeaway order ready for pickup: ${event.orderId}`);
    
    try {
      // Notify customer that order is ready for pickup
      await this.notifyCustomerOrderReady(event);
      
      // Notify waiter staff about ready takeaway
      await this.notifyWaiterAboutReadyTakeaway(event);
      
      // Log for analytics
      this.logger.log(`Order ready details: ${JSON.stringify({
        orderId: event.orderId,
        chefId: event.metadata.chefId,
        readyAt: event.metadata.readyAt,
        note: event.metadata.note
      })}`);
      
    } catch (error) {
      this.logger.error(`Failed to process kitchen ready takeaway: ${error.message}`);
    }
  }

  @EventPattern('takeaway.customer.pickup')
  async handleCustomerPickupTakeaway(@Payload() event: CustomerPickupTakeawayEvent) {
    this.logger.log(`Customer picked up takeaway order: ${event.orderId}`);
    
    try {
      // Notify kitchen that order was picked up
      await this.notifyKitchenOrderPickedUp(event);
      
      // Log for analytics
      this.logger.log(`Order pickup details: ${JSON.stringify({
        orderId: event.orderId,
        waiterId: event.metadata.waiterId,
        pickedUpAt: event.metadata.pickedUpAt,
        customerName: event.metadata.customerName
      })}`);
      
    } catch (error) {
      this.logger.error(`Failed to process customer pickup takeaway: ${error.message}`);
    }
  }

  // Helper methods for notifications
  private async notifyKitchenAboutNewTakeaway(event: TakeawayOrderCreatedEvent) {
    // TODO: Implement kitchen notification logic
    // - Send push notification to kitchen staff
    // - Update kitchen display
    // - Play sound notification
    this.logger.log(`Notifying kitchen about new takeaway order ${event.orderId}`);
  }

  private async notifyCustomerOrderAccepted(event: KitchenAcceptTakeawayEvent) {
    // TODO: Implement customer notification logic
    // - Send SMS/email to customer
    // - Update customer app
    this.logger.log(`Notifying customer that order ${event.orderId} was accepted`);
  }

  private async notifyCustomerPreparationStarted(event: KitchenPreparingTakeawayEvent) {
    // TODO: Implement customer notification logic
    this.logger.log(`Notifying customer that preparation started for order ${event.orderId}`);
  }

  private async notifyCustomerOrderReady(event: KitchenReadyTakeawayEvent) {
    // TODO: Implement customer notification logic
    // - Send SMS/email to customer
    // - Update customer app with pickup instructions
    this.logger.log(`Notifying customer that order ${event.orderId} is ready for pickup`);
  }

  private async notifyWaiterAboutReadyTakeaway(event: KitchenReadyTakeawayEvent) {
    // TODO: Implement waiter notification logic
    // - Send push notification to waiter staff
    // - Update waiter display
    this.logger.log(`Notifying waiter about ready takeaway order ${event.orderId}`);
  }

  private async notifyKitchenOrderPickedUp(event: CustomerPickupTakeawayEvent) {
    // TODO: Implement kitchen notification logic
    this.logger.log(`Notifying kitchen that order ${event.orderId} was picked up`);
  }
} 