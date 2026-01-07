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
var WaiterController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaiterController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const restaurant_roles_guard_1 = require("../../auth/guards/restaurant-roles.guard");
const restaurant_roles_decorator_1 = require("../../auth/decorators/restaurant-roles.decorator");
const waiter_service_1 = require("../services/waiter.service");
const common_2 = require("@rm/common");
let WaiterController = WaiterController_1 = class WaiterController {
    waiterService;
    logger = new common_1.Logger(WaiterController_1.name);
    constructor(waiterService) {
        this.waiterService = waiterService;
    }
    extractToken(req) {
        const authHeader = req.headers['authorization'];
        const jwtFromCookie = req.cookies?.jwt;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : jwtFromCookie;
        if (!token) {
            throw new Error('Missing or invalid token');
        }
        return token;
    }
    async createDineInOrder(restaurantId, createOrderDto, req) {
        this.logger.log(`[WaiterController] Creating dine-in order for restaurant: ${restaurantId}`);
        const token = this.extractToken(req);
        return this.waiterService.createDineInOrder(restaurantId, req.user._id, createOrderDto, token);
    }
    async sendBatchToKitchen(restaurantId, orderId, batchDto, req) {
        this.logger.log(`[WaiterController] Sending batch to kitchen for order: ${orderId}`);
        const token = this.extractToken(req);
        return this.waiterService.sendBatchToKitchen(restaurantId, orderId, req.user._id, batchDto, token);
    }
    async addBatchToOrder(restaurantId, orderId, batchDto, req) {
        this.logger.log(`[WaiterController] Adding batch to order: ${orderId}`);
        const token = this.extractToken(req);
        return this.waiterService.addBatchToOrder(restaurantId, orderId, req.user._id, batchDto, token);
    }
    async serveBatch(restaurantId, orderId, serveDto, req) {
        this.logger.log(`[WaiterController] Serving batch for order: ${orderId}`);
        const token = this.extractToken(req);
        return this.waiterService.serveBatch(restaurantId, orderId, req.user._id, serveDto, token);
    }
    async requestPayment(restaurantId, orderId, requestDto, req) {
        this.logger.log(`[WaiterController] Requesting payment for order: ${orderId}`);
        const token = this.extractToken(req);
        return this.waiterService.requestPayment(restaurantId, orderId, req.user._id, requestDto, token);
    }
    async completePayment(restaurantId, orderId, paymentDto, req) {
        this.logger.log(`[WaiterController] Completing payment for order: ${orderId}`);
        const token = this.extractToken(req);
        return this.waiterService.completePayment(restaurantId, orderId, req.user._id, paymentDto, token);
    }
    async getAllOrders(restaurantId, req) {
        const token = this.extractToken(req);
        return this.waiterService.getAllOrders(restaurantId, token);
    }
    async getReadyBatches(restaurantId, req) {
        const token = this.extractToken(req);
        return this.waiterService.getReadyBatches(restaurantId, token);
    }
    async getCurrentOrders(restaurantId, req) {
        const token = this.extractToken(req);
        return this.waiterService.getCurrentOrders(restaurantId, req.user._id, token);
    }
    async getCompletedOrders(restaurantId, req) {
        const token = this.extractToken(req);
        return this.waiterService.getCompletedOrders(restaurantId, req.user._id, token);
    }
    async getReadyTakeawayOrders(req, restaurantId) {
        const token = this.extractToken(req);
        return this.waiterService.getReadyTakeawayOrders(restaurantId, token);
    }
    async pickupTakeawayOrder(req, restaurantId, orderId, body) {
        const token = this.extractToken(req);
        return this.waiterService.pickupTakeawayOrder(restaurantId, orderId, req.user._id, body, token);
    }
};
exports.WaiterController = WaiterController;
__decorate([
    (0, common_1.Post)('dine-in/create'),
    (0, swagger_1.ApiOperation)({ summary: 'Create dine-in order with batches' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Dine-in order created successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.CreateDineInOrderDto, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "createDineInOrder", null);
__decorate([
    (0, common_1.Put)(':orderId/send-batch-to-kitchen'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a batch to kitchen' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch sent to kitchen successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.SendBatchToKitchenDto, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "sendBatchToKitchen", null);
__decorate([
    (0, common_1.Put)(':orderId/add-batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Add a new batch to existing order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch added to order successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.AddBatchToOrderDto, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "addBatchToOrder", null);
__decorate([
    (0, common_1.Put)(':orderId/serve-batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Serve a batch to table' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch served successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.ServeBatchDto, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "serveBatch", null);
__decorate([
    (0, common_1.Put)(':orderId/request-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Request payment from customer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment requested successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.RequestPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "requestPayment", null);
__decorate([
    (0, common_1.Put)(':orderId/complete-payment'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete payment and finish order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment completed successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.CompletePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "completePayment", null);
__decorate([
    (0, common_1.Get)('orders/all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders for restaurant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns all orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "getAllOrders", null);
__decorate([
    (0, common_1.Get)('orders/ready-batches'),
    (0, swagger_1.ApiOperation)({ summary: 'Get batches ready for service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns batches ready for service' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "getReadyBatches", null);
__decorate([
    (0, common_1.Get)('orders/current'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current orders for waiter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns current orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "getCurrentOrders", null);
__decorate([
    (0, common_1.Get)('orders/completed'),
    (0, swagger_1.ApiOperation)({ summary: 'Get completed orders for waiter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns completed orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "getCompletedOrders", null);
__decorate([
    (0, common_1.Get)('takeaway/ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Get takeaway orders ready for pickup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns takeaway orders ready for pickup' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "getReadyTakeawayOrders", null);
__decorate([
    (0, common_1.Put)('takeaway/:orderId/pickup'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'waiter'),
    (0, swagger_1.ApiOperation)({ summary: 'Customer picks up takeaway order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Takeaway order picked up successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], WaiterController.prototype, "pickupTakeawayOrder", null);
exports.WaiterController = WaiterController = WaiterController_1 = __decorate([
    (0, swagger_1.ApiTags)('Waiter Management'),
    (0, common_1.Controller)('restaurants/:restaurantId/service'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee', 'waiter'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [waiter_service_1.WaiterService])
], WaiterController);
//# sourceMappingURL=waiter.controller.js.map