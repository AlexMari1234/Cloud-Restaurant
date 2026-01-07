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
exports.DriverController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const restaurant_roles_guard_1 = require("../../auth/guards/restaurant-roles.guard");
const restaurant_roles_decorator_1 = require("../../auth/decorators/restaurant-roles.decorator");
const driver_service_1 = require("../services/driver.service");
const common_2 = require("@rm/common");
let DriverController = class DriverController {
    driverService;
    constructor(driverService) {
        this.driverService = driverService;
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
    async getReadyOrders(req, restaurantId) {
        const token = this.extractToken(req);
        return this.driverService.getReadyOrders(restaurantId, token);
    }
    async acceptDelivery(req, restaurantId, orderId, body) {
        return this.driverService.acceptDelivery(restaurantId, orderId, req.user._id, body);
    }
    async pickupDeliveryOrder(req, restaurantId, orderId, body) {
        return this.driverService.pickupDeliveryOrder(restaurantId, orderId, req.user._id, body);
    }
    async deliverOrder(req, restaurantId, orderId) {
        const token = this.extractToken(req);
        return this.driverService.deliverOrder(restaurantId, orderId, req.user._id, token);
    }
    async getAssignedOrders(req, restaurantId) {
        const token = this.extractToken(req);
        return this.driverService.getAssignedOrders(restaurantId, token);
    }
};
exports.DriverController = DriverController;
__decorate([
    (0, common_1.Get)('orders/ready'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders ready for delivery' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns orders ready for delivery' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "getReadyOrders", null);
__decorate([
    (0, common_1.Put)('orders/:orderId/accept'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'driver'),
    (0, swagger_1.ApiOperation)({ summary: 'Driver accepts delivery order' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order accepted by driver' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.DriverAcceptDto]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "acceptDelivery", null);
__decorate([
    (0, common_1.Put)(':orderId/pickup'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'driver'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark delivery order as picked up' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delivery order marked as picked up' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.DriverPickupDto]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "pickupDeliveryOrder", null);
__decorate([
    (0, common_1.Put)('orders/:orderId/deliver'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'driver'),
    (0, swagger_1.ApiOperation)({ summary: 'Driver delivers order to customer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order delivered successfully' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "deliverOrder", null);
__decorate([
    (0, common_1.Get)('orders/assigned'),
    (0, swagger_1.ApiOperation)({ summary: 'Get orders assigned to current driver' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns assigned orders for driver' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DriverController.prototype, "getAssignedOrders", null);
exports.DriverController = DriverController = __decorate([
    (0, swagger_1.ApiTags)('Driver Management'),
    (0, common_1.Controller)('restaurants/:restaurantId/delivery'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee', 'driver'),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [driver_service_1.DriverService])
], DriverController);
//# sourceMappingURL=driver.controller.js.map