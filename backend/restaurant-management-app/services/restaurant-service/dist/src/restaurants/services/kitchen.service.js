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
exports.KitchenService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const common_2 = require("@rm/common");
const kafka_service_1 = require("../../kafka/kafka.service");
const kitchen_responses_controller_1 = require("../kafka/kitchen-responses.controller");
let KitchenService = class KitchenService {
    httpService;
    kafkaService;
    kitchenResponsesController;
    constructor(httpService, kafkaService, kitchenResponsesController) {
        this.httpService = httpService;
        this.kafkaService = kafkaService;
        this.kitchenResponsesController = kitchenResponsesController;
    }
    async getPendingOrders(restaurantId, token) {
        console.log(`[KitchenService] Getting pending orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `pending-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'kitchen-service'
                }
            };
            console.log(`[KitchenService] Sending kitchen get pending orders request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendKitchenGetPendingOrdersRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[KitchenService] Received response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[KitchenService] Received successful response for request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[KitchenService] Error in response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[KitchenService] Error fetching pending orders:`, error.message);
            return { orders: [] };
        }
    }
    async acceptOrder(restaurantId, orderId, chefId, body, token) {
        await (0, rxjs_1.firstValueFrom)(this.httpService.put(`http://menu-order-service:3003/restaurants/${restaurantId}/orders/manage/${orderId}/status`, {
            status: common_2.OrderStatusEnum.KITCHEN_ACCEPTED,
            note: body.kitchenNote || `Accepted by chef ${chefId}`,
            metadata: {
                chefId,
                estimatedPrepTime: body.estimatedPrepTime,
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }));
        return { success: true, message: 'Order accepted by kitchen' };
    }
    async startPreparing(restaurantId, orderId, chefId, body, token) {
        await (0, rxjs_1.firstValueFrom)(this.httpService.put(`http://menu-order-service:3003/restaurants/${restaurantId}/orders/manage/${orderId}/status`, {
            status: common_2.OrderStatusEnum.PREPARING,
            note: body.note || `Started by chef ${chefId}`,
            metadata: {
                chefId,
                preparationStartedAt: new Date(),
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }));
        return { success: true, message: 'Order preparation started' };
    }
    async markReady(restaurantId, orderId, chefId, body, token) {
        const orderResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://menu-order-service:3003/restaurants/${restaurantId}/orders/manage/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }));
        const order = orderResponse.data;
        let nextStatus = common_2.OrderStatusEnum.READY;
        if (order.orderType === 'DELIVERY') {
            nextStatus = common_2.OrderStatusEnum.READY_FOR_DELIVERY;
        }
        else if (order.orderType === 'TAKEAWAY') {
            nextStatus = common_2.OrderStatusEnum.READY_FOR_PICKUP;
        }
        await (0, rxjs_1.firstValueFrom)(this.httpService.put(`http://menu-order-service:3003/restaurants/${restaurantId}/orders/manage/${orderId}/status`, {
            status: nextStatus,
            note: body.note || `Ready - prepared by chef ${chefId}`,
            metadata: {
                chefId,
                readyAt: new Date(),
                orderType: order.orderType,
            }
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }));
        return { success: true, message: `Order marked as ${nextStatus}` };
    }
    async getActiveOrders(restaurantId, token) {
        console.log(`[KitchenService] Getting active orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `active-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'kitchen-service'
                }
            };
            console.log(`[KitchenService] Sending kitchen get active orders request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendKitchenGetActiveOrdersRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[KitchenService] Received active orders response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[KitchenService] Received successful response for active orders request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[KitchenService] Error in active orders response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[KitchenService] Error fetching active orders:`, error.message);
            return { orders: [] };
        }
    }
    async acceptTakeawayOrder(restaurantId, orderId, chefId, body) {
        console.log(`[KitchenService] Accepting takeaway order: ${orderId} by chef: ${chefId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'TAKEAWAY',
            status: 'KITCHEN_ACCEPTED',
            timestamp: new Date(),
            metadata: {
                chefId,
                acceptedItems: [],
                acceptedAt: new Date(),
                estimatedPrepTime: body.estimatedPrepTime,
                note: body.note,
            },
        };
        console.log(`[KitchenService] Emitting takeaway.kitchen.accept event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitKitchenAcceptTakeaway(event);
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: 'Takeaway order accepted by kitchen' };
    }
    async preparingTakeawayOrder(restaurantId, orderId, chefId, body) {
        console.log(`[KitchenService] Marking takeaway order as preparing: ${orderId} by chef: ${chefId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'TAKEAWAY',
            status: 'PREPARING',
            timestamp: new Date(),
            metadata: {
                chefId,
                preparationStartedAt: new Date(),
                note: body.note,
            },
        };
        console.log(`[KitchenService] Emitting takeaway.kitchen.preparing event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitKitchenPreparingTakeaway(event);
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: 'Takeaway order marked as preparing' };
    }
    async readyTakeawayOrder(restaurantId, orderId, chefId, body) {
        console.log(`[KitchenService] Marking takeaway order as ready: ${orderId} by chef: ${chefId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'TAKEAWAY',
            status: 'READY',
            timestamp: new Date(),
            metadata: {
                chefId,
                readyAt: new Date(),
                note: body.note,
            },
        };
        console.log(`[KitchenService] Emitting takeaway.kitchen.ready event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitKitchenReadyTakeaway(event);
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: 'Takeaway order marked as ready' };
    }
    async getReadyTakeawayOrders(restaurantId, token) {
        console.log(`[KitchenService] Getting ready takeaway orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `ready-takeaway-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'kitchen-service'
                }
            };
            console.log(`[KitchenService] Sending kitchen get ready takeaway request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendKitchenGetReadyTakeawayRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[KitchenService] Received ready takeaway response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[KitchenService] Received successful response for ready takeaway request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[KitchenService] Error in ready takeaway response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[KitchenService] Error fetching ready takeaway orders:`, error.message);
            return { orders: [] };
        }
    }
    async acceptDeliveryOrder(restaurantId, orderId, chefId, body) {
        console.log(`[KitchenService] Accepting delivery order: ${orderId} by chef: ${chefId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DELIVERY',
            status: 'KITCHEN_ACCEPTED',
            timestamp: new Date(),
            metadata: {
                chefId,
                acceptedItems: [],
                acceptedAt: new Date(),
                estimatedPrepTime: body.estimatedPrepTime,
                note: body.note,
            },
        };
        console.log(`[KitchenService] Emitting delivery.kitchen.accept event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitKitchenAcceptDelivery(event);
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: 'Delivery order accepted by kitchen' };
    }
    async preparingDeliveryOrder(restaurantId, orderId, chefId, body) {
        console.log(`[KitchenService] Marking delivery order as preparing: ${orderId} by chef: ${chefId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DELIVERY',
            status: 'PREPARING',
            timestamp: new Date(),
            metadata: {
                chefId,
                preparationStartedAt: new Date(),
                note: body.note,
            },
        };
        console.log(`[KitchenService] Emitting delivery.kitchen.preparing event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitKitchenPreparingDelivery(event);
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: 'Delivery order marked as preparing' };
    }
    async readyDeliveryOrder(restaurantId, orderId, chefId, body) {
        console.log(`[KitchenService] Marking delivery order as ready: ${orderId} by chef: ${chefId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DELIVERY',
            status: 'READY_FOR_DELIVERY',
            timestamp: new Date(),
            metadata: {
                chefId,
                readyAt: new Date(),
                note: body.note,
            },
        };
        console.log(`[KitchenService] Emitting delivery.kitchen.ready event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitKitchenReadyDelivery(event);
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: 'Delivery order marked as ready' };
    }
    async getReadyDeliveryOrders(restaurantId, token) {
        console.log(`[KitchenService] Getting ready delivery orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `ready-delivery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'kitchen-service'
                }
            };
            console.log(`[KitchenService] Sending kitchen get ready delivery request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendKitchenGetReadyDeliveryRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[KitchenService] Received ready delivery response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[KitchenService] Received successful response for ready delivery request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[KitchenService] Error in ready delivery response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[KitchenService] Error fetching ready delivery orders:`, error.message);
            return { orders: [] };
        }
    }
    async acceptDineInBatch(restaurantId, orderId, chefId, body) {
        console.log(`[KitchenService] Accepting dine-in batch for order: ${orderId} by chef: ${chefId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DINE_IN',
            status: 'KITCHEN_ACCEPTED',
            timestamp: new Date(),
            metadata: {
                chefId,
                batchNumber: body.batchNumber,
                acceptedAt: new Date(),
                estimatedPrepTime: body.note,
                note: body.note,
            },
        };
        console.log(`[KitchenService] Emitting dine-in.kitchen.accept-batch event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitKitchenAcceptBatch(event);
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: 'Dine-in batch accepted by kitchen' };
    }
    async updateDineInBatchStatus(restaurantId, orderId, chefId, body) {
        console.log(`[KitchenService] Updating dine-in batch status for order: ${orderId} by chef: ${chefId}`);
        if (body.batchStatus === 'PREPARING') {
            const event = {
                orderId,
                restaurantId,
                customerId: '',
                orderType: 'DINE_IN',
                status: 'PREPARING',
                timestamp: new Date(),
                metadata: {
                    chefId,
                    batchNumber: body.batchNumber,
                    preparingAt: new Date(),
                    note: body.note,
                },
            };
            console.log(`[KitchenService] Emitting dine-in.kitchen.batch-preparing event:`, JSON.stringify(event, null, 2));
            await this.kafkaService.emitKitchenBatchPreparing(event);
        }
        else if (body.batchStatus === 'READY') {
            const event = {
                orderId,
                restaurantId,
                customerId: '',
                orderType: 'DINE_IN',
                status: 'READY',
                timestamp: new Date(),
                metadata: {
                    chefId,
                    batchNumber: body.batchNumber,
                    readyAt: new Date(),
                    note: body.note,
                },
            };
            console.log(`[KitchenService] Emitting dine-in.kitchen.batch-ready event:`, JSON.stringify(event, null, 2));
            await this.kafkaService.emitKitchenBatchReady(event);
        }
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: `Dine-in batch status updated to ${body.batchStatus}` };
    }
    async preparingDineInBatch(restaurantId, orderId, chefId, batchNumber, body) {
        console.log(`[KitchenService] Marking dine-in batch ${batchNumber} as preparing: ${orderId} by chef: ${chefId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DINE_IN',
            status: 'PREPARING',
            timestamp: new Date(),
            metadata: {
                chefId,
                batchNumber,
                preparingAt: new Date(),
                note: body.note,
            },
        };
        console.log(`[KitchenService] Emitting dine-in.kitchen.batch-preparing event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitKitchenBatchPreparing(event);
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: 'Dine-in batch marked as preparing' };
    }
    async readyDineInBatch(restaurantId, orderId, chefId, batchNumber, body) {
        console.log(`[KitchenService] Marking dine-in batch ${batchNumber} as ready: ${orderId} by chef: ${chefId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DINE_IN',
            status: 'READY',
            timestamp: new Date(),
            metadata: {
                chefId,
                batchNumber,
                readyAt: new Date(),
                note: body.note,
            },
        };
        console.log(`[KitchenService] Emitting dine-in.kitchen.batch-ready event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitKitchenBatchReady(event);
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: 'Dine-in batch marked as ready' };
    }
    async updateDineInItemStatus(restaurantId, orderId, chefId, batchNumber, productId, body) {
        console.log(`[KitchenService] Updating dine-in item status for product ${productId} in batch ${batchNumber}: ${orderId} by chef: ${chefId}`);
        if (body.status === 'PREPARING') {
            const event = {
                orderId,
                restaurantId,
                customerId: '',
                orderType: 'DINE_IN',
                status: 'PREPARING',
                timestamp: new Date(),
                metadata: {
                    chefId,
                    batchNumber,
                    productId,
                    preparingAt: new Date(),
                    note: body.note,
                },
            };
            console.log(`[KitchenService] Emitting dine-in.kitchen.item-preparing event:`, JSON.stringify(event, null, 2));
            await this.kafkaService.emitKitchenItemPreparing(event);
        }
        else if (body.status === 'READY') {
            const event = {
                orderId,
                restaurantId,
                customerId: '',
                orderType: 'DINE_IN',
                status: 'READY',
                timestamp: new Date(),
                metadata: {
                    chefId,
                    batchNumber,
                    productId,
                    readyAt: new Date(),
                    note: body.note,
                },
            };
            console.log(`[KitchenService] Emitting dine-in.kitchen.item-ready event:`, JSON.stringify(event, null, 2));
            await this.kafkaService.emitKitchenItemReady(event);
        }
        console.log(`[KitchenService] Event emitted successfully`);
        return { success: true, message: `Dine-in item status updated to ${body.status}` };
    }
    async getPendingDineInOrders(restaurantId, token) {
        console.log(`[KitchenService] Getting pending dine-in orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `dine-in-pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'kitchen-service'
                }
            };
            console.log(`[KitchenService] Sending kitchen get dine-in pending request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendKitchenGetDineInPendingRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[KitchenService] Received dine-in response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[KitchenService] Received successful response for dine-in request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[KitchenService] Error in dine-in response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[KitchenService] Error fetching pending dine-in orders:`, error.message);
            return { orders: [] };
        }
    }
    async getAcceptedDineInOrders(restaurantId, token) {
        console.log(`[KitchenService] Getting accepted dine-in orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `dine-in-accepted-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'kitchen-service'
                }
            };
            console.log(`[KitchenService] Sending kitchen get dine-in accepted request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendKitchenGetDineInAcceptedRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[KitchenService] Received dine-in accepted response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[KitchenService] Received successful response for dine-in accepted request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[KitchenService] Error in dine-in accepted response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[KitchenService] Error fetching accepted dine-in orders:`, error.message);
            return { orders: [] };
        }
    }
};
exports.KitchenService = KitchenService;
exports.KitchenService = KitchenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        kafka_service_1.KafkaService,
        kitchen_responses_controller_1.KitchenResponsesController])
], KitchenService);
//# sourceMappingURL=kitchen.service.js.map