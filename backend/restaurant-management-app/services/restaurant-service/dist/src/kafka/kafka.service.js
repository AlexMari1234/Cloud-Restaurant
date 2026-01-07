"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var KafkaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@rm/common");
let KafkaService = KafkaService_1 = class KafkaService {
    kafkaClient;
    logger = new common_1.Logger(KafkaService_1.name);
    constructor(kafkaClient) {
        this.kafkaClient = kafkaClient;
    }
    async onModuleInit() {
        Object.values(common_2.ORDER_TOPICS).forEach(topic => {
            this.kafkaClient.subscribeToResponseOf(topic);
        });
        this.kafkaClient.subscribeToResponseOf(common_2.ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_RESPONSE);
        this.kafkaClient.subscribeToResponseOf(common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_RESPONSE);
        await this.kafkaClient.connect();
        this.logger.log('Restaurant Service Kafka client connected');
    }
    async emit(topic, event) {
        this.logger.log(`Emitting event to topic ${topic}:`, event);
        await this.kafkaClient.emit(topic, event);
    }
    async emitOrderEvent(topic, event) {
        this.logger.log(`Emitting event to topic ${topic}:`, event);
        await this.kafkaClient.emit(topic, event);
    }
    async emitNewOrder(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.NEW, event);
    }
    async emitOrderCancelled(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.CANCELLED, event);
    }
    async emitOrderConfirmed(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.CONFIRMED, event);
    }
    async emitKitchenAccepted(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.KITCHEN_ACCEPTED, event);
    }
    async emitPreparing(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.PREPARING, event);
    }
    async emitReady(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.READY, event);
    }
    async emitWaiterAccepted(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.WAITER_ACCEPTED, event);
    }
    async emitServed(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.SERVED, event);
    }
    async emitCompleted(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.COMPLETED, event);
    }
    async emitReadyForDelivery(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.READY_FOR_DELIVERY, event);
    }
    async emitDriverAccepted(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.DRIVER_ACCEPTED, event);
    }
    async emitPickedUp(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.PICKED_UP, event);
    }
    async emitDelivered(event) {
        return this.emitOrderEvent(common_2.ORDER_TOPICS.DELIVERED, event);
    }
    async emitKitchenAcceptTakeaway(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.TAKEAWAY_KITCHEN_ACCEPT}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.TAKEAWAY_KITCHEN_ACCEPT, event);
        console.log(`[KafkaService] Event emitted successfully`);
    }
    async emitKitchenPreparingTakeaway(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.TAKEAWAY_KITCHEN_PREPARING, event);
    }
    async emitKitchenReadyTakeaway(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.TAKEAWAY_KITCHEN_READY}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.TAKEAWAY_KITCHEN_READY, event);
    }
    async emitCustomerPickupTakeaway(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.TAKEAWAY_CUSTOMER_PICKUP, event);
    }
    async emitDriverAcceptDelivery(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DELIVERY_DRIVER_ACCEPT}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DELIVERY_DRIVER_ACCEPT, event);
        console.log(`[KafkaService] Event emitted successfully`);
    }
    async emitDriverPickupDelivery(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DELIVERY_DRIVER_PICKUP}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DELIVERY_DRIVER_PICKUP, event);
        console.log(`[KafkaService] Event emitted successfully`);
    }
    async emitDriverDeliverOrder(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DELIVERY_DRIVER_DELIVER}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DELIVERY_DRIVER_DELIVER, event);
        console.log(`[KafkaService] Event emitted successfully`);
    }
    async emitKitchenAcceptDelivery(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DELIVERY_KITCHEN_ACCEPT}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DELIVERY_KITCHEN_ACCEPT, event);
    }
    async emitKitchenPreparingDelivery(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DELIVERY_KITCHEN_PREPARING}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DELIVERY_KITCHEN_PREPARING, event);
    }
    async emitKitchenReadyDelivery(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DELIVERY_KITCHEN_READY}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DELIVERY_KITCHEN_READY, event);
    }
    async emitWaiterCreateDineIn(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_WAITER_CREATE}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_WAITER_CREATE, event);
    }
    async emitWaiterSendBatch(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_WAITER_SEND_BATCH}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_WAITER_SEND_BATCH, event);
    }
    async emitWaiterAddBatch(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_WAITER_ADD_BATCH}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_WAITER_ADD_BATCH, event);
    }
    async emitWaiterServeBatch(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_WAITER_SERVE_BATCH}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_WAITER_SERVE_BATCH, event);
    }
    async emitWaiterRequestPayment(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_WAITER_REQUEST_PAYMENT}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_WAITER_REQUEST_PAYMENT, event);
    }
    async emitWaiterCompletePayment(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_WAITER_COMPLETE_PAYMENT}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_WAITER_COMPLETE_PAYMENT, event);
    }
    async emitKitchenAcceptBatch(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_KITCHEN_ACCEPT_BATCH}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_KITCHEN_ACCEPT_BATCH, event);
    }
    async emitKitchenBatchPreparing(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_KITCHEN_BATCH_PREPARING}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_KITCHEN_BATCH_PREPARING, event);
    }
    async emitKitchenBatchReady(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_KITCHEN_BATCH_READY}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_KITCHEN_BATCH_READY, event);
    }
    async emitKitchenItemPreparing(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_KITCHEN_ITEM_PREPARING}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_KITCHEN_ITEM_PREPARING, event);
    }
    async emitKitchenItemReady(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DINE_IN_KITCHEN_ITEM_READY}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_KITCHEN_ITEM_READY, event);
    }
    async emitKitchenGetPendingOrdersRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST, event);
    }
    async emitKitchenGetDineInPendingRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST, event);
    }
    async emitKitchenGetActiveOrdersRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST, event);
    }
    async emitKitchenGetAcceptedOrdersRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST, event);
    }
    async emitKitchenGetDineInAcceptedRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST, event);
    }
    async emitKitchenGetReadyTakeawayRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST, event);
    }
    async emitKitchenGetReadyDeliveryRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST, event);
    }
    async emitWaiterGetAllOrdersRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST, event);
    }
    async emitWaiterGetReadyBatchesRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST, event);
    }
    async emitWaiterGetCurrentOrdersRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST, event);
    }
    async emitWaiterGetCompletedOrdersRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST, event);
    }
    async emitWaiterGetReadyTakeawayRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST, event);
    }
    async emitDriverGetReadyOrdersRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST, event);
    }
    async emitDriverGetAssignedOrdersRequest(event) {
        console.log(`[KafkaService] Emitting to topic: ${common_2.ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST, event);
    }
    async sendKitchenGetPendingOrdersRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST, event);
    }
    async sendKitchenGetDineInPendingRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST, event);
    }
    async sendKitchenGetActiveOrdersRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST, event);
    }
    async sendKitchenGetAcceptedOrdersRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST, event);
    }
    async sendKitchenGetDineInAcceptedRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST, event);
    }
    async sendKitchenGetReadyTakeawayRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST, event);
    }
    async sendKitchenGetReadyDeliveryRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST, event);
    }
    async sendWaiterGetAllOrdersRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST, event);
    }
    async sendWaiterGetReadyBatchesRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST, event);
    }
    async sendWaiterGetCurrentOrdersRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST, event);
    }
    async sendWaiterGetCompletedOrdersRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST, event);
    }
    async sendWaiterGetReadyTakeawayRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST, event);
    }
    async sendDriverGetReadyOrdersRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST, event);
    }
    async sendDriverGetAssignedOrdersRequest(event) {
        console.log(`[KafkaService] Sending to topic: ${common_2.ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST}`);
        console.log(`[KafkaService] Event data:`, JSON.stringify(event, null, 2));
        return this.kafkaClient.send(common_2.ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST, event);
    }
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = KafkaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], KafkaService);
//# sourceMappingURL=kafka.service.js.map