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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@rm/common");
let KafkaService = class KafkaService {
    kafkaClient;
    constructor(kafkaClient) {
        this.kafkaClient = kafkaClient;
    }
    async onModuleInit() {
        Object.values(common_2.ORDER_TOPICS).forEach(topic => {
            this.kafkaClient.subscribeToResponseOf(topic);
        });
        await this.kafkaClient.connect();
    }
    async emit(topic, event) {
        await this.kafkaClient.emit(topic, event);
    }
    async emitOrderEvent(event) {
        console.log('DEBUG - emitOrderEvent received status:', event.status);
        console.log('DEBUG - Available ORDER_TOPICS:', Object.keys(common_2.ORDER_TOPICS));
        console.log('DEBUG - Full ORDER_TOPICS:', common_2.ORDER_TOPICS);
        const topic = common_2.ORDER_TOPICS[event.status];
        console.log('DEBUG - Found topic for status:', topic);
        if (!topic) {
            throw new Error(`No topic defined for status ${event.status}`);
        }
        await this.kafkaClient.emit(topic, event);
    }
    async emitNewOrder(event) {
        return this.emitOrderEvent(event);
    }
    async emitOrderCancelled(event) {
        return this.emitOrderEvent(event);
    }
    async emitOrderConfirmed(event) {
        return this.emitOrderEvent(event);
    }
    async emitKitchenAccepted(event) {
        return this.emitOrderEvent(event);
    }
    async emitPreparing(event) {
        return this.emitOrderEvent(event);
    }
    async emitReady(event) {
        return this.emitOrderEvent(event);
    }
    async emitWaiterAccepted(event) {
        return this.emitOrderEvent(event);
    }
    async emitServed(event) {
        return this.emitOrderEvent(event);
    }
    async emitCompleted(event) {
        return this.emitOrderEvent(event);
    }
    async emitReadyForDelivery(event) {
        return this.emitOrderEvent(event);
    }
    async emitDriverAccepted(event) {
        return this.emitOrderEvent(event);
    }
    async emitPickedUp(event) {
        return this.emitOrderEvent(event);
    }
    async emitDelivered(event) {
        return this.emitOrderEvent(event);
    }
    async emitDineInCreated(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_CREATED, event);
    }
    async emitBatchSentToKitchen(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.BATCH_SENT_TO_KITCHEN, event);
    }
    async emitItemStatusChanged(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.ITEM_STATUS_CHANGED, event);
    }
    async emitPaymentRequested(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.PAYMENT_REQUESTED, event);
    }
    async emitDineInCompleted(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.DINE_IN_COMPLETED, event);
    }
    async emitDeliveryOrderCreated(event) {
        await this.kafkaClient.emit('delivery.order.created', event);
    }
    async emitTakeawayOrderCreated(event) {
        await this.kafkaClient.emit('takeaway.order.created', event);
    }
    async emitOrderDelivered(event) {
        await this.kafkaClient.emit('order.delivered', event);
    }
    async emitOrderCompleted(event) {
        await this.kafkaClient.emit('order.completed', event);
    }
    async emitTakeawayOrderCreatedEvent(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.TAKEAWAY_ORDER_CREATED, event);
    }
    async emitKitchenAcceptTakeaway(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.TAKEAWAY_KITCHEN_ACCEPT, event);
    }
    async emitKitchenPreparingTakeaway(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.TAKEAWAY_KITCHEN_PREPARING, event);
    }
    async emitKitchenReadyTakeaway(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.TAKEAWAY_KITCHEN_READY, event);
    }
    async emitCustomerPickupTakeaway(event) {
        await this.kafkaClient.emit(common_2.ORDER_TOPICS.TAKEAWAY_CUSTOMER_PICKUP, event);
    }
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('KAFKA_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientKafka])
], KafkaService);
//# sourceMappingURL=kafka.service.js.map