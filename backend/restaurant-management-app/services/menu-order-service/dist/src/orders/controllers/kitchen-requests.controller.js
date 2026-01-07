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
var KitchenRequestsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitchenRequestsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@rm/common");
const orders_management_service_1 = require("../services/orders-management.service");
const kafka_service_1 = require("../../kafka/kafka.service");
let KitchenRequestsController = KitchenRequestsController_1 = class KitchenRequestsController {
    ordersManagementService;
    kafkaService;
    logger = new common_1.Logger(KitchenRequestsController_1.name);
    constructor(ordersManagementService, kafkaService) {
        this.ordersManagementService = ordersManagementService;
        this.kafkaService = kafkaService;
    }
    async handleGetPendingOrdersRequest(event) {
        this.logger.log(`[KitchenRequestsController] Processing get pending orders request: ${event.requestId}`);
        this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getOrdersPendingKitchenAcceptance(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[KitchenRequestsController] Sending response for request: ${event.requestId}`);
            this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[KitchenRequestsController] Failed to process get pending orders request: ${error.message}`);
            this.logger.error(`[KitchenRequestsController] Full error:`, error);
            const errorResponseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: [],
                success: false,
                error: error.message
            };
            return errorResponseEvent;
        }
    }
    async handleGetDineInPendingRequest(event) {
        this.logger.log(`[KitchenRequestsController] Processing get dine-in pending request: ${event.requestId}`);
        this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getPendingDineInOrdersForKitchen(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[KitchenRequestsController] Sending response for dine-in request: ${event.requestId}`);
            this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[KitchenRequestsController] Failed to process get dine-in pending request: ${error.message}`);
            this.logger.error(`[KitchenRequestsController] Full error:`, error);
            const errorResponseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: [],
                success: false,
                error: error.message
            };
            return errorResponseEvent;
        }
    }
    async handleGetActiveOrdersRequest(event) {
        this.logger.log(`[KitchenRequestsController] Processing get active orders request: ${event.requestId}`);
        this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getActiveDineInOrders(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[KitchenRequestsController] Sending response for active orders request: ${event.requestId}`);
            this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[KitchenRequestsController] Failed to process get active orders request: ${error.message}`);
            this.logger.error(`[KitchenRequestsController] Full error:`, error);
            const errorResponseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: [],
                success: false,
                error: error.message
            };
            return errorResponseEvent;
        }
    }
    async handleGetAcceptedOrdersRequest(event) {
        this.logger.log(`[KitchenRequestsController] Processing get accepted orders request: ${event.requestId}`);
        this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getKitchenAcceptedOrders(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[KitchenRequestsController] Sending response for accepted orders request: ${event.requestId}`);
            this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[KitchenRequestsController] Failed to process get accepted orders request: ${error.message}`);
            this.logger.error(`[KitchenRequestsController] Full error:`, error);
            const errorResponseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: [],
                success: false,
                error: error.message
            };
            return errorResponseEvent;
        }
    }
    async handleGetDineInAcceptedRequest(event) {
        this.logger.log(`[KitchenRequestsController] Processing get dine-in accepted request: ${event.requestId}`);
        this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getAcceptedDineInOrdersForKitchen(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[KitchenRequestsController] Sending response for dine-in accepted request: ${event.requestId}`);
            this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[KitchenRequestsController] Failed to process get dine-in accepted request: ${error.message}`);
            this.logger.error(`[KitchenRequestsController] Full error:`, error);
            const errorResponseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: [],
                success: false,
                error: error.message
            };
            return errorResponseEvent;
        }
    }
    async handleGetReadyTakeawayRequest(event) {
        this.logger.log(`[KitchenRequestsController] Processing get ready takeaway request: ${event.requestId}`);
        this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getReadyTakeawayOrders(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[KitchenRequestsController] Sending response for ready takeaway request: ${event.requestId}`);
            this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[KitchenRequestsController] Failed to process get ready takeaway request: ${error.message}`);
            this.logger.error(`[KitchenRequestsController] Full error:`, error);
            const errorResponseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: [],
                success: false,
                error: error.message
            };
            return errorResponseEvent;
        }
    }
    async handleGetReadyDeliveryRequest(event) {
        this.logger.log(`[KitchenRequestsController] Processing get ready delivery request: ${event.requestId}`);
        this.logger.log(`[KitchenRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getReadyDeliveryOrders(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[KitchenRequestsController] Sending response for ready delivery request: ${event.requestId}`);
            this.logger.log(`[KitchenRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[KitchenRequestsController] Failed to process get ready delivery request: ${error.message}`);
            this.logger.error(`[KitchenRequestsController] Full error:`, error);
            const errorResponseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: [],
                success: false,
                error: error.message
            };
            return errorResponseEvent;
        }
    }
};
exports.KitchenRequestsController = KitchenRequestsController;
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.KITCHEN_GET_PENDING_ORDERS_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenRequestsController.prototype, "handleGetPendingOrdersRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_PENDING_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenRequestsController.prototype, "handleGetDineInPendingRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.KITCHEN_GET_ACTIVE_ORDERS_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenRequestsController.prototype, "handleGetActiveOrdersRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.KITCHEN_GET_ACCEPTED_ORDERS_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenRequestsController.prototype, "handleGetAcceptedOrdersRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.KITCHEN_GET_DINE_IN_ACCEPTED_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenRequestsController.prototype, "handleGetDineInAcceptedRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.KITCHEN_GET_READY_TAKEAWAY_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenRequestsController.prototype, "handleGetReadyTakeawayRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.KITCHEN_GET_READY_DELIVERY_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], KitchenRequestsController.prototype, "handleGetReadyDeliveryRequest", null);
exports.KitchenRequestsController = KitchenRequestsController = KitchenRequestsController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [orders_management_service_1.OrdersManagementService,
        kafka_service_1.KafkaService])
], KitchenRequestsController);
//# sourceMappingURL=kitchen-requests.controller.js.map