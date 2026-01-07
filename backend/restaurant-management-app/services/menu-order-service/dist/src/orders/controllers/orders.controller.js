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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("../services/orders.service");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@rm/common");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async createOrderFromCart(req, restaurantId, createOrderDto) {
        return this.ordersService.createOrderFromCart(req.user._id, req.user.email, restaurantId, createOrderDto);
    }
    async placeDirectOrder(req, restaurantId, createOrderDto) {
        return this.ordersService.createOrderFromCart(req.user._id, req.user.email, restaurantId, createOrderDto);
    }
    async createDirectDineInOrder(req, restaurantId, createOrderDto) {
        return this.ordersService.createEnhancedDineInOrder(req.user._id, req.user.email, restaurantId, createOrderDto);
    }
    async getUserOrders(req, restaurantId, status, page = 1, limit = 10) {
        return this.ordersService.getUserOrders(req.user._id, restaurantId, { status, page, limit });
    }
    async getOrderById(req, restaurantId, orderId) {
        return this.ordersService.getOrderById(orderId, req.user._id, restaurantId);
    }
    async cancelOrder(req, restaurantId, orderId) {
        return this.ordersService.cancelOrder(orderId, req.user._id, restaurantId);
    }
    async trackOrder(restaurantId, orderId) {
        return this.ordersService.getOrderTrackingInfo(orderId, restaurantId);
    }
    async pickupTakeawayOrder(req, restaurantId, orderId, body) {
        return this.ordersService.pickupTakeawayOrder(restaurantId, orderId, req.user._id, body);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Post)('from-cart'),
    (0, swagger_1.ApiOperation)({ summary: 'Create order from current cart' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order created successfully from cart' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cart is empty or invalid' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, common_2.CreateOrderFromCartDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createOrderFromCart", null);
__decorate([
    (0, common_1.Post)('place-direct'),
    (0, swagger_1.ApiOperation)({ summary: 'Place order from cart with optional customer email override' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Order placed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Cart is empty or invalid' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, common_2.CreateOrderFromCartDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "placeDirectOrder", null);
__decorate([
    (0, common_1.Post)('direct'),
    (0, swagger_1.ApiOperation)({ summary: 'Create direct order without cart (waiter functionality)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Direct order created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid order data' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, common_2.CreateDineInOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createDirectDineInOrder", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user orders for a restaurant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns user orders' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: common_2.OrderStatusEnum }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getUserOrders", null);
__decorate([
    (0, common_1.Get)(':orderId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get specific order details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns order details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Order not found' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Put)(':orderId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel order (only if pending)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order cancelled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Order cannot be cancelled' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Get)(':orderId/track'),
    (0, swagger_1.ApiOperation)({ summary: 'Track order status (public endpoint)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns order tracking info' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "trackOrder", null);
__decorate([
    (0, common_1.Put)(':orderId/pickup'),
    (0, swagger_1.ApiOperation)({ summary: 'Customer picks up takeaway order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Takeaway order picked up successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "pickupTakeawayOrder", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('restaurants/:restaurantId/orders'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map