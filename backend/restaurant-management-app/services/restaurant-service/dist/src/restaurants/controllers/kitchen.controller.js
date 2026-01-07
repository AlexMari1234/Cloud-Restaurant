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
exports.KitchenController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const restaurant_roles_guard_1 = require("../../auth/guards/restaurant-roles.guard");
const restaurant_roles_decorator_1 = require("../../auth/decorators/restaurant-roles.decorator");
const kitchen_service_1 = require("../services/kitchen.service");
const common_2 = require("@rm/common");
let KitchenController = class KitchenController {
    kitchenService;
    constructor(kitchenService) {
        this.kitchenService = kitchenService;
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
    async getPendingOrders(req, restaurantId) {
        const token = this.extractToken(req);
        return this.kitchenService.getPendingOrders(restaurantId, token);
    }
    async acceptOrder(req, restaurantId, orderId, body) {
        const token = this.extractToken(req);
        return this.kitchenService.acceptOrder(restaurantId, orderId, req.user._id, body, token);
    }
    async startPreparing(req, restaurantId, orderId, body) {
        const token = this.extractToken(req);
        return this.kitchenService.startPreparing(restaurantId, orderId, req.user._id, body, token);
    }
    async markReady(req, restaurantId, orderId, body) {
        const token = this.extractToken(req);
        return this.kitchenService.markReady(restaurantId, orderId, req.user._id, body, token);
    }
    async getActiveOrders(req, restaurantId) {
        const token = this.extractToken(req);
        return this.kitchenService.getActiveOrders(restaurantId, token);
    }
    async acceptTakeawayOrder(req, restaurantId, orderId, body) {
        return this.kitchenService.acceptTakeawayOrder(restaurantId, orderId, req.user._id, body);
    }
    async preparingTakeawayOrder(req, restaurantId, orderId, body) {
        return this.kitchenService.preparingTakeawayOrder(restaurantId, orderId, req.user._id, body);
    }
    async readyTakeawayOrder(req, restaurantId, orderId, body) {
        return this.kitchenService.readyTakeawayOrder(restaurantId, orderId, req.user._id, body);
    }
    async getReadyTakeawayOrders(req, restaurantId) {
        const token = this.extractToken(req);
        return this.kitchenService.getReadyTakeawayOrders(restaurantId, token);
    }
    async acceptDeliveryOrder(req, restaurantId, orderId, body) {
        return this.kitchenService.acceptDeliveryOrder(restaurantId, orderId, req.user._id, body);
    }
    async preparingDeliveryOrder(req, restaurantId, orderId, body) {
        return this.kitchenService.preparingDeliveryOrder(restaurantId, orderId, req.user._id, body);
    }
    async readyDeliveryOrder(req, restaurantId, orderId, body) {
        return this.kitchenService.readyDeliveryOrder(restaurantId, orderId, req.user._id, body);
    }
    async getReadyDeliveryOrders(req, restaurantId) {
        const token = this.extractToken(req);
        return this.kitchenService.getReadyDeliveryOrders(restaurantId, token);
    }
    async acceptDineInBatch(req, restaurantId, orderId, body) {
        return this.kitchenService.acceptDineInBatch(restaurantId, orderId, req.user._id, body);
    }
    async updateDineInBatchStatus(req, restaurantId, orderId, body) {
        return this.kitchenService.updateDineInBatchStatus(restaurantId, orderId, req.user._id, body);
    }
    async preparingDineInBatch(req, restaurantId, orderId, batchNumber, body) {
        return this.kitchenService.preparingDineInBatch(restaurantId, orderId, req.user._id, batchNumber, body);
    }
    async readyDineInBatch(req, restaurantId, orderId, batchNumber, body) {
        return this.kitchenService.readyDineInBatch(restaurantId, orderId, req.user._id, batchNumber, body);
    }
    async updateDineInItemStatus(req, restaurantId, orderId, batchNumber, productId, body) {
        return this.kitchenService.updateDineInItemStatus(restaurantId, orderId, req.user._id, batchNumber, productId, body);
    }
    async getPendingDineInOrders(req, restaurantId) {
        const token = this.extractToken(req);
        return this.kitchenService.getPendingDineInOrders(restaurantId, token);
    }
    async getAcceptedDineInOrders(req, restaurantId) {
        const token = this.extractToken(req);
        return this.kitchenService.getAcceptedDineInOrders(restaurantId, token);
    }
};
exports.KitchenController = KitchenController;
__decorate([
    (0, common_1.Get)('orders/pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending orders for kitchen' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns pending orders' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getPendingOrders", null);
__decorate([
    (0, common_1.Put)('orders/:orderId/accept'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Kitchen accepts order with estimated preparation time' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order accepted by kitchen' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenAcceptOrderDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "acceptOrder", null);
__decorate([
    (0, common_1.Put)('orders/:orderId/start-preparing'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Start preparing order (notifies cooking has begun)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order preparation started' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenStartPreparingDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "startPreparing", null);
__decorate([
    (0, common_1.Put)('orders/:orderId/ready'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark order as ready for pickup/delivery' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order marked as ready' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenMarkReadyDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "markReady", null);
__decorate([
    (0, common_1.Get)('orders/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active orders in kitchen' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns active kitchen orders' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getActiveOrders", null);
__decorate([
    (0, common_1.Put)('takeaway/:orderId/accept'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Kitchen accepts takeaway order with estimated prep time' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Takeaway order accepted by kitchen' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenAcceptTakeawayOrderDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "acceptTakeawayOrder", null);
__decorate([
    (0, common_1.Put)('takeaway/:orderId/preparing'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark takeaway order as preparing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Takeaway order marked as preparing' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenStartPreparingTakeawayOrderDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "preparingTakeawayOrder", null);
__decorate([
    (0, common_1.Put)('takeaway/:orderId/ready'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark takeaway order as ready for pickup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Takeaway order marked as ready' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenMarkReadyTakeawayOrderDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "readyTakeawayOrder", null);
__decorate([
    (0, common_1.Get)('takeaway/ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Get takeaway orders ready for pickup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns takeaway orders ready for pickup' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getReadyTakeawayOrders", null);
__decorate([
    (0, common_1.Put)('delivery/:orderId/accept'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Kitchen accepts delivery order with estimated prep time' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery order accepted by kitchen' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenAcceptDeliveryOrderDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "acceptDeliveryOrder", null);
__decorate([
    (0, common_1.Put)('delivery/:orderId/preparing'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark delivery order as preparing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery order marked as preparing' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenStartPreparingDeliveryOrderDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "preparingDeliveryOrder", null);
__decorate([
    (0, common_1.Put)('delivery/:orderId/ready'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark delivery order as ready for delivery' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery order marked as ready for delivery' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenMarkReadyDeliveryOrderDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "readyDeliveryOrder", null);
__decorate([
    (0, common_1.Get)('delivery/ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Get delivery orders ready for pickup' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns delivery orders ready for pickup' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getReadyDeliveryOrders", null);
__decorate([
    (0, common_1.Put)('dine-in/:orderId/accept-batch'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Kitchen accepts a dine-in batch' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dine-in batch accepted by kitchen' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.KitchenAcceptBatchDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "acceptDineInBatch", null);
__decorate([
    (0, common_1.Put)('dine-in/:orderId/update-batch-status'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Update dine-in batch status (preparing/ready)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dine-in batch status updated' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.UpdateBatchStatusDto]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "updateDineInBatchStatus", null);
__decorate([
    (0, common_1.Put)('dine-in/:orderId/batch/:batchNumber/preparing'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark dine-in batch as preparing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dine-in batch marked as preparing' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Param)('batchNumber')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "preparingDineInBatch", null);
__decorate([
    (0, common_1.Put)('dine-in/:orderId/batch/:batchNumber/ready'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark dine-in batch as ready' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dine-in batch marked as ready' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Param)('batchNumber')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "readyDineInBatch", null);
__decorate([
    (0, common_1.Put)('dine-in/:orderId/item/:batchNumber/:productId/status'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiOperation)({ summary: 'Update individual item status in dine-in batch' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Item status updated' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Param)('batchNumber')),
    __param(4, (0, common_1.Param)('productId')),
    __param(5, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, String, Object]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "updateDineInItemStatus", null);
__decorate([
    (0, common_1.Get)('dine-in/pending-acceptance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dine-in orders pending kitchen acceptance' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns dine-in orders pending kitchen acceptance' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getPendingDineInOrders", null);
__decorate([
    (0, common_1.Get)('dine-in/accepted'),
    (0, swagger_1.ApiOperation)({ summary: 'Get kitchen-accepted dine-in orders' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns kitchen-accepted dine-in orders' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], KitchenController.prototype, "getAcceptedDineInOrders", null);
exports.KitchenController = KitchenController = __decorate([
    (0, swagger_1.ApiTags)('Kitchen Management'),
    (0, common_1.Controller)('restaurants/:restaurantId/kitchen'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee', 'chef', 'assistant_chef'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [kitchen_service_1.KitchenService])
], KitchenController);
//# sourceMappingURL=kitchen.controller.js.map