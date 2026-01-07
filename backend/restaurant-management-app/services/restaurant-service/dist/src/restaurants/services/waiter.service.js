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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaiterService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const kafka_service_1 = require("../../kafka/kafka.service");
let WaiterService = class WaiterService {
    httpService;
    kafkaService;
    constructor(httpService, kafkaService) {
        this.httpService = httpService;
        this.kafkaService = kafkaService;
    }
    async getReadyBatches(restaurantId, token) {
        console.log(`[WaiterService] Getting ready batches for restaurant: ${restaurantId}`);
        try {
            const requestId = `ready-batches-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'waiter-service'
                }
            };
            console.log(`[WaiterService] Sending waiter get ready batches request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendWaiterGetReadyBatchesRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[WaiterService] Received ready batches response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[WaiterService] Received successful response for ready batches request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[WaiterService] Error in ready batches response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[WaiterService] Error fetching ready batches:`, error.message);
            return { orders: [] };
        }
    }
    async createDineInOrder(restaurantId, waiterId, createDto, token) {
        console.log(`[WaiterService] Creating dine-in order for restaurant: ${restaurantId} by waiter: ${waiterId}`);
        const event = {
            orderId: '',
            restaurantId,
            customerId: createDto.customerEmail || '',
            orderType: 'DINE_IN',
            status: 'PENDING',
            timestamp: new Date(),
            metadata: {
                waiterId,
                waiterEmail: '',
                customerEmail: createDto.customerEmail,
                customerName: createDto.customerName,
                tableNumber: createDto.tableNumber,
                items: createDto.batches.flatMap(batch => batch.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: 0,
                    specialInstructions: item.specialInstructions,
                    status: 'PENDING',
                }))),
                orderNotes: createDto.orderNotes,
            },
        };
        console.log(`[WaiterService] Emitting dine-in.waiter.create event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitWaiterCreateDineIn(event);
        console.log(`[WaiterService] Event emitted successfully`);
        return { success: true, message: 'Dine-in order creation request sent to menu-order-service' };
    }
    async sendBatchToKitchen(restaurantId, orderId, waiterId, batchDto, token) {
        console.log(`[WaiterService] Sending batch to kitchen: ${orderId} batch ${batchDto.batchNumber} by waiter: ${waiterId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DINE_IN',
            status: 'SENT_TO_KITCHEN',
            timestamp: new Date(),
            metadata: {
                waiterId,
                batchNumber: batchDto.batchNumber,
                items: [],
                sentAt: new Date(),
                note: batchDto.kitchenNote,
            },
        };
        console.log(`[WaiterService] Emitting dine-in.waiter.send-batch event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitWaiterSendBatch(event);
        console.log(`[WaiterService] Event emitted successfully`);
        return { success: true, message: 'Batch sent to kitchen' };
    }
    async addBatchToOrder(restaurantId, orderId, waiterId, batchDto, token) {
        console.log(`[WaiterService] Adding batch to order: ${orderId} by waiter: ${waiterId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DINE_IN',
            status: batchDto.sendToKitchen ? 'SENT_TO_KITCHEN' : 'PENDING',
            timestamp: new Date(),
            metadata: {
                waiterId,
                batchNumber: 0,
                items: batchDto.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: 0,
                    specialInstructions: item.specialInstructions,
                    status: batchDto.sendToKitchen ? 'SENT_TO_KITCHEN' : 'PENDING',
                })),
                addedAt: new Date(),
                note: batchDto.batchNote,
            },
        };
        console.log(`[WaiterService] Emitting dine-in.waiter.add-batch event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitWaiterAddBatch(event);
        console.log(`[WaiterService] Event emitted successfully`);
        return { success: true, message: 'Batch added to order' };
    }
    async serveBatch(restaurantId, orderId, waiterId, serveDto, token) {
        console.log(`[WaiterService] Serving batch: ${orderId} batch ${serveDto.batchNumber} by waiter: ${waiterId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DINE_IN',
            status: 'SERVED',
            timestamp: new Date(),
            metadata: {
                waiterId,
                batchNumber: serveDto.batchNumber,
                servedAt: new Date(),
                note: serveDto.note,
            },
        };
        console.log(`[WaiterService] Emitting dine-in.waiter.serve-batch event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitWaiterServeBatch(event);
        console.log(`[WaiterService] Event emitted successfully`);
        return { success: true, message: 'Batch served' };
    }
    async requestPayment(restaurantId, orderId, waiterId, requestDto, token) {
        console.log(`[WaiterService] Requesting payment: ${orderId} by waiter: ${waiterId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DINE_IN',
            status: 'PAYMENT_REQUESTED',
            timestamp: new Date(),
            metadata: {
                waiterId,
                requestedAt: new Date(),
                note: requestDto.note,
            },
        };
        console.log(`[WaiterService] Emitting dine-in.waiter.request-payment event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitWaiterRequestPayment(event);
        console.log(`[WaiterService] Event emitted successfully`);
        return { success: true, message: 'Payment requested' };
    }
    async completePayment(restaurantId, orderId, waiterId, paymentDto, token) {
        console.log(`[WaiterService] Completing payment: ${orderId} by waiter: ${waiterId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DINE_IN',
            status: 'COMPLETED',
            timestamp: new Date(),
            metadata: {
                waiterId,
                completedAt: new Date(),
                paymentMethod: paymentDto.paymentMethod,
                note: paymentDto.note,
            },
        };
        console.log(`[WaiterService] Emitting dine-in.waiter.complete-payment event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitWaiterCompletePayment(event);
        console.log(`[WaiterService] Event emitted successfully`);
        return { success: true, message: 'Payment completed' };
    }
    async getAllOrders(restaurantId, token) {
        console.log(`[WaiterService] Getting all orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `all-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'waiter-service'
                }
            };
            console.log(`[WaiterService] Sending waiter get all orders request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendWaiterGetAllOrdersRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[WaiterService] Received all orders response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[WaiterService] Received successful response for all orders request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[WaiterService] Error in all orders response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[WaiterService] Error fetching all orders:`, error.message);
            return { orders: [] };
        }
    }
    async getReadyTakeawayOrders(restaurantId, token) {
        console.log(`[WaiterService] Getting ready takeaway orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `ready-takeaway-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'waiter-service'
                }
            };
            console.log(`[WaiterService] Sending waiter get ready takeaway request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendWaiterGetReadyTakeawayRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[WaiterService] Received ready takeaway response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[WaiterService] Received successful response for ready takeaway request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[WaiterService] Error in ready takeaway response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[WaiterService] Error fetching ready takeaway orders:`, error.message);
            return { orders: [] };
        }
    }
    async pickupTakeawayOrder(restaurantId, orderId, waiterId, body, token) {
        console.log(`[WaiterService] Pickup takeaway order: ${orderId} by waiter: ${waiterId}`);
        return { success: true, message: 'Takeaway order picked up' };
    }
    async getCurrentOrders(restaurantId, waiterId, token) {
        console.log(`[WaiterService] Getting current orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `current-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: waiterId || 'waiter-service'
                }
            };
            console.log(`[WaiterService] Sending waiter get current orders request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendWaiterGetCurrentOrdersRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[WaiterService] Received current orders response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[WaiterService] Received successful response for current orders request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[WaiterService] Error in current orders response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[WaiterService] Error fetching current orders:`, error.message);
            return { orders: [] };
        }
    }
    async getCompletedOrders(restaurantId, waiterId, token) {
        console.log(`[WaiterService] Getting completed orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `completed-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: waiterId || 'waiter-service'
                }
            };
            console.log(`[WaiterService] Sending waiter get completed orders request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendWaiterGetCompletedOrdersRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[WaiterService] Received completed orders response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[WaiterService] Received successful response for completed orders request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[WaiterService] Error in completed orders response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[WaiterService] Error fetching completed orders:`, error.message);
            return { orders: [] };
        }
    }
};
exports.WaiterService = WaiterService;
exports.WaiterService = WaiterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        kafka_service_1.KafkaService])
], WaiterService);
//# sourceMappingURL=waiter.service.js.map