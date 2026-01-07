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
var DriverRequestsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverRequestsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@rm/common");
const orders_management_service_1 = require("../services/orders-management.service");
const kafka_service_1 = require("../../kafka/kafka.service");
let DriverRequestsController = DriverRequestsController_1 = class DriverRequestsController {
    ordersManagementService;
    kafkaService;
    logger = new common_1.Logger(DriverRequestsController_1.name);
    constructor(ordersManagementService, kafkaService) {
        this.ordersManagementService = ordersManagementService;
        this.kafkaService = kafkaService;
    }
    async handleGetReadyOrdersRequest(event) {
        this.logger.log(`[DriverRequestsController] Processing get ready orders request: ${event.requestId}`);
        this.logger.log(`[DriverRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getReadyDeliveryOrders(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[DriverRequestsController] Sending response for ready orders request: ${event.requestId}`);
            this.logger.log(`[DriverRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[DriverRequestsController] Failed to process get ready orders request: ${error.message}`);
            this.logger.error(`[DriverRequestsController] Full error:`, error);
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
    async handleGetAssignedOrdersRequest(event) {
        this.logger.log(`[DriverRequestsController] Processing get assigned orders request: ${event.requestId}`);
        this.logger.log(`[DriverRequestsController] Event data:`, JSON.stringify(event, null, 2));
        try {
            const result = await this.ordersManagementService.getAssignedDeliveryOrders(event.restaurantId);
            const responseEvent = {
                requestId: event.requestId,
                restaurantId: event.restaurantId,
                timestamp: new Date(),
                orders: result.orders || [],
                success: true
            };
            this.logger.log(`[DriverRequestsController] Sending response for assigned orders request: ${event.requestId}`);
            this.logger.log(`[DriverRequestsController] Response data:`, JSON.stringify(responseEvent, null, 2));
            return responseEvent;
        }
        catch (error) {
            this.logger.error(`[DriverRequestsController] Failed to process get assigned orders request: ${error.message}`);
            this.logger.error(`[DriverRequestsController] Full error:`, error);
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
exports.DriverRequestsController = DriverRequestsController;
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.DRIVER_GET_READY_ORDERS_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverRequestsController.prototype, "handleGetReadyOrdersRequest", null);
__decorate([
    (0, microservices_1.MessagePattern)(common_2.ORDER_TOPICS.DRIVER_GET_ASSIGNED_ORDERS_REQUEST),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DriverRequestsController.prototype, "handleGetAssignedOrdersRequest", null);
exports.DriverRequestsController = DriverRequestsController = DriverRequestsController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [orders_management_service_1.OrdersManagementService,
        kafka_service_1.KafkaService])
], DriverRequestsController);
//# sourceMappingURL=driver-requests.controller.js.map