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
var KitchenResponsesController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitchenResponsesController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@rm/common");
let KitchenResponsesController = KitchenResponsesController_1 = class KitchenResponsesController {
    logger = new common_1.Logger(KitchenResponsesController_1.name);
    pendingResponses = new Map();
    async handleGetPendingOrdersResponse(event) {
        this.logger.log(`[KitchenResponsesController] Received pending orders response: ${event.requestId}`);
        this.logger.log(`[KitchenResponsesController] Response data:`, JSON.stringify(event, null, 2));
        this.pendingResponses.set(event.requestId, {
            success: event.success,
            orders: event.orders,
            error: event.error,
            timestamp: event.timestamp
        });
        this.logger.log(`[KitchenResponsesController] Response stored for request: ${event.requestId}`);
    }
    async handleGetDineInPendingResponse(event) {
        this.logger.log(`[KitchenResponsesController] Received dine-in pending response: ${event.requestId}`);
        this.logger.log(`[KitchenResponsesController] Response data:`, JSON.stringify(event, null, 2));
        this.pendingResponses.set(event.requestId, {
            success: event.success,
            orders: event.orders,
            error: event.error,
            timestamp: event.timestamp
        });
        this.logger.log(`[KitchenResponsesController] Response stored for dine-in request: ${event.requestId}`);
    }
    getResponse(requestId) {
        const response = this.pendingResponses.get(requestId);
        if (response) {
            this.pendingResponses.delete(requestId);
            return response;
        }
        return null;
    }
    async waitForResponse(requestId, timeoutMs = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
            const response = this.getResponse(requestId);
            if (response) {
                return response;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.logger.warn(`[KitchenResponsesController] Timeout waiting for response: ${requestId}`);
        return null;
    }
};
exports.KitchenResponsesController = KitchenResponsesController;
__decorate([
    (0, microservices_1.EventPattern)(common_2.ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_RESPONSE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenResponsesController.prototype, "handleGetPendingOrdersResponse", null);
__decorate([
    (0, microservices_1.EventPattern)(common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_RESPONSE),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenResponsesController.prototype, "handleGetDineInPendingResponse", null);
exports.KitchenResponsesController = KitchenResponsesController = KitchenResponsesController_1 = __decorate([
    (0, common_1.Controller)()
], KitchenResponsesController);
//# sourceMappingURL=kitchen-responses.controller.js.map