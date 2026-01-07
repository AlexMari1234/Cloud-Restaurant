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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersManagementService = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
let OrdersManagementService = class OrdersManagementService {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async getOrdersByStatus(restaurantId, filters) {
        return this.ordersService.getOrdersForRestaurantManagement(restaurantId, filters);
    }
    async getOrderById(restaurantId, orderId) {
        return this.ordersService.getOrderById(orderId, undefined, restaurantId);
    }
    async updateOrderStatus(restaurantId, orderId, updateData) {
        return this.ordersService.updateOrderStatusForManagement(orderId, restaurantId, updateData.status, updateData.note, updateData.metadata);
    }
    async createEnhancedDineInOrder(restaurantId, waiterId, waiterEmail, createOrderDto) {
        return this.ordersService.createEnhancedDineInOrder(waiterId, waiterEmail, restaurantId, createOrderDto);
    }
    async sendBatchToKitchen(restaurantId, orderId, waiterId, batchDto) {
        return this.ordersService.sendBatchToKitchen(orderId, restaurantId, waiterId, batchDto);
    }
    async kitchenAcceptBatch(restaurantId, orderId, chefId, batchNumber) {
        return this.ordersService.kitchenAcceptBatch(orderId, restaurantId, chefId, batchNumber);
    }
    async updateBatchStatus(restaurantId, orderId, chefId, updateDto) {
        return this.ordersService.updateBatchStatus(orderId, restaurantId, chefId, updateDto);
    }
    async serveBatch(restaurantId, orderId, waiterId, serveDto) {
        return this.ordersService.serveBatch(orderId, restaurantId, waiterId, serveDto);
    }
    async requestPayment(restaurantId, orderId, waiterId, requestDto) {
        return this.ordersService.requestPayment(orderId, restaurantId, waiterId, requestDto);
    }
    async completePayment(restaurantId, orderId, waiterId, paymentDto) {
        return this.ordersService.completePayment(orderId, restaurantId, waiterId, paymentDto);
    }
    async addBatchToOrder(restaurantId, orderId, waiterId, batchDto) {
        return this.ordersService.addBatchToOrder(orderId, restaurantId, waiterId, batchDto);
    }
    async getDineInOrdersByStatus(restaurantId, filters) {
        const dineInFilters = {
            ...filters,
            orderType: 'DINE_IN'
        };
        return this.ordersService.getOrdersForRestaurantManagement(restaurantId, dineInFilters);
    }
    async getOrdersReadyForService(restaurantId) {
        return this.getDineInOrdersByStatus(restaurantId, {
            status: 'ALL_READY',
            page: 1,
            limit: 50,
            includeItemStatus: true,
        });
    }
    async getActiveDineInOrders(restaurantId) {
        return this.ordersService.getOrdersForRestaurantManagement(restaurantId, {
            orderType: 'DINE_IN',
            page: 1,
            limit: 100,
        });
    }
    async getOrdersPendingKitchenAcceptance(restaurantId) {
        return this.getDineInOrdersByStatus(restaurantId, {
            status: 'PARTIAL_KITCHEN',
            page: 1,
            limit: 50,
            includeItemStatus: true
        });
    }
    async getKitchenAcceptedOrders(restaurantId) {
        return this.getDineInOrdersByStatus(restaurantId, {
            status: 'KITCHEN_ACCEPTED',
            page: 1,
            limit: 50,
            includeItemStatus: true
        });
    }
    async updateItemStatus(restaurantId, orderId, batchNumber, productId, chefId, status) {
        return this.ordersService.updateItemStatus(orderId, restaurantId, batchNumber, productId, chefId, status);
    }
    async batchPreparing(restaurantId, orderId, batchNumber, chefId, note) {
        return this.ordersService.batchPreparing(orderId, restaurantId, batchNumber, chefId, note);
    }
    async batchReady(restaurantId, orderId, batchNumber, chefId, note) {
        return this.ordersService.batchReady(orderId, restaurantId, batchNumber, chefId, note);
    }
    async getPendingDineInOrdersForKitchen(restaurantId) {
        return this.ordersService.getPendingDineInOrdersForKitchen(restaurantId);
    }
    async getAcceptedDineInOrdersForKitchen(restaurantId) {
        return this.ordersService.getAcceptedDineInOrdersForKitchen(restaurantId);
    }
    async getCurrentOrdersForWaiter(restaurantId) {
        return this.ordersService.getCurrentOrdersForWaiter(restaurantId);
    }
    async getCompletedOrdersForWaiter(restaurantId) {
        return this.ordersService.getCompletedOrdersForWaiter(restaurantId);
    }
    async getReadyBatchesForWaiter(restaurantId) {
        return this.ordersService.getReadyBatchesForWaiter(restaurantId);
    }
    async getReadyTakeawayOrders(restaurantId) {
        return this.ordersService.getOrdersForRestaurantManagement(restaurantId, {
            orderType: 'TAKEAWAY',
            status: 'READY_FOR_PICKUP',
            page: 1,
            limit: 50,
        });
    }
    async getReadyDeliveryOrders(restaurantId) {
        return this.ordersService.getOrdersForRestaurantManagement(restaurantId, {
            orderType: 'DELIVERY',
            status: 'READY_FOR_DELIVERY',
            page: 1,
            limit: 50,
        });
    }
    async getAssignedDeliveryOrders(restaurantId) {
        const orders = await this.ordersService.getOrdersForRestaurantManagement(restaurantId, {
            orderType: 'DELIVERY',
            page: 1,
            limit: 100,
        });
        const assignedOrders = orders.orders.filter(order => order.status === 'DRIVER_ACCEPTED' || order.status === 'IN_DELIVERY');
        return {
            orders: assignedOrders,
            total: assignedOrders.length,
            page: 1,
            totalPages: 1,
        };
    }
};
exports.OrdersManagementService = OrdersManagementService;
exports.OrdersManagementService = OrdersManagementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersManagementService);
//# sourceMappingURL=orders-management.service.js.map