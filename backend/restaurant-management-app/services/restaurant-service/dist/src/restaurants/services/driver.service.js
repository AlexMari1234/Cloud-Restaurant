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
var DriverService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@rm/common");
const kafka_service_1 = require("../../kafka/kafka.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let DriverService = DriverService_1 = class DriverService {
    kafkaService;
    httpService;
    logger = new common_1.Logger(DriverService_1.name);
    constructor(kafkaService, httpService) {
        this.kafkaService = kafkaService;
        this.httpService = httpService;
    }
    async handleOrderReadyForDelivery(event) {
        this.logger.log(`Order ${event.orderId} is ready for delivery at restaurant ${event.restaurantId}`);
        try {
            const orderResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://menu-order-service:3003/restaurants/${event.restaurantId}/orders/manage/${event.orderId}`));
            const order = orderResponse.data;
            this.logger.log(`Delivery order details: ${JSON.stringify({
                orderId: event.orderId,
                restaurantId: event.restaurantId,
                deliveryAddress: order.deliveryAddress,
                readyAt: order.readyAt,
                estimatedPrepTime: order.estimatedPrepTime
            })}`);
        }
        catch (error) {
            this.logger.error(`Failed to process ready for delivery event for order ${event.orderId}:`, error);
        }
    }
    async handleDriverAccepted(event) {
        this.logger.log(`Driver accepted order ${event.orderId} for delivery`);
        try {
            this.logger.log(`Driver acceptance details: ${JSON.stringify({
                orderId: event.orderId,
                driverId: event.metadata?.driverId,
                acceptedAt: event.timestamp,
                restaurantId: event.restaurantId
            })}`);
        }
        catch (error) {
            this.logger.error(`Failed to process driver accepted event for order ${event.orderId}:`, error);
        }
    }
    async handleOrderPickedUp(event) {
        this.logger.log(`Order ${event.orderId} has been picked up by driver`);
        try {
            this.logger.log(`Pickup details: ${JSON.stringify({
                orderId: event.orderId,
                driverId: event.metadata?.driverId,
                pickedUpAt: event.timestamp,
                restaurantId: event.restaurantId
            })}`);
        }
        catch (error) {
            this.logger.error(`Failed to process order picked up event for order ${event.orderId}:`, error);
        }
    }
    async handleOrderDelivered(event) {
        this.logger.log(`Order ${event.orderId} has been delivered successfully`);
        try {
            const orderResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://menu-order-service:3003/restaurants/${event.restaurantId}/orders/manage/${event.orderId}`));
            const order = orderResponse.data;
            const deliveryMetrics = {
                orderId: event.orderId,
                restaurantId: event.restaurantId,
                driverId: event.metadata?.driverId,
                totalDeliveryTime: order.actualDeliveryTime && order.readyAt
                    ? new Date(order.actualDeliveryTime).getTime() - new Date(order.readyAt).getTime()
                    : null,
                orderCompletedAt: event.timestamp,
                deliveryAddress: order.deliveryAddress
            };
            this.logger.log(`Delivery completed metrics: ${JSON.stringify(deliveryMetrics)}`);
        }
        catch (error) {
            this.logger.error(`Failed to process order delivered event for order ${event.orderId}:`, error);
        }
    }
    async handleKitchenReady(event) {
        if (event.status === common_2.OrderStatusEnum.READY_FOR_DELIVERY) {
            await this.handleOrderReadyForDelivery(event);
        }
    }
    async notifyAvailableDrivers(orderId, restaurantId, deliveryAddress) {
        this.logger.log(`Notifying available drivers for order ${orderId} at restaurant ${restaurantId}`);
    }
    calculateEstimatedDeliveryTime(restaurantAddress, deliveryAddress) {
        return 30;
    }
    async getReadyOrders(restaurantId, token) {
        console.log(`[DriverService] Getting ready orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `ready-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'driver-service'
                }
            };
            console.log(`[DriverService] Sending driver get ready orders request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendDriverGetReadyOrdersRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[DriverService] Received ready orders response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[DriverService] Received successful response for ready orders request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[DriverService] Error in ready orders response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[DriverService] Error fetching ready orders:`, error.message);
            return { orders: [] };
        }
    }
    async acceptDelivery(restaurantId, orderId, driverId, body) {
        console.log(`[DriverService] Driver accepting delivery order: ${orderId} by driver: ${driverId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DELIVERY',
            status: 'DRIVER_ACCEPTED',
            timestamp: new Date(),
            metadata: {
                driverId,
                acceptedAt: new Date(),
                estimatedDeliveryTime: body.estimatedDeliveryTime,
                note: body.note,
            },
        };
        console.log(`[DriverService] Emitting delivery.driver.accept event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitDriverAcceptDelivery(event);
        console.log(`[DriverService] Event emitted successfully`);
        return { success: true, message: 'Order accepted by driver' };
    }
    async pickupDeliveryOrder(restaurantId, orderId, driverId, body) {
        console.log(`[DriverService] Driver picking up delivery order: ${orderId} by driver: ${driverId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DELIVERY',
            status: 'IN_DELIVERY',
            timestamp: new Date(),
            metadata: {
                driverId,
                pickedUpAt: new Date(),
                note: body.note,
            },
        };
        console.log(`[DriverService] Emitting delivery.driver.pickup event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitDriverPickupDelivery(event);
        console.log(`[DriverService] Event emitted successfully`);
        return { success: true, message: 'Order picked up for delivery' };
    }
    async deliverOrder(restaurantId, orderId, driverId, token) {
        console.log(`[DriverService] Driver delivering order: ${orderId} by driver: ${driverId}`);
        const event = {
            orderId,
            restaurantId,
            customerId: '',
            orderType: 'DELIVERY',
            status: 'DELIVERED',
            timestamp: new Date(),
            metadata: {
                driverId,
                deliveredAt: new Date(),
                totalAmount: 0,
            },
        };
        console.log(`[DriverService] Emitting delivery.driver.deliver event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitDriverDeliverOrder(event);
        console.log(`[DriverService] Event emitted successfully`);
        return { success: true, message: 'Order delivered successfully' };
    }
    async getAssignedOrders(restaurantId, token) {
        console.log(`[DriverService] Getting assigned orders for restaurant: ${restaurantId}`);
        try {
            const requestId = `assigned-orders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const requestEvent = {
                requestId,
                restaurantId,
                timestamp: new Date(),
                metadata: {
                    token,
                    userId: 'driver-service'
                }
            };
            console.log(`[DriverService] Sending driver get assigned orders request:`, JSON.stringify(requestEvent, null, 2));
            const responseObservable = await this.kafkaService.sendDriverGetAssignedOrdersRequest(requestEvent);
            const response = await (0, rxjs_1.firstValueFrom)(responseObservable);
            console.log(`[DriverService] Received assigned orders response:`, JSON.stringify(response, null, 2));
            if (response && response.success) {
                console.log(`[DriverService] Received successful response for assigned orders request: ${requestId}`);
                return { orders: response.orders || [] };
            }
            else {
                console.error(`[DriverService] Error in assigned orders response for request: ${requestId}`, response?.error);
                return { orders: [] };
            }
        }
        catch (error) {
            console.error(`[DriverService] Error fetching assigned orders:`, error.message);
            return { orders: [] };
        }
    }
};
exports.DriverService = DriverService;
__decorate([
    (0, microservices_1.EventPattern)('order.delivery.ready'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "handleOrderReadyForDelivery", null);
__decorate([
    (0, microservices_1.EventPattern)('order.delivery.accepted'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "handleDriverAccepted", null);
__decorate([
    (0, microservices_1.EventPattern)('order.delivery.picked_up'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "handleOrderPickedUp", null);
__decorate([
    (0, microservices_1.EventPattern)('order.delivery.delivered'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "handleOrderDelivered", null);
__decorate([
    (0, microservices_1.EventPattern)('order.kitchen.ready'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverService.prototype, "handleKitchenReady", null);
exports.DriverService = DriverService = DriverService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafka_service_1.KafkaService,
        axios_1.HttpService])
], DriverService);
//# sourceMappingURL=driver.service.js.map