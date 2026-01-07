import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { 
  OrderEvent, 
  ORDER_TOPICS, 
  DineInOrderCreatedEvent, 
  BatchSentToKitchenEvent, 
  ItemStatusChangedEvent, 
  PaymentRequestedEvent, 
  DineInCompletedEvent,
  // Takeaway events
  TakeawayOrderCreatedEvent,
  KitchenAcceptTakeawayEvent,
  KitchenPreparingTakeawayEvent,
  KitchenReadyTakeawayEvent,
  CustomerPickupTakeawayEvent,
  // Delivery events
  DeliveryOrderCreatedEvent
} from '@rm/common';

@Injectable()
export class KafkaService implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Subscribe to all order topics
    Object.values(ORDER_TOPICS).forEach(topic => {
      this.kafkaClient.subscribeToResponseOf(topic);
    });

    await this.kafkaClient.connect();
  }

  // Generic emit method
  async emit(topic: string, event: any) {
    await this.kafkaClient.emit(topic, event);
  }

  async emitOrderEvent(event: OrderEvent) {
    console.log('DEBUG - emitOrderEvent received status:', event.status);
    console.log('DEBUG - Available ORDER_TOPICS:', Object.keys(ORDER_TOPICS));
    console.log('DEBUG - Full ORDER_TOPICS:', ORDER_TOPICS);
    
    const topic = ORDER_TOPICS[event.status];
    console.log('DEBUG - Found topic for status:', topic);
    
    if (!topic) {
      throw new Error(`No topic defined for status ${event.status}`);
    }
    await this.kafkaClient.emit(topic, event);
  }

  async emitNewOrder(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitOrderCancelled(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitOrderConfirmed(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitKitchenAccepted(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitPreparing(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitReady(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitWaiterAccepted(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitServed(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitCompleted(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitReadyForDelivery(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitDriverAccepted(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitPickedUp(event: OrderEvent) {
    return this.emitOrderEvent(event);
  }

  async emitDelivered(event: OrderEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.DELIVERED, event);
  }

  // New dine-in specific emit methods
  async emitDineInCreated(event: DineInOrderCreatedEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_CREATED, event);
  }

  async emitBatchSentToKitchen(event: BatchSentToKitchenEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.BATCH_SENT_TO_KITCHEN, event);
  }

  async emitBatchAccepted(event: any) {
    await this.kafkaClient.emit(ORDER_TOPICS.BATCH_ACCEPTED, event);
  }

  async emitBatchPreparing(event: any) {
    await this.kafkaClient.emit(ORDER_TOPICS.BATCH_PREPARING, event);
  }

  async emitBatchReady(event: any) {
    await this.kafkaClient.emit(ORDER_TOPICS.BATCH_READY, event);
  }

  async emitBatchServed(event: any) {
    await this.kafkaClient.emit(ORDER_TOPICS.BATCH_SERVED, event);
  }

  async emitPaymentRequested(event: PaymentRequestedEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.PAYMENT_REQUESTED, event);
  }

  async emitDineInCompleted(event: DineInCompletedEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_COMPLETED, event);
  }

  // ======================== DELIVERY EVENTS ========================
  async emitDeliveryOrderCreated(event: DeliveryOrderCreatedEvent) {
    console.log(`🔥🔥🔥 [MENU-ORDER-SERVICE] EMITTING TO KAFKA TOPIC: ${ORDER_TOPICS.DELIVERY_ORDER_CREATED} 🔥🔥🔥`);
    console.log(`🔥🔥🔥 Topic exact value: "${ORDER_TOPICS.DELIVERY_ORDER_CREATED}" 🔥🔥🔥`);
    console.log(`🔥🔥🔥 Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DELIVERY_ORDER_CREATED, event);
    console.log(`🔥🔥🔥 [MENU-ORDER-SERVICE] EVENT EMITTED SUCCESSFULLY! 🔥🔥🔥`);
  }

  async emitOrderDelivered(event: OrderEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.DELIVERED, event);
  }

  // ======================== TAKEAWAY EVENTS ========================
  async emitTakeawayOrderCreated(event: TakeawayOrderCreatedEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.TAKEAWAY_ORDER_CREATED, event);
  }

  async emitKitchenAcceptTakeaway(event: KitchenAcceptTakeawayEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.TAKEAWAY_KITCHEN_ACCEPT, event);
  }

  async emitKitchenPreparingTakeaway(event: KitchenPreparingTakeawayEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.TAKEAWAY_KITCHEN_PREPARING, event);
  }

  async emitKitchenReadyTakeaway(event: KitchenReadyTakeawayEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.TAKEAWAY_KITCHEN_READY, event);
  }

  async emitCustomerPickupTakeaway(event: CustomerPickupTakeawayEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.TAKEAWAY_CUSTOMER_PICKUP, event);
  }

  // ======================== GENERIC COMPLETED ========================
  async emitOrderCompleted(event: OrderEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.COMPLETED, event);
  }
} 