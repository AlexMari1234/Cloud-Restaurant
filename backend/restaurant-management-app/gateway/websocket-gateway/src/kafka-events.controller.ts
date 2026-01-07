import { Controller, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload }     from '@nestjs/microservices';
import {
  DeliveryOrderCreatedEvent,
  TakeawayOrderCreatedEvent,
  KitchenAcceptDeliveryEvent,
  KitchenPreparingDeliveryEvent,
  KitchenReadyDeliveryEvent,
  DriverAcceptDeliveryEvent,
  DriverPickupDeliveryEvent,
  DriverDeliverOrderEvent,
} from '@rm/common';
import { KitchenWebSocketGateway, DriverWebSocketGateway, CustomerWebSocketGateway, NotificationMessage } from './websocket.gateway';

@Controller()
export class KafkaEventsController implements OnModuleInit {
  constructor(
    private readonly kitchenWs: KitchenWebSocketGateway,
    private readonly driverWs: DriverWebSocketGateway,
    private readonly customerWs: CustomerWebSocketGateway
  ) {}

  onModuleInit() {
    console.log('🔌 KafkaEventsController initialized');
  }

  @EventPattern('delivery.order.created')
  handleDeliveryCreated(@Payload() event: DeliveryOrderCreatedEvent) {
    console.log(`🎯 [Kafka] delivery.order.created → ${event.orderId}`);
    
    // Kitchen notification
    const kitchenNotif: NotificationMessage = {
      id:        `delivery_${event.orderId}`,
      type:      'DELIVERY_ORDER_CREATED',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `🚀 New DELIVERY order received! Order #${event.orderId.slice(-8)} - Total: ${event.metadata?.totalAmount || 'N/A'} RON`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60_000),
      data:      event,
    };
    this.kitchenWs.sendNotification(kitchenNotif);

    // Customer notification - full order tracking
    if (event.customerId) {
      const customerNotif: NotificationMessage = {
        id:        `customer_order_created_${event.orderId}`,
        type:      'ORDER_CREATED',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `🛍️ Your order #${event.orderId.slice(-8)} has been placed and sent to the restaurant`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000), // 1 hour
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    }
  }

  @EventPattern('takeaway.order.created')
  handleTakeawayCreated(@Payload() event: TakeawayOrderCreatedEvent) {
    console.log(`🥡 [Kafka] takeaway.order.created → ${event.orderId}`);
    
    // Kitchen notification
    const kitchenNotif: NotificationMessage = {
      id:        `takeaway_${event.orderId}`,
      type:      'TAKEAWAY_ORDER_CREATED',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `🥡 New TAKEAWAY order received! Order #${event.orderId.slice(-8)} - Customer: ${event.metadata?.customerName || 'N/A'}`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60_000),
      data:      event,
    };
    this.kitchenWs.sendNotification(kitchenNotif);

    // Customer notification
    if (event.customerId) {
      const customerNotif: NotificationMessage = {
        id:        `customer_takeaway_created_${event.orderId}`,
        type:      'ORDER_CREATED',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `🥡 Your takeaway order #${event.orderId.slice(-8)} has been placed and sent to the kitchen`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000), // 1 hour
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    }
  }

  // Kitchen accept/preparing notifications - only for customers now
  @EventPattern('orders.kitchen-accepted')
  handleKitchenAccept(@Payload() event: any) {
    console.log(`👩‍🍳 [Kafka] orders.kitchen-accepted → ${event.orderId}`);
    
    // DEBUG: Log customer ID
    console.log(`🔍 DEBUG: Customer ID in kitchen-accepted event: ${event.customerId}`);
    
    // Only customer notification - kitchen doesn't need to know about their own actions
    if (event.customerId) {
      console.log(`📱 Sending customer kitchen accept notification to customer: ${event.customerId}`);
      const customerNotif: NotificationMessage = {
        id:        `customer_kitchen_accept_${event.orderId}`,
        type:      'KITCHEN_ACCEPTED',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `✅ Kitchen accepted your order #${event.orderId.slice(-8)} and will start preparing it`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000),
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    } else {
      console.log(`⚠️ WARNING: No customerId in kitchen-accepted event for order ${event.orderId}`);
    }
  }

  @EventPattern('orders.preparing')
  handleKitchenPreparing(@Payload() event: any) {
    console.log(`👩‍🍳 [Kafka] orders.preparing → ${event.orderId}`);
    
    // DEBUG: Log customer ID
    console.log(`🔍 DEBUG: Customer ID in preparing event: ${event.customerId}`);
    
    // Only customer notification
    if (event.customerId) {
      console.log(`📱 Sending customer kitchen preparing notification to customer: ${event.customerId}`);
      const customerNotif: NotificationMessage = {
        id:        `customer_kitchen_preparing_${event.orderId}`,
        type:      'KITCHEN_PREPARING',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `👨‍🍳 Your order #${event.orderId.slice(-8)} is now being prepared in the kitchen`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000),
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    } else {
      console.log(`⚠️ WARNING: No customerId in preparing event for order ${event.orderId}`);
    }
  }

  @EventPattern('orders.ready-for-delivery')
  handleKitchenReady(@Payload() event: any) {
    console.log(`✅ [Kafka] orders.ready-for-delivery → ${event.orderId}`);
    
    // DEBUG: Log customer ID
    console.log(`🔍 DEBUG: Customer ID in ready-for-delivery event: ${event.customerId}`);
    
    // Notify drivers about available orders
    const driverNotif: NotificationMessage = {
      id:        `driver_available_${event.orderId}`,
      type:      'ORDER_AVAILABLE_FOR_PICKUP',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `🚚 New delivery available! Order #${event.orderId.slice(-8)} ready for pickup`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60_000), // 10 minute expiry for driver notifications
      data:      event,
    };
    this.driverWs.sendDriverNotification(driverNotif);

    // Customer notification - order ready for delivery
    if (event.customerId) {
      console.log(`📱 Sending customer kitchen ready notification to customer: ${event.customerId}`);
      const customerNotif: NotificationMessage = {
        id:        `customer_kitchen_ready_${event.orderId}`,
        type:      'KITCHEN_READY',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `🍽️ Your order #${event.orderId.slice(-8)} is ready and waiting for a driver to pick it up`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000),
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    } else {
      console.log(`⚠️ WARNING: No customerId in ready-for-delivery event for order ${event.orderId}`);
    }
  }

  @EventPattern('orders.driver-accepted')
  handleDriverAccept(@Payload() event: any) {
    console.log(`🚗 [Kafka] orders.driver-accepted → ${event.orderId}`);
    
    // DEBUG: Log customer ID
    console.log(`🔍 DEBUG: Customer ID in driver-accepted event: ${event.customerId}`);
    
    // Kitchen gets notification when driver accepts (so they know someone is coming)
    const kitchenNotif: NotificationMessage = {
      id:        `driver_accept_kitchen_${event.orderId}`,
      type:      'DRIVER_ACCEPT',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `🚗 Driver ACCEPTED order #${event.orderId.slice(-8)} - will pick up soon`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 3 * 60_000),
      data:      event,
    };
    this.kitchenWs.sendNotification(kitchenNotif);

    // Personal notification for driver (stays the same)
    const driverNotif: NotificationMessage = {
      id:        `driver_accept_personal_${event.orderId}`,
      type:      'ORDER_ACCEPTED_BY_YOU',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `✅ You accepted order #${event.orderId.slice(-8)}. Please go to restaurant for pickup.`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60_000),
      data:      event,
    };
    this.driverWs.sendPersonalDriverNotification(event.metadata.driverId!, driverNotif);

    // Customer notification - driver assigned
    if (event.customerId) {
      console.log(`📱 Sending customer driver accept notification to customer: ${event.customerId}`);
      const customerNotif: NotificationMessage = {
        id:        `customer_driver_accept_${event.orderId}`,
        type:      'DRIVER_ACCEPTED',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `🚗 A driver has accepted your order #${event.orderId.slice(-8)} and is on the way to pick it up`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000),
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    } else {
      console.log(`⚠️ WARNING: No customerId in driver-accepted event for order ${event.orderId}`);
    }
  }

  @EventPattern('orders.picked-up')
  handleDriverPickup(@Payload() event: any) {
    console.log(`📦 [Kafka] orders.picked-up → ${event.orderId}`);
    
    // DEBUG: Log customer ID
    console.log(`🔍 DEBUG: Customer ID in picked-up event: ${event.customerId}`);
    
    // Kitchen gets notification that order was picked up
    const kitchenNotif: NotificationMessage = {
      id:        `driver_pickup_kitchen_${event.orderId}`,
      type:      'DRIVER_PICKUP',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `📦 Driver PICKED UP order #${event.orderId.slice(-8)} - on the way to customer`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60_000),
      data:      event,
    };
    this.kitchenWs.sendNotification(kitchenNotif);

    // Personal notification for driver only
    const driverNotif: NotificationMessage = {
      id:        `driver_pickup_personal_${event.orderId}`,
      type:      'ORDER_PICKED_UP',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `📦 Order #${event.orderId.slice(-8)} picked up. Navigate to delivery address.`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60_000), // 30 minutes for delivery
      data:      event,
    };
    this.driverWs.sendPersonalDriverNotification(event.metadata.driverId!, driverNotif);

    // Customer notification - order picked up
    if (event.customerId) {
      console.log(`📱 Sending customer driver pickup notification to customer: ${event.customerId}`);
      const customerNotif: NotificationMessage = {
        id:        `customer_driver_pickup_${event.orderId}`,
        type:      'DRIVER_PICKED_UP',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `📦 Your order #${event.orderId.slice(-8)} has been picked up and is on the way to you!`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000),
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    } else {
      console.log(`⚠️ WARNING: No customerId in picked-up event for order ${event.orderId}`);
    }
  }

  @EventPattern('orders.delivered')
  handleDriverDeliver(@Payload() event: any) {
    console.log(`🏠 [Kafka] orders.delivered → ${event.orderId}`);
    
    // DEBUG: Log customer ID
    console.log(`🔍 DEBUG: Customer ID in delivered event: ${event.customerId}`);
    
    // Kitchen gets notification that order was completed
    const kitchenNotif: NotificationMessage = {
      id:        `driver_deliver_kitchen_${event.orderId}`,
      type:      'DRIVER_DELIVER',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `🏠 Order #${event.orderId.slice(-8)} DELIVERED successfully to customer!`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60_000),
      data:      event,
    };
    this.kitchenWs.sendNotification(kitchenNotif);

    // Personal notification for driver
    const driverNotif: NotificationMessage = {
      id:        `driver_deliver_personal_${event.orderId}`,
      type:      'ORDER_DELIVERED',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `🎉 Order #${event.orderId.slice(-8)} delivered successfully! Well done!`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60_000),
      data:      event,
    };
    this.driverWs.sendPersonalDriverNotification(event.metadata.driverId!, driverNotif);

    // Customer notification - order delivered
    if (event.customerId) {
      console.log(`📱 Sending customer order delivered notification to customer: ${event.customerId}`);
      const customerNotif: NotificationMessage = {
        id:        `customer_order_delivered_${event.orderId}`,
        type:      'ORDER_DELIVERED',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `🎉 Your order #${event.orderId.slice(-8)} has been delivered! Enjoy your meal!`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000),
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    } else {
      console.log(`⚠️ WARNING: No customerId in delivered event for order ${event.orderId}`);
    }
  }

  // ======================== DINE-IN EVENTS ========================

  @EventPattern('orders.dine-in.created')
  handleDineInOrderCreated(@Payload() event: any) {
    console.log(`🍽️ [Kafka] orders.dine-in.created → ${event.orderId}`);
    
    // Kitchen notification - new dine-in order created
    const kitchenNotif: NotificationMessage = {
      id:        `dine_in_created_${event.orderId}`,
      type:      'DINE_IN_ORDER_CREATED',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `🍽️ New dine-in order created for table ${event.metadata?.tableNumber} - ${event.batches?.reduce((sum, batch) => sum + batch.items.length, 0)} items`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60_000),
      data:      event,
    };
    this.kitchenWs.sendNotification(kitchenNotif);

    // Waiter notification if they have waiterId
    if (event.metadata?.waiterId) {
      const waiterNotif: NotificationMessage = {
        id:        `waiter_order_created_${event.orderId}`,
        type:      'DINE_IN_ORDER_CREATED',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `✅ Dine-in order created for table ${event.metadata.tableNumber}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60_000),
        data:      event,
      };
      this.kitchenWs.sendNotification(waiterNotif);
    }

    // Customer notification if they have customerId
    if (event.customerId) {
      const customerNotif: NotificationMessage = {
        id:        `customer_dine_in_created_${event.orderId}`,
        type:      'DINE_IN_ORDER_CREATED',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `🍽️ Your dine-in order has been placed for table ${event.metadata?.tableNumber}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000), // 1 hour
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    }
  }

  @EventPattern('orders.dine-in.batch-sent-to-kitchen')
  async handleBatchSentToKitchen(@Payload() event: any) {
    console.log('📨 [WebSocket] Batch sent to kitchen:', event);
    
    try {
      const notification: NotificationMessage = {
        id: `batch-sent-${event.orderId}-${event.metadata?.batchNumber}-${Date.now()}`,
        type: 'BATCH_SENT_TO_KITCHEN',
        restaurantId: event.restaurantId,
        orderId: event.orderId,
        message: `🔔 New batch #${event.metadata?.batchNumber} sent to kitchen for Table ${event.metadata?.tableNumber}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        data: {
          batchNumber: event.metadata?.batchNumber,
          tableNumber: event.metadata?.tableNumber,
          itemCount: event.metadata?.itemIds?.length || 0,
          waiterId: event.waiterId,
          items: event.metadata?.itemIds
        }
      };

      // Send to kitchen
      this.kitchenWs.sendNotification(notification);

      // Send to waiter
      if (event.waiterId) {
        notification.id = `waiter-${notification.id}`;
        notification.message = `✅ Batch #${event.metadata?.batchNumber} sent to kitchen for Table ${event.metadata?.tableNumber}`;
        this.customerWs.sendCustomerOrderNotification(event.waiterId, notification);
      }

      // Send to customer
      if (event.customerId) {
        notification.id = `customer-${notification.id}`;
        notification.message = `🍽️ Your order batch #${event.metadata?.batchNumber} is now being prepared`;
        this.customerWs.sendCustomerOrderNotification(event.customerId, notification);
      }

    } catch (error) {
      console.error('❌ [WebSocket] Error handling batch sent to kitchen:', error);
    }
  }

  @EventPattern('orders.dine-in.batch-accepted')
  async handleBatchAccepted(@Payload() event: any) {
    console.log('✅ [WebSocket] Batch accepted by kitchen:', event);
    
    try {
      const notification: NotificationMessage = {
        id: `batch-accepted-${event.orderId}-${event.metadata?.batchNumber}-${Date.now()}`,
        type: 'BATCH_ACCEPTED',
        restaurantId: event.restaurantId,
        orderId: event.orderId,
        message: `👨‍🍳 Kitchen accepted batch #${event.metadata?.batchNumber} for Table ${event.metadata?.tableNumber}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        data: {
          batchNumber: event.metadata?.batchNumber,
          tableNumber: event.metadata?.tableNumber,
          chefId: event.metadata?.chefId,
          acceptedItems: event.metadata?.acceptedItems
        }
      };

      // Send to kitchen for info
      this.kitchenWs.sendNotification(notification);

      // Send to waiter
      if (event.waiterId) {
        notification.id = `waiter-${notification.id}`;
        notification.message = `✅ Kitchen accepted batch #${event.metadata?.batchNumber} for Table ${event.metadata?.tableNumber}`;
        this.customerWs.sendCustomerOrderNotification(event.waiterId, notification);
      }

      // Send to customer
      if (event.customerId) {
        notification.id = `customer-${notification.id}`;
        notification.message = `👨‍🍳 Kitchen is preparing your order batch #${event.metadata?.batchNumber}`;
        this.customerWs.sendCustomerOrderNotification(event.customerId, notification);
      }

    } catch (error) {
      console.error('❌ [WebSocket] Error handling batch accepted:', error);
    }
  }

  @EventPattern('orders.dine-in.batch-preparing')
  async handleBatchPreparing(@Payload() event: any) {
    console.log('🔄 [WebSocket] Batch preparing:', event);
    
    try {
      const notification: NotificationMessage = {
        id: `batch-preparing-${event.orderId}-${event.metadata?.batchNumber}-${Date.now()}`,
        type: 'BATCH_PREPARING',
        restaurantId: event.restaurantId,
        orderId: event.orderId,
        message: `🔥 Kitchen is preparing batch #${event.metadata?.batchNumber} for Table ${event.metadata?.tableNumber}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
        data: {
          batchNumber: event.metadata?.batchNumber,
          tableNumber: event.metadata?.tableNumber,
          chefId: event.metadata?.chefId,
          note: event.metadata?.note
        }
      };

      // Send to kitchen for status update
      this.kitchenWs.sendNotification(notification);

      // Send to waiter
      if (event.waiterId) {
        notification.id = `waiter-${notification.id}`;
        notification.message = `🔥 Batch #${event.metadata?.batchNumber} is now being prepared for Table ${event.metadata?.tableNumber}`;
        this.customerWs.sendCustomerOrderNotification(event.waiterId, notification);
      }

      // Send to customer
      if (event.customerId) {
        notification.id = `customer-${notification.id}`;
        notification.message = `🔥 Your order batch #${event.metadata?.batchNumber} is being prepared`;
        this.customerWs.sendCustomerOrderNotification(event.customerId, notification);
      }

    } catch (error) {
      console.error('❌ [WebSocket] Error handling batch preparing:', error);
    }
  }

  @EventPattern('orders.dine-in.batch-ready')
  async handleBatchReady(@Payload() event: any) {
    console.log('🍽️ [WebSocket] Batch ready for service:', event);
    
    try {
      const notification: NotificationMessage = {
        id: `batch-ready-${event.orderId}-${event.metadata?.batchNumber}-${Date.now()}`,
        type: 'BATCH_READY',
        restaurantId: event.restaurantId,
        orderId: event.orderId,
        message: `🍽️ Batch #${event.metadata?.batchNumber} ready for service at Table ${event.metadata?.tableNumber}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        data: {
          batchNumber: event.metadata?.batchNumber,
          tableNumber: event.metadata?.tableNumber,
          chefId: event.metadata?.chefId,
          readyAt: event.metadata?.timestamp
        }
      };

      // Send to kitchen for completion confirmation
      this.kitchenWs.sendNotification(notification);

      // Send to waiter - HIGH PRIORITY for service
      if (event.waiterId) {
        notification.id = `waiter-${notification.id}`;
        notification.message = `🚨 READY FOR SERVICE: Batch #${event.metadata?.batchNumber} at Table ${event.metadata?.tableNumber}`;
        notification.type = 'URGENT_BATCH_READY';
        this.customerWs.sendCustomerOrderNotification(event.waiterId, notification);
      }

      // Send to customer
      if (event.customerId) {
        notification.id = `customer-${notification.id}`;
        notification.message = `🍽️ Your order batch #${event.metadata?.batchNumber} is ready! Waiter will serve shortly.`;
        this.customerWs.sendCustomerOrderNotification(event.customerId, notification);
      }

    } catch (error) {
      console.error('❌ [WebSocket] Error handling batch ready:', error);
    }
  }

  @EventPattern('orders.dine-in.batch-served')
  async handleBatchServed(@Payload() event: any) {
    console.log('✅ [WebSocket] Batch served to customer:', event);
    
    try {
      const notification: NotificationMessage = {
        id: `batch-served-${event.orderId}-${event.metadata?.batchNumber}-${Date.now()}`,
        type: 'BATCH_SERVED',
        restaurantId: event.restaurantId,
        orderId: event.orderId,
        message: `✅ Batch #${event.metadata?.batchNumber} served at Table ${event.metadata?.tableNumber}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        data: {
          batchNumber: event.metadata?.batchNumber,
          tableNumber: event.metadata?.tableNumber,
          waiterId: event.waiterId,
          servedAt: event.metadata?.servedAt,
          note: event.metadata?.note
        }
      };

      // Send to kitchen for completion tracking
      this.kitchenWs.sendNotification(notification);

      // Send to waiter
      if (event.waiterId) {
        notification.id = `waiter-${notification.id}`;
        notification.message = `✅ Successfully served batch #${event.metadata?.batchNumber} to Table ${event.metadata?.tableNumber}`;
        this.customerWs.sendCustomerOrderNotification(event.waiterId, notification);
      }

      // Send to customer
      if (event.customerId) {
        notification.id = `customer-${notification.id}`;
        notification.message = `🍽️ Enjoy your meal! Batch #${event.metadata?.batchNumber} has been served.`;
        this.customerWs.sendCustomerOrderNotification(event.customerId, notification);
      }

    } catch (error) {
      console.error('❌ [WebSocket] Error handling batch served:', error);
    }
  }

  @EventPattern('orders.PAYMENT_REQUESTED')
  handleDineInPaymentRequested(@Payload() event: any) {
    console.log(`💳 [Kafka] orders.PAYMENT_REQUESTED → ${event.orderId}`);
    
    // Kitchen notification
    const kitchenNotif: NotificationMessage = {
      id:        `kitchen_payment_requested_${event.orderId}`,
      type:      'DINE_IN_PAYMENT_REQUESTED',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `💳 Payment requested for table ${event.metadata.tableNumber}`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 3 * 60_000),
      data:      event,
    };
    this.kitchenWs.sendNotification(kitchenNotif);

    // Waiter confirmation
    if (event.waiterId) {
      const waiterNotif: NotificationMessage = {
        id:        `waiter_payment_requested_${event.orderId}`,
        type:      'PAYMENT_REQUESTED_CONFIRMATION',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `💳 Payment requested for table ${event.metadata.tableNumber} - Total: $${event.metadata.totalAmount}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60_000),
        data:      event,
      };
      this.kitchenWs.sendNotification(waiterNotif);
    }

    // Customer notification
    if (event.customerId) {
      const customerNotif: NotificationMessage = {
        id:        `customer_payment_requested_${event.orderId}`,
        type:      'PAYMENT_REQUESTED',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `💳 Your bill is ready for table ${event.metadata.tableNumber} - Total: $${event.metadata.totalAmount}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60_000),
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    }
  }

  @EventPattern('orders.COMPLETED')
  handleDineInCompleted(@Payload() event: any) {
    console.log(`🎉 [Kafka] orders.COMPLETED → ${event.orderId}`);
    
    // Kitchen notification
    const kitchenNotif: NotificationMessage = {
      id:        `kitchen_order_completed_${event.orderId}`,
      type:      'DINE_IN_ORDER_COMPLETED',
      restaurantId: event.restaurantId,
      orderId:   event.orderId,
      message:   `🎉 Order completed for table ${event.metadata.tableNumber} - Payment: ${event.metadata.paymentMethod}`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60_000),
      data:      event,
    };
    this.kitchenWs.sendNotification(kitchenNotif);

    // Waiter confirmation
    if (event.waiterId) {
      const waiterNotif: NotificationMessage = {
        id:        `waiter_order_completed_${event.orderId}`,
        type:      'ORDER_COMPLETED_CONFIRMATION',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `🎉 Order completed for table ${event.metadata.tableNumber} - Payment: $${event.metadata.amountPaid} via ${event.metadata.paymentMethod}`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 10 * 60_000),
        data:      event,
      };
      this.kitchenWs.sendNotification(waiterNotif);
    }

    // Customer notification
    if (event.customerId) {
      const customerNotif: NotificationMessage = {
        id:        `customer_order_completed_${event.orderId}`,
        type:      'ORDER_COMPLETED',
        restaurantId: event.restaurantId,
        orderId:   event.orderId,
        message:   `🎉 Thank you for dining with us at table ${event.metadata.tableNumber}! Hope you enjoyed your meal!`,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60_000), // 2 hours
        data:      event,
      };
      this.customerWs.sendCustomerOrderNotification(event.customerId, customerNotif);
    }
  }
}
