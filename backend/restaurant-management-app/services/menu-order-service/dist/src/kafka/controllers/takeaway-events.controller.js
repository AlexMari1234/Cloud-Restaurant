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
var TakeawayEventsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TakeawayEventsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const delivery_takeaway_orders_service_1 = require("../../orders/services/delivery-takeaway-orders.service");
let TakeawayEventsController = TakeawayEventsController_1 = class TakeawayEventsController {
    deliveryTakeawayOrdersService;
    logger = new common_1.Logger(TakeawayEventsController_1.name);
    constructor(deliveryTakeawayOrdersService) {
        this.deliveryTakeawayOrdersService = deliveryTakeawayOrdersService;
    }
    async handleTakeawayOrderCreated(event) {
        this.logger.log(`Processing takeaway order created: ${event.orderId}`);
        try {
            this.logger.log(`Takeaway order ${event.orderId} created successfully`);
        }
        catch (error) {
            this.logger.error(`Failed to process takeaway order created: ${error.message}`);
        }
    }
    async handleKitchenAcceptTakeaway(event) {
        console.log(`[TakeawayEventsController] Received takeaway.kitchen.accept event:`, JSON.stringify(event, null, 2));
        this.logger.log(`Processing kitchen accept takeaway: ${event.orderId}`);
        try {
            console.log(`[TakeawayEventsController] Calling kitchenAcceptTakeawayOrder with orderId: ${event.orderId}, restaurantId: ${event.restaurantId}, chefId: ${event.metadata.chefId}`);
            const body = {
                note: event.metadata.note,
                estimatedPrepTime: event.metadata.estimatedPrepTime
            };
            const updatedOrder = await this.deliveryTakeawayOrdersService.kitchenAcceptTakeawayOrder(event.orderId, event.restaurantId, event.metadata.chefId, body);
            console.log(`[TakeawayEventsController] Order updated successfully. New status: ${updatedOrder.status}`);
            event.customerId = updatedOrder.customerId.toString();
            this.logger.log(`Takeaway order ${event.orderId} accepted by kitchen`);
        }
        catch (error) {
            console.error(`[TakeawayEventsController] Error processing kitchen accept:`, error);
            this.logger.error(`Failed to process kitchen accept takeaway: ${error.message}`);
        }
    }
    async handleKitchenPreparingTakeaway(event) {
        console.log(`[TakeawayEventsController] Received takeaway.kitchen.preparing event:`, JSON.stringify(event, null, 2));
        this.logger.log(`Processing kitchen preparing takeaway: ${event.orderId}`);
        try {
            console.log(`[TakeawayEventsController] Calling updateTakeawayStatus with orderId: ${event.orderId}, restaurantId: ${event.restaurantId}, chefId: ${event.metadata.chefId}`);
            const updatedOrder = await this.deliveryTakeawayOrdersService.updateTakeawayStatus(event.orderId, event.restaurantId, event.metadata.chefId, { status: 'PREPARING', note: event.metadata.note });
            console.log(`[TakeawayEventsController] Order updated successfully. New status: ${updatedOrder.status}`);
            event.customerId = updatedOrder.customerId.toString();
            this.logger.log(`Takeaway order ${event.orderId} marked as preparing`);
        }
        catch (error) {
            console.error(`[TakeawayEventsController] Error processing kitchen preparing:`, error);
            this.logger.error(`Failed to process kitchen preparing takeaway: ${error.message}`);
        }
    }
    async handleKitchenReadyTakeaway(event) {
        console.log(`[TakeawayEventsController] Received takeaway.kitchen.ready event:`, JSON.stringify(event, null, 2));
        this.logger.log(`Processing kitchen ready takeaway: ${event.orderId}`);
        try {
            console.log(`[TakeawayEventsController] Calling updateTakeawayStatus with orderId: ${event.orderId}, restaurantId: ${event.restaurantId}, chefId: ${event.metadata.chefId}`);
            const updatedOrder = await this.deliveryTakeawayOrdersService.updateTakeawayStatus(event.orderId, event.restaurantId, event.metadata.chefId, { status: 'READY', note: event.metadata.note });
            console.log(`[TakeawayEventsController] Order updated successfully. New status: ${updatedOrder.status}`);
            event.customerId = updatedOrder.customerId.toString();
            this.logger.log(`Takeaway order ${event.orderId} marked as ready for pickup`);
        }
        catch (error) {
            console.error(`[TakeawayEventsController] Error processing kitchen ready:`, error);
            this.logger.error(`Failed to process kitchen ready takeaway: ${error.message}`);
        }
    }
    async handleCustomerPickupTakeaway(event) {
        console.log(`[TakeawayEventsController] Received takeaway.customer.pickup event:`, JSON.stringify(event, null, 2));
        this.logger.log(`Processing customer pickup takeaway: ${event.orderId}`);
        try {
            console.log(`[TakeawayEventsController] Calling completeTakeawayOrder with orderId: ${event.orderId}, restaurantId: ${event.restaurantId}, waiterId: ${event.metadata.waiterId}`);
            const updatedOrder = await this.deliveryTakeawayOrdersService.completeTakeawayOrder(event.orderId, event.restaurantId, event.metadata.waiterId);
            console.log(`[TakeawayEventsController] Order updated successfully. New status: ${updatedOrder.status}`);
            event.customerId = updatedOrder.customerId.toString();
            this.logger.log(`Takeaway order ${event.orderId} picked up by customer`);
        }
        catch (error) {
            console.error(`[TakeawayEventsController] Error processing customer pickup:`, error);
            this.logger.error(`Failed to process customer pickup takeaway: ${error.message}`);
        }
    }
};
exports.TakeawayEventsController = TakeawayEventsController;
__decorate([
    (0, microservices_1.EventPattern)('takeaway.order.created'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayEventsController.prototype, "handleTakeawayOrderCreated", null);
__decorate([
    (0, microservices_1.EventPattern)('takeaway.kitchen.accept'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayEventsController.prototype, "handleKitchenAcceptTakeaway", null);
__decorate([
    (0, microservices_1.EventPattern)('takeaway.kitchen.preparing'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayEventsController.prototype, "handleKitchenPreparingTakeaway", null);
__decorate([
    (0, microservices_1.EventPattern)('takeaway.kitchen.ready'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayEventsController.prototype, "handleKitchenReadyTakeaway", null);
__decorate([
    (0, microservices_1.EventPattern)('takeaway.customer.pickup'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayEventsController.prototype, "handleCustomerPickupTakeaway", null);
exports.TakeawayEventsController = TakeawayEventsController = TakeawayEventsController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [delivery_takeaway_orders_service_1.DeliveryTakeawayOrdersService])
], TakeawayEventsController);
//# sourceMappingURL=takeaway-events.controller.js.map