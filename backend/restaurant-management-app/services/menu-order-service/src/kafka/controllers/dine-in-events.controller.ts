import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, MessagePattern } from '@nestjs/microservices';
import { Types } from 'mongoose';
import { 
  // Dine-in events imported from @rm/common
  ORDER_TOPICS,
  OrderEvent,
  WaiterCreateDineInEvent,
  WaiterSendBatchEvent,
  WaiterAddBatchEvent,
  WaiterServeBatchEvent,
  WaiterRequestPaymentEvent,
  WaiterCompletePaymentEvent,
  KitchenAcceptBatchEvent,
  KitchenBatchPreparingEvent,
  KitchenBatchReadyEvent,
  KitchenItemPreparingEvent,
  KitchenItemReadyEvent
} from '@rm/common';
import { DineInOrdersService } from '../../orders/services/dine-in-orders.service';
import { KafkaService } from '../kafka.service';

@Controller()
export class DineInEventsController {
  private readonly logger = new Logger(DineInEventsController.name);

  constructor(
    private readonly dineInOrdersService: DineInOrdersService,
    private readonly kafkaService: KafkaService,
  ) {}

  // ======================== WAITER EVENTS ========================

  @EventPattern('dine-in.waiter.create')
  async handleWaiterCreateDineIn(@Payload() event: WaiterCreateDineInEvent) {
    console.log(`[DineInEventsController] Processing waiter create dine-in event`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Extract necessary data from event
      const waiterId = event.metadata.waiterId;
      const restaurantId = event.restaurantId;
      const customerEmail = event.metadata.customerEmail;
      
      if (!waiterId || !restaurantId || !customerEmail) {
        throw new Error(`Missing required data: waiterId=${waiterId}, restaurantId=${restaurantId}, customerEmail=${customerEmail}`);
      }
      
      // Get waiter email (for now, use placeholder - could fetch from auth service if needed)
      const waiterEmail = event.metadata.waiterEmail || 'waiter@restaurant.com';
      
      // Build CreateDineInOrderDto according to the service interface
      const createOrderDto = {
        customerEmail: customerEmail,
        customerName: event.metadata.customerName || 'Customer',
        tableNumber: event.metadata.tableNumber || 1,
          batches: [{
          items: event.metadata.items?.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              specialInstructions: item.specialInstructions
          })) || [],
          batchNote: event.metadata.orderNotes
          }],
        orderNotes: event.metadata.orderNotes
      };
      
      console.log(`[DineInEventsController] Creating dine-in order with waiterId: ${waiterId}, waiterEmail: ${waiterEmail}`);
      console.log(`[DineInEventsController] CreateOrderDto:`, JSON.stringify(createOrderDto, null, 2));
      
      // Create the actual order in database using correct service method signature
      const createdOrder = await this.dineInOrdersService.createDineInOrder(
        waiterId,
        waiterEmail, 
        restaurantId,
        createOrderDto
      );
      
      console.log(`[DineInEventsController] Dine-in order created successfully with ID: ${createdOrder._id}`);
      console.log(`[DineInEventsController] Order customerId: ${createdOrder.customerId}, waiterId: ${createdOrder.waiterId}`);
      
      // The createDineInOrder service method already emits dine-in.created event
      // which will be processed by WebSocket gateway for notifications
      // No need to emit additional events here
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to create dine-in order: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  @EventPattern('dine-in.waiter.send-batch')
  async handleWaiterSendBatch(@Payload() event: WaiterSendBatchEvent) {
    console.log(`[DineInEventsController] Processing waiter send batch: ${event.orderId} batch ${event.metadata.batchNumber}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Call service to actually send batch to kitchen (this will update DB and emit events)
      await this.dineInOrdersService.sendBatchToKitchen(
        event.orderId,
        event.restaurantId,
        event.metadata.waiterId,
        {
          batchNumber: event.metadata.batchNumber,
          kitchenNote: event.metadata.note
        }
      );
      
      console.log(`[DineInEventsController] Batch ${event.metadata.batchNumber} sent to kitchen successfully`);
      
      // Note: No need to emit event manually - sendBatchToKitchen service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process waiter send batch: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  @EventPattern('dine-in.waiter.add-batch')
  async handleWaiterAddBatch(@Payload() event: WaiterAddBatchEvent) {
    console.log(`[DineInEventsController] Processing waiter add batch: ${event.orderId}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Call service to actually add batch to order (this will update DB and emit events)
      await this.dineInOrdersService.addBatchToOrder(
        event.orderId,
        event.restaurantId,
        event.metadata.waiterId,
        {
          items: event.metadata.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions
          })),
          batchNote: event.metadata.note,
          sendToKitchen: true // Automatically send to kitchen based on status
        }
      );
      
      console.log(`[DineInEventsController] Batch added to order successfully: ${event.orderId}`);
      
      // Note: No need to emit event manually - addBatchToOrder service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process waiter add batch: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  @EventPattern('dine-in.waiter.serve-batch')
  async handleWaiterServeBatch(@Payload() event: WaiterServeBatchEvent) {
    console.log(`[DineInEventsController] Processing waiter serve batch: ${event.orderId} batch ${event.metadata.batchNumber}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Call service to actually serve batch (this will update DB and emit events)
      await this.dineInOrdersService.serveBatch(
        event.orderId,
        event.restaurantId,
        event.metadata.waiterId,
        {
          batchNumber: event.metadata.batchNumber,
          note: event.metadata.note
        }
      );
      
      console.log(`[DineInEventsController] Batch ${event.metadata.batchNumber} served successfully`);
      
      // Note: No need to emit event manually - serveBatch service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process waiter serve batch: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  @EventPattern('dine-in.waiter.request-payment')
  async handleWaiterRequestPayment(@Payload() event: WaiterRequestPaymentEvent) {
    console.log(`[DineInEventsController] Processing waiter request payment: ${event.orderId}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Call service to actually request payment (this will update DB and emit events)
      await this.dineInOrdersService.requestPayment(
        event.orderId,
        event.restaurantId,
        event.metadata.waiterId,
        {
          note: event.metadata.note
        }
      );
      
      console.log(`[DineInEventsController] Payment requested successfully for order: ${event.orderId}`);
      
      // Note: No need to emit event manually - requestPayment service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process waiter request payment: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  @EventPattern('dine-in.waiter.complete-payment')
  async handleWaiterCompletePayment(@Payload() event: WaiterCompletePaymentEvent) {
    console.log(`[DineInEventsController] Processing waiter complete payment: ${event.orderId}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Get order to extract totalAmount for payment completion
      const order = await this.dineInOrdersService.getDineInOrderById(event.orderId, event.restaurantId);
      
      // Call service to actually complete payment (this will update DB and emit events)
      await this.dineInOrdersService.completePayment(
        event.orderId,
        event.restaurantId,
        event.metadata.waiterId,
        {
          paymentMethod: event.metadata.paymentMethod as 'CASH' | 'CARD' | 'DIGITAL',
          amountPaid: order.totalAmount, // Use actual order total amount
          note: event.metadata.note
        }
      );
      
      console.log(`[DineInEventsController] Payment completed successfully for order: ${event.orderId}`);
      
      // Note: No need to emit event manually - completePayment service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process waiter complete payment: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  // ======================== KITCHEN EVENTS ========================

  @EventPattern('dine-in.kitchen.accept-batch')
  async handleKitchenAcceptBatch(@Payload() event: KitchenAcceptBatchEvent) {
    console.log(`[DineInEventsController] Processing kitchen accept batch: ${event.orderId} batch ${event.metadata.batchNumber}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Call service to actually accept batch in kitchen (this will update DB and emit events)
      await this.dineInOrdersService.kitchenAcceptBatch(
        event.orderId,
        event.restaurantId,
        event.metadata.chefId,
        event.metadata.batchNumber
      );
      
      console.log(`[DineInEventsController] Kitchen accepted batch ${event.metadata.batchNumber} successfully`);
      
      // Note: No need to emit event manually - kitchenAcceptBatch service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process kitchen accept batch: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  @EventPattern('dine-in.kitchen.batch-preparing')
  async handleKitchenBatchPreparing(@Payload() event: KitchenBatchPreparingEvent) {
    console.log(`[DineInEventsController] Processing kitchen batch preparing: ${event.orderId} batch ${event.metadata.batchNumber}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Call service to mark batch as preparing (this will update DB and emit events)
      await this.dineInOrdersService.batchPreparing(
        event.orderId,
        event.restaurantId,
        event.metadata.batchNumber,
        event.metadata.chefId,
        event.metadata.note
      );
      
      console.log(`[DineInEventsController] Kitchen batch ${event.metadata.batchNumber} marked as preparing successfully`);
      
      // Note: No need to emit event manually - batchPreparing service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process kitchen batch preparing: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  @EventPattern('dine-in.kitchen.batch-ready')
  async handleKitchenBatchReady(@Payload() event: KitchenBatchReadyEvent) {
    console.log(`[DineInEventsController] Processing kitchen batch ready: ${event.orderId} batch ${event.metadata.batchNumber}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Call service to mark batch as ready (this will update DB and emit events)
      await this.dineInOrdersService.batchReady(
        event.orderId,
        event.restaurantId,
        event.metadata.batchNumber,
        event.metadata.chefId,
        event.metadata.note
      );
      
      console.log(`[DineInEventsController] Kitchen batch ${event.metadata.batchNumber} marked as ready successfully`);
      
      // Note: No need to emit event manually - batchReady service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process kitchen batch ready: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  @EventPattern('dine-in.kitchen.item-preparing')
  async handleKitchenItemPreparing(@Payload() event: KitchenItemPreparingEvent) {
    console.log(`[DineInEventsController] Processing kitchen item preparing: ${event.orderId} batch ${event.metadata.batchNumber} item ${event.metadata.productId}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Call service to update individual item status (this will update DB and emit events)
      await this.dineInOrdersService.updateItemStatus(
        event.orderId,
        event.restaurantId,
        event.metadata.batchNumber,
        event.metadata.productId,
        event.metadata.chefId,
        'PREPARING'
      );
      
      console.log(`[DineInEventsController] Kitchen item ${event.metadata.productId} in batch ${event.metadata.batchNumber} marked as preparing successfully`);
      
      // Note: No need to emit event manually - updateItemStatus service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process kitchen item preparing: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }

  @EventPattern('dine-in.kitchen.item-ready')
  async handleKitchenItemReady(@Payload() event: KitchenItemReadyEvent) {
    console.log(`[DineInEventsController] Processing kitchen item ready: ${event.orderId} batch ${event.metadata.batchNumber} item ${event.metadata.productId}`);
    console.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
    
    try {
      // Call service to update individual item status (this will update DB and emit events)
      await this.dineInOrdersService.updateItemStatus(
        event.orderId,
        event.restaurantId,
        event.metadata.batchNumber,
        event.metadata.productId,
        event.metadata.chefId,
        'READY'
      );
      
      console.log(`[DineInEventsController] Kitchen item ${event.metadata.productId} in batch ${event.metadata.batchNumber} marked as ready successfully`);
      
      // Note: No need to emit event manually - updateItemStatus service already emits it
      
    } catch (error) {
      console.error(`[DineInEventsController] Failed to process kitchen item ready: ${error.message}`);
      console.error(`[DineInEventsController] Full error:`, error);
    }
  }
} 