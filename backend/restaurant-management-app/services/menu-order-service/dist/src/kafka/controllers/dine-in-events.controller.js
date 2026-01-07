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
var DineInEventsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DineInEventsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const dine_in_orders_service_1 = require("../../orders/services/dine-in-orders.service");
let DineInEventsController = DineInEventsController_1 = class DineInEventsController {
    dineInOrdersService;
    logger = new common_1.Logger(DineInEventsController_1.name);
    constructor(dineInOrdersService) {
        this.dineInOrdersService = dineInOrdersService;
    }
    async handleWaiterCreateDineIn(event) {
        this.logger.log(`[DineInEventsController] Processing waiter create dine-in: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const createdOrder = await this.dineInOrdersService.createDineInOrder(event.metadata.waiterId, event.metadata.waiterEmail, event.restaurantId, {
                customerEmail: event.metadata.customerEmail || '',
                tableNumber: event.metadata.tableNumber,
                batches: [{
                        items: event.metadata.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            specialInstructions: item.specialInstructions
                        })),
                        batchNote: undefined
                    }],
                orderNotes: event.metadata.orderNotes,
                customerName: event.metadata.customerName
            });
            this.logger.log(`[DineInEventsController] Dine-in order created in DB: ${createdOrder._id}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process waiter create dine-in: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleWaiterSendBatch(event) {
        this.logger.log(`[DineInEventsController] Processing waiter send batch: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.sendBatchToKitchen(event.orderId, event.restaurantId, event.metadata.waiterId, {
                batchNumber: event.metadata.batchNumber,
                kitchenNote: event.metadata.note
            });
            this.logger.log(`[DineInEventsController] Batch sent to kitchen: ${event.orderId}, batch: ${event.metadata.batchNumber}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process waiter send batch: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleWaiterAddBatch(event) {
        this.logger.log(`[DineInEventsController] Processing waiter add batch: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.addBatchToOrder(event.orderId, event.restaurantId, event.metadata.waiterId, {
                items: event.metadata.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    specialInstructions: item.specialInstructions
                })),
                batchNote: event.metadata.note,
                sendToKitchen: true
            });
            this.logger.log(`[DineInEventsController] Batch added to order: ${event.orderId}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process waiter add batch: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleWaiterServeBatch(event) {
        this.logger.log(`[DineInEventsController] Processing waiter serve batch: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.serveBatch(event.orderId, event.restaurantId, event.metadata.waiterId, {
                batchNumber: event.metadata.batchNumber,
                note: event.metadata.note
            });
            this.logger.log(`[DineInEventsController] Batch served: ${event.orderId}, batch: ${event.metadata.batchNumber}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process waiter serve batch: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleWaiterRequestPayment(event) {
        this.logger.log(`[DineInEventsController] Processing waiter request payment: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.requestPayment(event.orderId, event.restaurantId, event.metadata.waiterId, {
                note: event.metadata.note
            });
            this.logger.log(`[DineInEventsController] Payment requested: ${event.orderId}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process waiter request payment: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleWaiterCompletePayment(event) {
        this.logger.log(`[DineInEventsController] Processing waiter complete payment: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.completePayment(event.orderId, event.restaurantId, event.metadata.waiterId, {
                paymentMethod: event.metadata.paymentMethod,
                amountPaid: event.metadata.totalAmount || 0,
                note: event.metadata.note
            });
            this.logger.log(`[DineInEventsController] Payment completed: ${event.orderId}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process waiter complete payment: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleKitchenAcceptBatch(event) {
        this.logger.log(`[DineInEventsController] Processing kitchen accept batch: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.kitchenAcceptBatch(event.orderId, event.restaurantId, event.metadata.chefId, event.metadata.batchNumber);
            this.logger.log(`[DineInEventsController] Kitchen accepted batch: ${event.orderId}, batch: ${event.metadata.batchNumber}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process kitchen accept batch: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleKitchenBatchPreparing(event) {
        this.logger.log(`[DineInEventsController] Processing kitchen batch preparing: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.batchPreparing(event.orderId, event.restaurantId, event.metadata.batchNumber, event.metadata.chefId, event.metadata.note);
            this.logger.log(`[DineInEventsController] Kitchen batch preparing: ${event.orderId}, batch: ${event.metadata.batchNumber}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process kitchen batch preparing: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleKitchenBatchReady(event) {
        this.logger.log(`[DineInEventsController] Processing kitchen batch ready: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.batchReady(event.orderId, event.restaurantId, event.metadata.batchNumber, event.metadata.chefId, event.metadata.note);
            this.logger.log(`[DineInEventsController] Kitchen batch ready: ${event.orderId}, batch: ${event.metadata.batchNumber}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process kitchen batch ready: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleKitchenItemPreparing(event) {
        this.logger.log(`[DineInEventsController] Processing kitchen item preparing: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.updateItemStatus(event.orderId, event.restaurantId, event.metadata.batchNumber, event.metadata.productId, event.metadata.chefId, 'PREPARING');
            this.logger.log(`[DineInEventsController] Kitchen item preparing: ${event.orderId}, batch: ${event.metadata.batchNumber}, item: ${event.metadata.productId}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process kitchen item preparing: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
    async handleKitchenItemReady(event) {
        this.logger.log(`[DineInEventsController] Processing kitchen item ready: ${event.orderId}`);
        this.logger.log(`[DineInEventsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            await this.dineInOrdersService.updateItemStatus(event.orderId, event.restaurantId, event.metadata.batchNumber, event.metadata.productId, event.metadata.chefId, 'READY');
            this.logger.log(`[DineInEventsController] Kitchen item ready: ${event.orderId}, batch: ${event.metadata.batchNumber}, item: ${event.metadata.productId}`);
        }
        catch (error) {
            this.logger.error(`[DineInEventsController] Failed to process kitchen item ready: ${error.message}`);
            this.logger.error(`[DineInEventsController] Full error:`, error);
        }
    }
};
exports.DineInEventsController = DineInEventsController;
__decorate([
    (0, microservices_1.EventPattern)('dine-in.waiter.create'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleWaiterCreateDineIn", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.waiter.send-batch'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleWaiterSendBatch", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.waiter.add-batch'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleWaiterAddBatch", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.waiter.serve-batch'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleWaiterServeBatch", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.waiter.request-payment'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleWaiterRequestPayment", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.waiter.complete-payment'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleWaiterCompletePayment", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.kitchen.accept-batch'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleKitchenAcceptBatch", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.kitchen.batch-preparing'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleKitchenBatchPreparing", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.kitchen.batch-ready'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleKitchenBatchReady", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.kitchen.item-preparing'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleKitchenItemPreparing", null);
__decorate([
    (0, microservices_1.EventPattern)('dine-in.kitchen.item-ready'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DineInEventsController.prototype, "handleKitchenItemReady", null);
exports.DineInEventsController = DineInEventsController = DineInEventsController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [dine_in_orders_service_1.DineInOrdersService])
], DineInEventsController);
//# sourceMappingURL=dine-in-events.controller.js.map