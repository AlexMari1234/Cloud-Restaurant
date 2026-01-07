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
exports.OrdersManagementController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const orders_management_service_1 = require("../services/orders-management.service");
const common_2 = require("@rm/common");
let OrdersManagementController = class OrdersManagementController {
    ordersManagementService;
    constructor(ordersManagementService) {
        this.ordersManagementService = ordersManagementService;
    }
    async getOrdersByStatus(restaurantId, status, orderType, page = 1, limit = 50) {
        return this.ordersManagementService.getOrdersByStatus(restaurantId, { status, orderType, page, limit });
    }
    async getOrderById(restaurantId, orderId) {
        return this.ordersManagementService.getOrderById(restaurantId, orderId);
    }
    async updateOrderStatus(restaurantId, orderId, updateData) {
        return this.ordersManagementService.updateOrderStatus(restaurantId, orderId, updateData);
    }
    async addItemToOrder(restaurantId, orderId, addItemDto, req) {
        const batchDto = {
            items: [addItemDto],
            note: 'Single item added via legacy endpoint'
        };
        return this.ordersManagementService.addBatchToOrder(restaurantId, orderId, req.user._id, batchDto);
    }
    async getActiveDineInOrders(restaurantId) {
        return this.ordersManagementService.getActiveDineInOrders(restaurantId);
    }
    async getOrdersReadyForService(restaurantId) {
        return this.ordersManagementService.getOrdersReadyForService(restaurantId);
    }
    async getOrdersPendingKitchenAcceptance(restaurantId) {
        return this.ordersManagementService.getOrdersPendingKitchenAcceptance(restaurantId);
    }
    async getKitchenAcceptedOrders(restaurantId) {
        return this.ordersManagementService.getKitchenAcceptedOrders(restaurantId);
    }
    async getPendingDineInOrders(restaurantId) {
        return this.ordersManagementService.getOrdersByStatus(restaurantId, { status: common_2.OrderStatusEnum.PENDING, orderType: 'DINE_IN', page: 1, limit: 50 });
    }
    async getPendingTakeawayOrders(restaurantId) {
        return this.ordersManagementService.getOrdersByStatus(restaurantId, { status: common_2.OrderStatusEnum.PENDING, orderType: 'TAKEAWAY', page: 1, limit: 50 });
    }
    async getPendingDeliveryOrders(restaurantId) {
        return this.ordersManagementService.getOrdersByStatus(restaurantId, { status: common_2.OrderStatusEnum.PENDING, orderType: 'DELIVERY', page: 1, limit: 50 });
    }
    async getReadyDineInOrders(restaurantId) {
        return this.ordersManagementService.getOrdersByStatus(restaurantId, { status: common_2.OrderStatusEnum.ALL_READY, orderType: 'DINE_IN', page: 1, limit: 50 });
    }
    async getReadyTakeawayOrders(restaurantId) {
        return this.ordersManagementService.getOrdersByStatus(restaurantId, { status: common_2.OrderStatusEnum.READY, orderType: 'TAKEAWAY', page: 1, limit: 50 });
    }
    async getReadyDeliveryOrders(restaurantId) {
        return this.ordersManagementService.getOrdersByStatus(restaurantId, { status: 'READY_FOR_DELIVERY', orderType: 'DELIVERY', page: 1, limit: 50 });
    }
    async getPreparingOrders(restaurantId) {
        return this.ordersManagementService.getOrdersByStatus(restaurantId, { status: common_2.OrderStatusEnum.PREPARING, page: 1, limit: 50 });
    }
    async getKitchenAcceptedAllOrders(restaurantId) {
        return this.ordersManagementService.getOrdersByStatus(restaurantId, { status: common_2.OrderStatusEnum.KITCHEN_ACCEPTED, page: 1, limit: 50 });
    }
    async getKitchenPendingDineInOrders(restaurantId) {
        return this.ordersManagementService.getPendingDineInOrdersForKitchen(restaurantId);
    }
    async getKitchenAcceptedDineInOrders(restaurantId) {
        return this.ordersManagementService.getAcceptedDineInOrdersForKitchen(restaurantId);
    }
    async getWaiterCurrentOrders(restaurantId) {
        return this.ordersManagementService.getCurrentOrdersForWaiter(restaurantId);
    }
    async getWaiterCompletedOrders(restaurantId) {
        return this.ordersManagementService.getCompletedOrdersForWaiter(restaurantId);
    }
    async getWaiterReadyBatches(restaurantId) {
        return this.ordersManagementService.getReadyBatchesForWaiter(restaurantId);
    }
};
exports.OrdersManagementController = OrdersManagementController;
__decorate([
    (0, common_1.Get)('all'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders by status and type for restaurant management' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns filtered orders' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: common_2.OrderStatusEnum }),
    (0, swagger_1.ApiQuery)({ name: 'orderType', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('orderType')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getOrdersByStatus", null);
__decorate([
    (0, common_1.Get)(':orderId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order details by ID for restaurant management' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns order details' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Put)(':orderId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status for restaurant management' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order status updated' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.UpdateOrderStatusDto]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "updateOrderStatus", null);
__decorate([
    (0, common_1.Put)(':orderId/add-item'),
    (0, swagger_1.ApiOperation)({ summary: 'Add item to existing order (legacy - use add-batch for dine-in)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Item added to order successfully' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.AddItemToOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "addItemToOrder", null);
__decorate([
    (0, common_1.Get)('dine-in/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active dine-in orders' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns active dine-in orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getActiveDineInOrders", null);
__decorate([
    (0, common_1.Get)('dine-in/ready-for-service'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders ready for waiter service' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns orders ready for service' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getOrdersReadyForService", null);
__decorate([
    (0, common_1.Get)('kitchen/pending-acceptance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders/items sent to kitchen awaiting acceptance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns orders with items in SENT_TO_KITCHEN status' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getOrdersPendingKitchenAcceptance", null);
__decorate([
    (0, common_1.Get)('kitchen/accepted-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders accepted by kitchen for preparation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns orders with items accepted by kitchen' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getKitchenAcceptedOrders", null);
__decorate([
    (0, common_1.Get)('pending/dine-in'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending dine-in orders' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns pending dine-in orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getPendingDineInOrders", null);
__decorate([
    (0, common_1.Get)('pending/takeaway'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending takeaway orders' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns pending takeaway orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getPendingTakeawayOrders", null);
__decorate([
    (0, common_1.Get)('pending/delivery'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending delivery orders' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns pending delivery orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getPendingDeliveryOrders", null);
__decorate([
    (0, common_1.Get)('ready/dine-in'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ready dine-in orders for waiter notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns dine-in orders ready for service' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getReadyDineInOrders", null);
__decorate([
    (0, common_1.Get)('ready/takeaway'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ready takeaway orders for pickup notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns takeaway orders ready for pickup' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getReadyTakeawayOrders", null);
__decorate([
    (0, common_1.Get)('ready/delivery'),
    (0, swagger_1.ApiOperation)({ summary: 'Get ready delivery orders for driver notification' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns delivery orders ready for pickup' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getReadyDeliveryOrders", null);
__decorate([
    (0, common_1.Get)('kitchen/preparing'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders currently being prepared in kitchen' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns orders being prepared' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getPreparingOrders", null);
__decorate([
    (0, common_1.Get)('kitchen/accepted'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all orders accepted by kitchen but not yet preparing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns kitchen accepted orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getKitchenAcceptedAllOrders", null);
__decorate([
    (0, common_1.Get)('kitchen/dine-in/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dine-in orders with batches pending kitchen acceptance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns dine-in orders with pending batches' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getKitchenPendingDineInOrders", null);
__decorate([
    (0, common_1.Get)('kitchen/dine-in/accepted'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dine-in orders accepted by kitchen but not all ready' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns dine-in orders accepted by kitchen' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getKitchenAcceptedDineInOrders", null);
__decorate([
    (0, common_1.Get)('waiter/current-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current active orders for waiter (not completed/cancelled)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns current active orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getWaiterCurrentOrders", null);
__decorate([
    (0, common_1.Get)('waiter/completed-orders'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recently completed orders for waiter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns recently completed orders' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getWaiterCompletedOrders", null);
__decorate([
    (0, common_1.Get)('waiter/ready-batches'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dine-in orders with ready batches to serve' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns orders with ready batches' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersManagementController.prototype, "getWaiterReadyBatches", null);
exports.OrdersManagementController = OrdersManagementController = __decorate([
    (0, swagger_1.ApiTags)('orders-management'),
    (0, common_1.Controller)('restaurants/:restaurantId/orders/manage'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [orders_management_service_1.OrdersManagementService])
], OrdersManagementController);
//# sourceMappingURL=orders-management.controller.js.map