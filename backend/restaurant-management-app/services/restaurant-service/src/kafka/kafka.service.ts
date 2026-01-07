import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ORDER_TOPICS } from '@rm/common';
import { 
  KitchenAcceptTakeawayEvent,
  KitchenPreparingTakeawayEvent,
  KitchenReadyTakeawayEvent,
  CustomerPickupTakeawayEvent,
  DriverAcceptDeliveryEvent,
  DriverPickupDeliveryEvent,
  DriverDeliverOrderEvent,
  KitchenAcceptDeliveryEvent,
  KitchenPreparingDeliveryEvent,
  KitchenReadyDeliveryEvent,
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
  KitchenItemReadyEvent,
  KitchenGetPendingOrdersRequestEvent,
  KitchenGetDineInPendingRequestEvent,
  KitchenGetActiveOrdersRequestEvent,
  KitchenGetAcceptedOrdersRequestEvent,
  KitchenGetDineInAcceptedRequestEvent,
  KitchenGetReadyTakeawayRequestEvent,
  KitchenGetReadyDeliveryRequestEvent,
  WaiterGetAllOrdersRequestEvent,
  WaiterGetReadyBatchesRequestEvent,
  WaiterGetCurrentOrdersRequestEvent,
  WaiterGetCompletedOrdersRequestEvent,
  WaiterGetReadyTakeawayRequestEvent,
  DriverGetReadyOrdersRequestEvent,
  DriverGetAssignedOrdersRequestEvent,
  DriverGetCompletedOrdersRequestEvent,
  KitchenGetPendingDeliveryRequestEvent,
  KitchenGetInProgressDeliveryRequestEvent,
  KitchenGetPendingTakeawayRequestEvent,
  KitchenGetDineInReadyRequestEvent
} from '@rm/common';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Subscribe to all order topics
    Object.values(ORDER_TOPICS).forEach(topic => {
      this.kafkaClient.subscribeToResponseOf(topic);
    });

    // Subscribe to new response topics specifically
    this.kafkaClient.subscribeToResponseOf(ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_RESPONSE);
    this.kafkaClient.subscribeToResponseOf(ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_RESPONSE);
    
    // Subscribe to driver completed orders topics
    this.kafkaClient.subscribeToResponseOf(ORDER_TOPICS.DRIVER_GET_COMPLETED_ORDERS_REQUEST);
    this.kafkaClient.subscribeToResponseOf(ORDER_TOPICS.DRIVER_GET_COMPLETED_ORDERS_RESPONSE);

    await this.kafkaClient.connect();
    console.log('Restaurant Service Kafka client connected');
  }

  // Generic emit method
  async emit(topic: string, event: any) {
    console.log(`Emitting event to topic ${topic}:`, event);
    await this.kafkaClient.emit(topic, event);
  }

  async emitOrderEvent(topic: string, event: any) {
    console.log(`Emitting event to topic ${topic}:`, event);
    await this.kafkaClient.emit(topic, event);
  }

  async emitNewOrder(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.NEW, event);
  }

  async emitOrderCancelled(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.CANCELLED, event);
  }

  async emitOrderConfirmed(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.CONFIRMED, event);
  }

  async emitKitchenAccepted(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.KITCHEN_ACCEPTED, event);
  }

  async emitPreparing(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.PREPARING, event);
  }

  async emitReady(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.READY, event);
  }

  async emitWaiterAccepted(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.WAITER_ACCEPTED, event);
  }

  async emitServed(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.SERVED, event);
  }

  async emitCompleted(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.COMPLETED, event);
  }

  async emitReadyForDelivery(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.READY_FOR_DELIVERY, event);
  }

  async emitDriverAccepted(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.DRIVER_ACCEPTED, event);
  }

  async emitPickedUp(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.PICKED_UP, event);
  }

  async emitDelivered(event: any) {
    return this.emitOrderEvent(ORDER_TOPICS.DELIVERED, event);
  }

  // Takeaway specific emit methods
  async emitKitchenAcceptTakeaway(event: KitchenAcceptTakeawayEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.TAKEAWAY_KITCHEN_ACCEPT}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.TAKEAWAY_KITCHEN_ACCEPT, event);
    console.log(`[KafkaService] Event emitted successfully`);
  }

  async emitKitchenPreparingTakeaway(event: KitchenPreparingTakeawayEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.TAKEAWAY_KITCHEN_PREPARING, event);
  }

  async emitKitchenReadyTakeaway(event: KitchenReadyTakeawayEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.TAKEAWAY_KITCHEN_READY}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.TAKEAWAY_KITCHEN_READY, event);
  }

  async emitCustomerPickupTakeaway(event: CustomerPickupTakeawayEvent) {
    await this.kafkaClient.emit(ORDER_TOPICS.TAKEAWAY_CUSTOMER_PICKUP, event);
  }

  // Delivery specific emit methods
  async emitDriverAcceptDelivery(event: DriverAcceptDeliveryEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DELIVERY_DRIVER_ACCEPT}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DELIVERY_DRIVER_ACCEPT, event);
    console.log(`[KafkaService] Event emitted successfully`);
  }

  async emitDriverPickupDelivery(event: DriverPickupDeliveryEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DELIVERY_DRIVER_PICKUP}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DELIVERY_DRIVER_PICKUP, event);
    console.log(`[KafkaService] Event emitted successfully`);
  }

  async emitDriverDeliverOrder(event: DriverDeliverOrderEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DELIVERY_DRIVER_DELIVER}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DELIVERY_DRIVER_DELIVER, event);
    console.log(`[KafkaService] Event emitted successfully`);
  }

  // ======================== DELIVERY KITCHEN EVENTS ========================

  async emitKitchenAcceptDelivery(event: KitchenAcceptDeliveryEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DELIVERY_KITCHEN_ACCEPT}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DELIVERY_KITCHEN_ACCEPT, event);
  }

  async emitKitchenPreparingDelivery(event: KitchenPreparingDeliveryEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DELIVERY_KITCHEN_PREPARING}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DELIVERY_KITCHEN_PREPARING, event);
  }

  async emitKitchenReadyDelivery(event: KitchenReadyDeliveryEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DELIVERY_KITCHEN_READY}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DELIVERY_KITCHEN_READY, event);
  }

  // ======================== DINE-IN WAITER EVENTS ========================

  async emitWaiterCreateDineIn(event: WaiterCreateDineInEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_WAITER_CREATE}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_WAITER_CREATE, event);
  }

  async emitWaiterSendBatch(event: WaiterSendBatchEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_WAITER_SEND_BATCH}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_WAITER_SEND_BATCH, event);
  }

  async emitWaiterAddBatch(event: WaiterAddBatchEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_WAITER_ADD_BATCH}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_WAITER_ADD_BATCH, event);
  }

  async emitWaiterServeBatch(event: WaiterServeBatchEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_WAITER_SERVE_BATCH}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_WAITER_SERVE_BATCH, event);
  }

  async emitWaiterRequestPayment(event: WaiterRequestPaymentEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_WAITER_REQUEST_PAYMENT}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_WAITER_REQUEST_PAYMENT, event);
  }

  async emitWaiterCompletePayment(event: WaiterCompletePaymentEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_WAITER_COMPLETE_PAYMENT}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_WAITER_COMPLETE_PAYMENT, event);
  }

  // ======================== DINE-IN KITCHEN EVENTS ========================

  async emitKitchenAcceptBatch(event: KitchenAcceptBatchEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_KITCHEN_ACCEPT_BATCH}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_KITCHEN_ACCEPT_BATCH, event);
  }

  async emitKitchenBatchPreparing(event: KitchenBatchPreparingEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_KITCHEN_BATCH_PREPARING}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_KITCHEN_BATCH_PREPARING, event);
  }

  async emitKitchenBatchReady(event: KitchenBatchReadyEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_KITCHEN_BATCH_READY}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_KITCHEN_BATCH_READY, event);
  }

  async emitKitchenItemPreparing(event: KitchenItemPreparingEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_KITCHEN_ITEM_PREPARING}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_KITCHEN_ITEM_PREPARING, event);
  }

  async emitKitchenItemReady(event: KitchenItemReadyEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DINE_IN_KITCHEN_ITEM_READY}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DINE_IN_KITCHEN_ITEM_READY, event);
  }

  // ======================== KITCHEN REQUEST/RESPONSE EVENTS ========================

  async emitKitchenGetPendingOrdersRequest(event: KitchenGetPendingOrdersRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST, event);
  }

  async emitKitchenGetDineInPendingRequest(event: KitchenGetDineInPendingRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST, event);
  }

  async emitKitchenGetActiveOrdersRequest(event: KitchenGetActiveOrdersRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST, event);
  }

  async emitKitchenGetAcceptedOrdersRequest(event: KitchenGetAcceptedOrdersRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST, event);
  }

  async emitKitchenGetDineInAcceptedRequest(event: KitchenGetDineInAcceptedRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST, event);
  }

  async emitKitchenGetReadyTakeawayRequest(event: KitchenGetReadyTakeawayRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST, event);
  }

  async emitKitchenGetReadyDeliveryRequest(event: KitchenGetReadyDeliveryRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST, event);
  }

  async emitKitchenGetPendingDeliveryRequest(event: KitchenGetPendingDeliveryRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_PENDING_DELIVERY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_PENDING_DELIVERY_REQUEST, event);
  }

  async emitKitchenGetInProgressDeliveryRequest(event: KitchenGetInProgressDeliveryRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_IN_PROGRESS_DELIVERY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_IN_PROGRESS_DELIVERY_REQUEST, event);
  }

  async emitKitchenGetPendingTakeawayRequest(event: KitchenGetPendingTakeawayRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_PENDING_TAKEAWAY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_PENDING_TAKEAWAY_REQUEST, event);
  }

  async emitKitchenGetDineInReadyRequest(event: KitchenGetDineInReadyRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.KITCHEN_GET_DINE_IN_READY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.KITCHEN_GET_DINE_IN_READY_REQUEST, event);
  }

  // ======================== WAITER REQUEST/RESPONSE EVENTS ========================

  async emitWaiterGetAllOrdersRequest(event: WaiterGetAllOrdersRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST, event);
  }

  async emitWaiterGetReadyBatchesRequest(event: WaiterGetReadyBatchesRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST, event);
  }

  async emitWaiterGetCurrentOrdersRequest(event: WaiterGetCurrentOrdersRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST, event);
  }

  async emitWaiterGetCompletedOrdersRequest(event: WaiterGetCompletedOrdersRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST, event);
  }

  async emitWaiterGetReadyTakeawayRequest(event: WaiterGetReadyTakeawayRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST, event);
  }

  // ======================== DRIVER REQUEST/RESPONSE EVENTS ========================

  async emitDriverGetReadyOrdersRequest(event: DriverGetReadyOrdersRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST, event);
  }

  async emitDriverGetAssignedOrdersRequest(event: DriverGetAssignedOrdersRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST, event);
  }

  async emitDriverGetCompletedOrdersRequest(event: DriverGetCompletedOrdersRequestEvent) {
    console.log(`[KafkaService] Emitting to topic: ${ORDER_TOPICS.DRIVER_GET_COMPLETED_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    await this.kafkaClient.emit(ORDER_TOPICS.DRIVER_GET_COMPLETED_ORDERS_REQUEST, event);
  }

  // ======================== REQUEST/RESPONSE METHODS ========================

  async sendKitchenGetPendingOrdersRequest(event: KitchenGetPendingOrdersRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST, event);
  }

  async sendKitchenGetDineInPendingRequest(event: KitchenGetDineInPendingRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST, event);
  }

  async sendKitchenGetActiveOrdersRequest(event: KitchenGetActiveOrdersRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST, event);
  }

  async sendKitchenGetAcceptedOrdersRequest(event: KitchenGetAcceptedOrdersRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST, event);
  }

  async sendKitchenGetDineInAcceptedRequest(event: KitchenGetDineInAcceptedRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST, event);
  }

  async sendKitchenGetReadyTakeawayRequest(event: KitchenGetReadyTakeawayRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST, event);
  }

  async sendKitchenGetReadyDeliveryRequest(event: KitchenGetReadyDeliveryRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST, event);
  }

  async sendKitchenGetPendingDeliveryRequest(event: KitchenGetPendingDeliveryRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_PENDING_DELIVERY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_PENDING_DELIVERY_REQUEST, event);
  }

  async sendKitchenGetInProgressDeliveryRequest(event: KitchenGetInProgressDeliveryRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_IN_PROGRESS_DELIVERY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_IN_PROGRESS_DELIVERY_REQUEST, event);
  }

  async sendKitchenGetPendingTakeawayRequest(event: KitchenGetPendingTakeawayRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_PENDING_TAKEAWAY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_PENDING_TAKEAWAY_REQUEST, event);
  }

  async sendKitchenGetDineInReadyRequest(event: KitchenGetDineInReadyRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.KITCHEN_GET_DINE_IN_READY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.KITCHEN_GET_DINE_IN_READY_REQUEST, event);
  }

  async sendWaiterGetAllOrdersRequest(event: WaiterGetAllOrdersRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST, event);
  }

  async sendWaiterGetReadyBatchesRequest(event: WaiterGetReadyBatchesRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST, event);
  }

  async sendWaiterGetCurrentOrdersRequest(event: WaiterGetCurrentOrdersRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST, event);
  }

  async sendWaiterGetCompletedOrdersRequest(event: WaiterGetCompletedOrdersRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST, event);
  }

  async sendWaiterGetReadyTakeawayRequest(event: WaiterGetReadyTakeawayRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST, event);
  }

  async sendDriverGetReadyOrdersRequest(event: DriverGetReadyOrdersRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST, event);
  }

  async sendDriverGetAssignedOrdersRequest(event: DriverGetAssignedOrdersRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST, event);
  }

  async sendDriverGetCompletedOrdersRequest(event: DriverGetCompletedOrdersRequestEvent) {
    console.log(`[KafkaService] Sending to topic: ${ORDER_TOPICS.DRIVER_GET_COMPLETED_ORDERS_REQUEST}`);
    console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
    return this.kafkaClient.send(ORDER_TOPICS.DRIVER_GET_COMPLETED_ORDERS_REQUEST, event);
  }
} 