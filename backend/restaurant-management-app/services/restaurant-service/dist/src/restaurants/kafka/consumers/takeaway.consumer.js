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
var TakeawayConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TakeawayConsumer = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
let TakeawayConsumer = TakeawayConsumer_1 = class TakeawayConsumer {
    logger = new common_1.Logger(TakeawayConsumer_1.name);
    async handleTakeawayOrderCreated(event) {
        this.logger.log(`New takeaway order created: ${event.orderId}`);
        try {
            await this.notifyKitchenAboutNewTakeaway(event);
            this.logger.log(`Takeaway order details: ${JSON.stringify({
                orderId: event.orderId,
                restaurantId: event.restaurantId,
                customerName: event.metadata.customerName,
                totalAmount: event.metadata.totalAmount,
                itemsCount: event.items.length
            })}`);
        }
        catch (error) {
            this.logger.error(`Failed to process takeaway order created: ${error.message}`);
        }
    }
    async handleKitchenAcceptTakeaway(event) {
        this.logger.log(`Kitchen accepted takeaway order: ${event.orderId}`);
        try {
            await this.notifyCustomerOrderAccepted(event);
            this.logger.log(`Kitchen acceptance details: ${JSON.stringify({
                orderId: event.orderId,
                chefId: event.metadata.chefId,
                acceptedAt: event.metadata.acceptedAt,
                acceptedItems: event.metadata.acceptedItems
            })}`);
        }
        catch (error) {
            this.logger.error(`Failed to process kitchen accept takeaway: ${error.message}`);
        }
    }
    async handleKitchenPreparingTakeaway(event) {
        this.logger.log(`Kitchen started preparing takeaway order: ${event.orderId}`);
        try {
            await this.notifyCustomerPreparationStarted(event);
            this.logger.log(`Preparation started details: ${JSON.stringify({
                orderId: event.orderId,
                chefId: event.metadata.chefId,
                preparationStartedAt: event.metadata.preparationStartedAt,
                note: event.metadata.note
            })}`);
        }
        catch (error) {
            this.logger.error(`Failed to process kitchen preparing takeaway: ${error.message}`);
        }
    }
    async handleKitchenReadyTakeaway(event) {
        this.logger.log(`Takeaway order ready for pickup: ${event.orderId}`);
        try {
            await this.notifyCustomerOrderReady(event);
            await this.notifyWaiterAboutReadyTakeaway(event);
            this.logger.log(`Order ready details: ${JSON.stringify({
                orderId: event.orderId,
                chefId: event.metadata.chefId,
                readyAt: event.metadata.readyAt,
                note: event.metadata.note
            })}`);
        }
        catch (error) {
            this.logger.error(`Failed to process kitchen ready takeaway: ${error.message}`);
        }
    }
    async handleCustomerPickupTakeaway(event) {
        this.logger.log(`Customer picked up takeaway order: ${event.orderId}`);
        try {
            await this.notifyKitchenOrderPickedUp(event);
            this.logger.log(`Order pickup details: ${JSON.stringify({
                orderId: event.orderId,
                waiterId: event.metadata.waiterId,
                pickedUpAt: event.metadata.pickedUpAt,
                customerName: event.metadata.customerName
            })}`);
        }
        catch (error) {
            this.logger.error(`Failed to process customer pickup takeaway: ${error.message}`);
        }
    }
    async notifyKitchenAboutNewTakeaway(event) {
        this.logger.log(`Notifying kitchen about new takeaway order ${event.orderId}`);
    }
    async notifyCustomerOrderAccepted(event) {
        this.logger.log(`Notifying customer that order ${event.orderId} was accepted`);
    }
    async notifyCustomerPreparationStarted(event) {
        this.logger.log(`Notifying customer that preparation started for order ${event.orderId}`);
    }
    async notifyCustomerOrderReady(event) {
        this.logger.log(`Notifying customer that order ${event.orderId} is ready for pickup`);
    }
    async notifyWaiterAboutReadyTakeaway(event) {
        this.logger.log(`Notifying waiter about ready takeaway order ${event.orderId}`);
    }
    async notifyKitchenOrderPickedUp(event) {
        this.logger.log(`Notifying kitchen that order ${event.orderId} was picked up`);
    }
};
exports.TakeawayConsumer = TakeawayConsumer;
__decorate([
    (0, microservices_1.EventPattern)('takeaway.order.created'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayConsumer.prototype, "handleTakeawayOrderCreated", null);
__decorate([
    (0, microservices_1.EventPattern)('takeaway.kitchen.accept'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayConsumer.prototype, "handleKitchenAcceptTakeaway", null);
__decorate([
    (0, microservices_1.EventPattern)('takeaway.kitchen.preparing'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayConsumer.prototype, "handleKitchenPreparingTakeaway", null);
__decorate([
    (0, microservices_1.EventPattern)('takeaway.kitchen.ready'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayConsumer.prototype, "handleKitchenReadyTakeaway", null);
__decorate([
    (0, microservices_1.EventPattern)('takeaway.customer.pickup'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TakeawayConsumer.prototype, "handleCustomerPickupTakeaway", null);
exports.TakeawayConsumer = TakeawayConsumer = TakeawayConsumer_1 = __decorate([
    (0, common_1.Injectable)()
], TakeawayConsumer);
//# sourceMappingURL=takeaway.consumer.js.map