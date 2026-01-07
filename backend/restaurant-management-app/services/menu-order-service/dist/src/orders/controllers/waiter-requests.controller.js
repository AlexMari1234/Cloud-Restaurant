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
var WaiterRequestsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaiterRequestsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@rm/common");
const orders_management_service_1 = require("../services/orders-management.service");
const kafka_service_1 = require("../../kafka/kafka.service");
let WaiterRequestsController = WaiterRequestsController_1 = class WaiterRequestsController {
    ordersManagementService;
    kafkaService;
    logger = new common_1.Logger(WaiterRequestsController_1.name);
    constructor(ordersManagementService, kafkaService) {
        this.ordersManagementService = ordersManagementService;
        this.kafkaService = kafkaService;
    }
    async handleGetAllOrdersRequest(event) {
        this.logger.log(`[WaiterRequestsController] Processing get all orders request: ${event.requestId}`);
        this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getActiveDineInOrders(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[WaiterRequestsController] Sending response for all orders request: ${event.requestId}`);
            this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[WaiterRequestsController] Failed to process get all orders request: ${error.message}`);
            this.logger.error(`[WaiterRequestsController] Full error:`, error);
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
    async handleGetReadyBatchesRequest(event) {
        this.logger.log(`[WaiterRequestsController] Processing get ready batches request: ${event.requestId}`);
        this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getReadyBatchesForWaiter(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[WaiterRequestsController] Sending response for ready batches request: ${event.requestId}`);
            this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[WaiterRequestsController] Failed to process get ready batches request: ${error.message}`);
            this.logger.error(`[WaiterRequestsController] Full error:`, error);
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
    async handleGetCurrentOrdersRequest(event) {
        this.logger.log(`[WaiterRequestsController] Processing get current orders request: ${event.requestId}`);
        this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getCurrentOrdersForWaiter(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[WaiterRequestsController] Sending response for current orders request: ${event.requestId}`);
            this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[WaiterRequestsController] Failed to process get current orders request: ${error.message}`);
            this.logger.error(`[WaiterRequestsController] Full error:`, error);
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
    async handleGetCompletedOrdersRequest(event) {
        this.logger.log(`[WaiterRequestsController] Processing get completed orders request: ${event.requestId}`);
        this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getCompletedOrdersForWaiter(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[WaiterRequestsController] Sending response for completed orders request: ${event.requestId}`);
            this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[WaiterRequestsController] Failed to process get completed orders request: ${error.message}`);
            this.logger.error(`[WaiterRequestsController] Full error:`, error);
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
        this.logger.log(`[WaiterRequestsController] Processing get ready takeaway request: ${event.requestId}`);
        this.logger.log(`[WaiterRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getReadyTakeawayOrders(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[WaiterRequestsController] Sending response for ready takeaway request: ${event.requestId}`);
            this.logger.log(`[WaiterRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[WaiterRequestsController] Failed to process get ready takeaway request: ${error.message}`);
            this.logger.error(`[WaiterRequestsController] Full error:`, error);
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
exports.WaiterRequestsController = WaiterRequestsController;
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.WAITER_GET_ALL_ORDERS_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WaiterRequestsController.prototype, "handleGetAllOrdersRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.WAITER_GET_READY_BATCHES_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WaiterRequestsController.prototype, "handleGetReadyBatchesRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.WAITER_GET_CURRENT_ORDERS_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WaiterRequestsController.prototype, "handleGetCurrentOrdersRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.WAITER_GET_COMPLETED_ORDERS_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WaiterRequestsController.prototype, "handleGetCompletedOrdersRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.WAITER_GET_READY_TAKEAWAY_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WaiterRequestsController.prototype, "handleGetReadyTakeawayRequest", null);
exports.WaiterRequestsController = WaiterRequestsController = WaiterRequestsController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [orders_management_service_1.OrdersManagementService,
        kafka_service_1.KafkaService])
], WaiterRequestsController);
//# sourceMappingURL=waiter-requests.controller.js.map