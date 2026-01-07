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
var DeliveryEventsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryEventsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const mongoose_1 = require("mongoose");
const delivery_takeaway_orders_service_1 = require("../../orders/services/delivery-takeaway-orders.service");
let DeliveryEventsController = DeliveryEventsController_1 = class DeliveryEventsController {
    deliveryTakeawayOrdersService;
    logger = new common_1.Logger(DeliveryEventsController_1.name);
    constructor(deliveryTakeawayOrdersService) {
        this.deliveryTakeawayOrdersService = deliveryTakeawayOrdersService;
    }
    async handleDriverAcceptDelivery(event) {
        this.logger.log(`[DeliveryEventsController] Processing driver accept delivery: ${event.orderId}`);
        this.logger.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const order = await this.deliveryTakeawayOrdersService.getDeliveryOrderById(event.orderId, event.restaurantId);
            event.customerId = order.customerId.toString();
            this.logger.log(`[DeliveryEventsController] Found order with customerId: ${event.customerId}`);
            if (order.status !== 'READY_FOR_DELIVERY') {
                throw new Error(`Order ${event.orderId} is not ready for driver acceptance. Current status: ${order.status}. Expected: READY_FOR_DELIVERY`);
            }
            order.status = 'DRIVER_ACCEPTED';
            if (!order.deliveryDetails) {
                order.deliveryDetails = {};
            }
            order.deliveryDetails.driverId = new mongoose_1.Types.ObjectId(event.metadata.driverId);
            order.deliveryDetails.acceptedAt = new Date();
            if (event.metadata.estimatedDeliveryTime) {
                const timeMatch = event.metadata.estimatedDeliveryTime.match(/(\d+)/);
                if (timeMatch) {
                    order.deliveryDetails.estimatedDeliveryTime = parseInt(timeMatch[1]);
                }
            }
            if (event.metadata.note) {
                order.deliveryDetails.notes = (order.deliveryDetails.notes || '') + `\nAccept: ${event.metadata.note}`;
            }
            const updatedOrder = await order.save();
            this.logger.log(`[DeliveryEventsController] Order ${event.orderId} status updated to DRIVER_ACCEPTED`);
            this.logger.log(`[DeliveryEventsController] Updated order:`, {
                orderId: updatedOrder._id,
                status: updatedOrder.status,
                driverId: event.metadata.driverId
            });
        }
        catch (error) {
            this.logger.error(`[DeliveryEventsController] Failed to process driver accept delivery: ${error.message}`);
            this.logger.error(`[DeliveryEventsController] Full error:`, error);
        }
    }
    async handleDriverPickupDelivery(event) {
        this.logger.log(`[DeliveryEventsController] Processing driver pickup delivery: ${event.orderId}`);
        this.logger.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const order = await this.deliveryTakeawayOrdersService.getDeliveryOrderById(event.orderId, event.restaurantId);
            event.customerId = order.customerId.toString();
            this.logger.log(`[DeliveryEventsController] Found order with customerId: ${event.customerId}`);
            if (order.status !== 'DRIVER_ACCEPTED') {
                throw new Error(`Order ${event.orderId} cannot be picked up. Current status: ${order.status}. Expected: DRIVER_ACCEPTED`);
            }
            if (order.deliveryDetails?.driverId?.toString() !== event.metadata.driverId) {
                throw new Error(`Order ${event.orderId} can only be picked up by the driver who accepted it`);
            }
            order.status = 'IN_DELIVERY';
            if (!order.deliveryDetails) {
                order.deliveryDetails = {};
            }
            order.deliveryDetails.driverId = new mongoose_1.Types.ObjectId(event.metadata.driverId);
            order.deliveryDetails.pickedUpAt = new Date();
            if (event.metadata.note) {
                order.deliveryDetails.notes = (order.deliveryDetails.notes || '') + `\nPickup: ${event.metadata.note}`;
            }
            const updatedOrder = await order.save();
            this.logger.log(`[DeliveryEventsController] Order ${event.orderId} status updated to IN_DELIVERY`);
            this.logger.log(`[DeliveryEventsController] Updated order:`, {
                orderId: updatedOrder._id,
                status: updatedOrder.status,
                driverId: event.metadata.driverId
            });
        }
        catch (error) {
            this.logger.error(`[DeliveryEventsController] Failed to process driver pickup delivery: ${error.message}`);
            this.logger.error(`[DeliveryEventsController] Full error:`, error);
        }
    }
    async handleDriverDeliverOrder(event) {
        this.logger.log(`[DeliveryEventsController] Processing driver deliver order: ${event.orderId}`);
        this.logger.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const order = await this.deliveryTakeawayOrdersService.getDeliveryOrderById(event.orderId, event.restaurantId);
            event.customerId = order.customerId.toString();
            event.metadata.totalAmount = order.totalAmount;
            this.logger.log(`[DeliveryEventsController] Found order with customerId: ${event.customerId}, totalAmount: ${event.metadata.totalAmount}`);
            const updatedOrder = await this.deliveryTakeawayOrdersService.completeDeliveryOrder(event.orderId, event.restaurantId, event.metadata.driverId);
            this.logger.log(`[DeliveryEventsController] Order ${event.orderId} completed and delivered`);
            this.logger.log(`[DeliveryEventsController] Updated order:`, {
                orderId: updatedOrder._id,
                status: updatedOrder.status,
                driverId: event.metadata.driverId,
                deliveredAt: event.metadata.deliveredAt
            });
        }
        catch (error) {
            this.logger.error(`[DeliveryEventsController] Failed to process driver deliver order: ${error.message}`);
            this.logger.error(`[DeliveryEventsController] Full error:`, error);
        }
    }
    async handleKitchenAcceptDelivery(event) {
        this.logger.log(`[DeliveryEventsController] Processing kitchen accept delivery: ${event.orderId}`);
        this.logger.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.deliveryTakeawayOrdersService.kitchenAcceptDeliveryOrder(event.orderId, event.restaurantId, event.metadata.chefId, {
                note: event.metadata.note,
                estimatedPrepTime: event.metadata.estimatedPrepTime
            });
            this.logger.log(`[DeliveryEventsController] Kitchen accepted delivery order: ${event.orderId}`);
        }
        catch (error) {
            this.logger.error(`[DeliveryEventsController] Failed to process kitchen accept delivery: ${error.message}`);
            this.logger.error(`[DeliveryEventsController] Full error:`, error);
        }
    }
    async handleKitchenPreparingDelivery(event) {
        this.logger.log(`[DeliveryEventsController] Processing kitchen preparing delivery: ${event.orderId}`);
        this.logger.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.deliveryTakeawayOrdersService.updateDeliveryStatus(event.orderId, event.restaurantId, event.metadata.chefId, {
                status: 'PREPARING',
                note: event.metadata.note
            });
            this.logger.log(`[DeliveryEventsController] Kitchen marked delivery order as preparing: ${event.orderId}`);
        }
        catch (error) {
            this.logger.error(`[DeliveryEventsController] Failed to process kitchen preparing delivery: ${error.message}`);
            this.logger.error(`[DeliveryEventsController] Full error:`, error);
        }
    }
    async handleKitchenReadyDelivery(event) {
        this.logger.log(`[DeliveryEventsController] Processing kitchen ready delivery: ${event.orderId}`);
        this.logger.log(`[DeliveryEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.deliveryTakeawayOrdersService.updateDeliveryStatus(event.orderId, event.restaurantId, event.metadata.chefId, {
                status: 'READY_FOR_DELIVERY',
                note: event.metadata.note
            });
            this.logger.log(`[DeliveryEventsController] Kitchen marked delivery order as ready: ${event.orderId}`);
        }
        catch (error) {
            this.logger.error(`[DeliveryEventsController] Failed to process kitchen ready delivery: ${error.message}`);
            this.logger.error(`[DeliveryEventsController] Full error:`, error);
        }
    }
};
exports.DeliveryEventsController = DeliveryEventsController;
__decorate([
    (0, microservices_1.EventPattern)('delivery.driver.accept'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeliveryEventsController.prototype, "handleDriverAcceptDelivery", null);
__decorate([
    (0, microservices_1.EventPattern)('delivery.driver.pickup'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeliveryEventsController.prototype, "handleDriverPickupDelivery", null);
__decorate([
    (0, microservices_1.EventPattern)('delivery.driver.deliver'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeliveryEventsController.prototype, "handleDriverDeliverOrder", null);
__decorate([
    (0, microservices_1.EventPattern)('delivery.kitchen.accept'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeliveryEventsController.prototype, "handleKitchenAcceptDelivery", null);
__decorate([
    (0, microservices_1.EventPattern)('delivery.kitchen.preparing'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeliveryEventsController.prototype, "handleKitchenPreparingDelivery", null);
__decorate([
    (0, microservices_1.EventPattern)('delivery.kitchen.ready'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DeliveryEventsController.prototype, "handleKitchenReadyDelivery", null);
exports.DeliveryEventsController = DeliveryEventsController = DeliveryEventsController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [delivery_takeaway_orders_service_1.DeliveryTakeawayOrdersService])
], DeliveryEventsController);
//# sourceMappingURL=delivery-events.controller.js.map