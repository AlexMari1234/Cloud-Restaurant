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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const common_2 = require("@rm/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const kafka_service_1 = require("../../kafka/kafka.service");
const cart_service_1 = require("./cart.service");
const dine_in_orders_service_1 = require("./dine-in-orders.service");
const delivery_takeaway_orders_service_1 = require("./delivery-takeaway-orders.service");
const order_schema_1 = require("../schemas/order.schema");
const products_service_1 = require("../../menu/services/products.service");
let OrdersService = class OrdersService {
    orderModel;
    kafkaService;
    cartService;
    httpService;
    productsService;
    dineInOrdersService;
    deliveryTakeawayOrdersService;
    constructor(orderModel, kafkaService, cartService, httpService, productsService, dineInOrdersService, deliveryTakeawayOrdersService) {
        this.orderModel = orderModel;
        this.kafkaService = kafkaService;
        this.cartService = cartService;
        this.httpService = httpService;
        this.productsService = productsService;
        this.dineInOrdersService = dineInOrdersService;
        this.deliveryTakeawayOrdersService = deliveryTakeawayOrdersService;
    }
    async getUserIdFromEmail(email) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post('http://auth-service:3000/auth/user-by-email', { email }));
            return response.data.userId;
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid customer email');
        }
    }
    async createOrderFromCart(userId, userEmail, restaurantId, createOrderDto) {
        const cart = await this.cartService.getCart(userId, restaurantId);
        if (!cart || cart.items.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        if (cart.orderType === 'DELIVERY') {
            const deliveryOrder = await this.deliveryTakeawayOrdersService.createDeliveryOrder(userId, {
                restaurantId,
                items: cart.items.map(item => ({
                    productId: item.productId.toString(),
                    quantity: item.quantity,
                    specialInstructions: item.specialInstructions,
                })),
                customerEmail: createOrderDto.customerEmail || userEmail,
                customerName: cart.takeawayName || 'Customer',
                customerPhone: cart.takeawayPhone || '',
                deliveryAddress: cart.deliveryAddress,
                orderNotes: createOrderDto.orderNotes,
            });
            await this.cartService.clearCart(userId, restaurantId);
            return deliveryOrder;
        }
        else if (cart.orderType === 'TAKEAWAY') {
            const takeawayOrder = await this.deliveryTakeawayOrdersService.createTakeawayOrder(userId, {
                restaurantId,
                items: cart.items.map(item => ({
                    productId: item.productId.toString(),
                    quantity: item.quantity,
                    specialInstructions: item.specialInstructions,
                })),
                customerEmail: createOrderDto.customerEmail || userEmail,
                customerName: cart.takeawayName || 'Customer',
                customerPhone: cart.takeawayPhone || '',
                orderNotes: createOrderDto.orderNotes,
            });
            await this.cartService.clearCart(userId, restaurantId);
            return takeawayOrder;
        }
        else {
            const order = new this.orderModel({
                customerId: new mongoose_2.Types.ObjectId(userId),
                restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
                items: cart.items,
                orderType: cart.orderType || 'DINE_IN',
                tableNumber: cart.tableNumber,
                deliveryAddress: cart.deliveryAddress,
                takeawayPhone: cart.takeawayPhone,
                takeawayName: cart.takeawayName,
                totalAmount: cart.totalAmount,
                status: common_2.OrderStatusEnum.PENDING,
                customerEmail: createOrderDto.customerEmail || userEmail,
                orderNotes: createOrderDto.orderNotes,
                createdAt: new Date(),
            });
            const savedOrder = await order.save();
            await this.cartService.clearCart(userId, restaurantId);
            const event = {
                orderId: savedOrder._id.toString(),
                restaurantId: savedOrder.restaurantId.toString(),
                customerId: savedOrder.customerId.toString(),
                orderType: savedOrder.orderType,
                status: savedOrder.status,
                timestamp: new Date(),
                metadata: {
                    deliveryAddress: savedOrder.deliveryAddress,
                    tableNumber: savedOrder.tableNumber,
                },
            };
            await this.kafkaService.emitOrderEvent(event);
            return savedOrder;
        }
    }
    async getUserOrders(userId, restaurantId, filters) {
        const query = {
            customerId: new mongoose_2.Types.ObjectId(userId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId)
        };
        if (filters.status) {
            query.status = filters.status;
        }
        const skip = (filters.page - 1) * filters.limit;
        const [orders, total] = await Promise.all([
            this.orderModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(filters.limit)
                .exec(),
            this.orderModel.countDocuments(query),
        ]);
        return {
            orders,
            total,
            page: filters.page,
            totalPages: Math.ceil(total / filters.limit),
        };
    }
    async getOrderById(orderId, userId, restaurantId) {
        const query = { _id: new mongoose_2.Types.ObjectId(orderId) };
        if (userId)
            query.customerId = new mongoose_2.Types.ObjectId(userId);
        if (restaurantId)
            query.restaurantId = new mongoose_2.Types.ObjectId(restaurantId);
        const order = await this.orderModel.findOne(query).exec();
        if (!order) {
            throw new common_1.NotFoundException(`Order with id ${orderId} not found`);
        }
        return order;
    }
    async cancelOrder(orderId, userId, restaurantId) {
        const order = await this.getOrderById(orderId, userId, restaurantId);
        if (order.status !== common_2.OrderStatusEnum.PENDING) {
            throw new common_1.BadRequestException('Order cannot be cancelled');
        }
        order.status = common_2.OrderStatusEnum.CANCELLED;
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            status: updatedOrder.status,
            timestamp: new Date(),
        };
        await this.kafkaService.emitOrderEvent(event);
        return updatedOrder;
    }
    async getOrderTrackingInfo(orderId, restaurantId) {
        const order = await this.orderModel.findOne({
            _id: new mongoose_2.Types.ObjectId(orderId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId)
        }).exec();
        if (!order) {
            throw new common_1.NotFoundException(`Order with id ${orderId} not found`);
        }
        return {
            orderId: order._id,
            status: order.status,
            orderType: order.orderType,
            estimatedPrepTime: order.kitchenDetails?.estimatedPrepTime,
            estimatedDeliveryTime: order.deliveryDetails?.estimatedDeliveryTime,
            kitchenAcceptedAt: order.kitchenDetails?.acceptedAt,
            preparationStartedAt: order.kitchenDetails?.preparationStartedAt,
            readyAt: order.kitchenDetails?.readyAt || order.takeawayDetails?.readyAt,
            pickedUpAt: order.deliveryDetails?.pickedUpAt || order.takeawayDetails?.pickedUpAt,
            actualDeliveryTime: order.deliveryDetails?.deliveredAt,
            createdAt: order.createdAt,
        };
    }
    async getOrdersForRestaurantManagement(restaurantId, filters) {
        const query = { restaurantId: new mongoose_2.Types.ObjectId(restaurantId) };
        if (filters.status)
            query.status = filters.status;
        if (filters.orderType)
            query.orderType = filters.orderType;
        const skip = (filters.page - 1) * filters.limit;
        const [orders, total] = await Promise.all([
            this.orderModel.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(filters.limit)
                .exec(),
            this.orderModel.countDocuments(query),
        ]);
        return {
            orders,
            total,
            page: filters.page,
            totalPages: Math.ceil(total / filters.limit),
        };
    }
    async updateOrderStatusForManagement(orderId, restaurantId, status, note, metadata) {
        const order = await this.getOrderById(orderId, undefined, restaurantId);
        const oldStatus = order.status;
        order.status = status;
        if (!order.kitchenDetails && (status === common_2.OrderStatusEnum.KITCHEN_ACCEPTED || status === common_2.OrderStatusEnum.PREPARING || status === common_2.OrderStatusEnum.READY)) {
            order.kitchenDetails = {};
        }
        if (!order.deliveryDetails && order.orderType === 'DELIVERY' && (status === common_2.OrderStatusEnum.PICKED_UP || status === common_2.OrderStatusEnum.DELIVERED)) {
            order.deliveryDetails = {};
        }
        if (!order.takeawayDetails && order.orderType === 'TAKEAWAY' && (status === common_2.OrderStatusEnum.READY || status === common_2.OrderStatusEnum.PICKED_UP)) {
            order.takeawayDetails = {};
        }
        if (note) {
            if (order.kitchenDetails) {
                order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${note}`;
            }
        }
        if (metadata?.estimatedPrepTime && order.kitchenDetails) {
            order.kitchenDetails.estimatedPrepTime = metadata.estimatedPrepTime;
        }
        const now = new Date();
        switch (status) {
            case common_2.OrderStatusEnum.KITCHEN_ACCEPTED:
                if (order.kitchenDetails) {
                    order.kitchenDetails.acceptedAt = now;
                }
                break;
            case common_2.OrderStatusEnum.PREPARING:
                if (order.kitchenDetails) {
                    order.kitchenDetails.preparationStartedAt = now;
                }
                break;
            case common_2.OrderStatusEnum.READY:
            case common_2.OrderStatusEnum.READY_FOR_DELIVERY:
            case common_2.OrderStatusEnum.READY_FOR_PICKUP:
                if (order.kitchenDetails) {
                    order.kitchenDetails.readyAt = now;
                }
                else if (order.takeawayDetails) {
                    order.takeawayDetails.readyAt = now;
                }
                break;
            case common_2.OrderStatusEnum.SERVED:
                break;
            case common_2.OrderStatusEnum.PICKED_UP:
                if (order.deliveryDetails) {
                    order.deliveryDetails.pickedUpAt = now;
                }
                else if (order.takeawayDetails) {
                    order.takeawayDetails.pickedUpAt = now;
                }
                break;
            case common_2.OrderStatusEnum.DELIVERED:
                if (order.deliveryDetails) {
                    order.deliveryDetails.deliveredAt = now;
                }
                break;
        }
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            status: updatedOrder.status,
            timestamp: new Date(),
            metadata: {
                oldStatus,
                note,
                ...metadata,
            },
        };
        await this.kafkaService.emitOrderEvent(event);
        return updatedOrder;
    }
    async createEnhancedDineInOrder(waiterId, waiterEmail, restaurantId, createOrderDto) {
        return this.dineInOrdersService.createDineInOrder(waiterId, waiterEmail, restaurantId, createOrderDto);
    }
    async sendBatchToKitchen(orderId, restaurantId, waiterId, batchDto) {
        return this.dineInOrdersService.sendBatchToKitchen(orderId, restaurantId, waiterId, batchDto);
    }
    async kitchenAcceptBatch(orderId, restaurantId, chefId, batchNumber) {
        return this.dineInOrdersService.kitchenAcceptBatch(orderId, restaurantId, chefId, batchNumber);
    }
    async updateBatchStatus(orderId, restaurantId, chefId, updateDto) {
        return this.dineInOrdersService.updateBatchStatus(orderId, restaurantId, chefId, updateDto);
    }
    async serveBatch(orderId, restaurantId, waiterId, serveDto) {
        return this.dineInOrdersService.serveBatch(orderId, restaurantId, waiterId, serveDto);
    }
    async addBatchToOrder(orderId, restaurantId, waiterId, batchDto) {
        return this.dineInOrdersService.addBatchToOrder(orderId, restaurantId, waiterId, batchDto);
    }
    async requestPayment(orderId, restaurantId, waiterId, requestDto) {
        return this.dineInOrdersService.requestPayment(orderId, restaurantId, waiterId, requestDto);
    }
    async completePayment(orderId, restaurantId, waiterId, paymentDto) {
        return this.dineInOrdersService.completePayment(orderId, restaurantId, waiterId, paymentDto);
    }
    async getActiveDineInOrders(restaurantId) {
        return this.dineInOrdersService.getActiveDineInOrders(restaurantId);
    }
    async getOrdersReadyForService(restaurantId) {
        return this.dineInOrdersService.getOrdersReadyForService(restaurantId);
    }
    async createDeliveryOrder(customerId, createOrderDto) {
        return this.deliveryTakeawayOrdersService.createDeliveryOrder(customerId, createOrderDto);
    }
    async createTakeawayOrder(customerId, createOrderDto) {
        return this.deliveryTakeawayOrdersService.createTakeawayOrder(customerId, createOrderDto);
    }
    async kitchenAcceptDeliveryOrder(orderId, restaurantId, chefId, body) {
        return this.deliveryTakeawayOrdersService.kitchenAcceptDeliveryOrder(orderId, restaurantId, chefId, body);
    }
    async kitchenAcceptTakeawayOrder(orderId, restaurantId, chefId, body) {
        return this.deliveryTakeawayOrdersService.kitchenAcceptTakeawayOrder(orderId, restaurantId, chefId, body);
    }
    async updateDeliveryStatus(orderId, restaurantId, chefId, updateDto) {
        return this.deliveryTakeawayOrdersService.updateDeliveryStatus(orderId, restaurantId, chefId, updateDto);
    }
    async updateTakeawayStatus(orderId, restaurantId, chefId, updateDto) {
        return this.deliveryTakeawayOrdersService.updateTakeawayStatus(orderId, restaurantId, chefId, updateDto);
    }
    async completeDeliveryOrder(orderId, restaurantId, driverId) {
        return this.deliveryTakeawayOrdersService.completeDeliveryOrder(orderId, restaurantId, driverId);
    }
    async completeTakeawayOrder(orderId, restaurantId, waiterId) {
        return this.deliveryTakeawayOrdersService.completeTakeawayOrder(orderId, restaurantId, waiterId);
    }
    async getActiveDeliveryOrders(restaurantId) {
        return this.deliveryTakeawayOrdersService.getActiveDeliveryOrders(restaurantId);
    }
    async getActiveTakeawayOrders(restaurantId) {
        return this.deliveryTakeawayOrdersService.getActiveTakeawayOrders(restaurantId);
    }
    async getOrdersReadyForDelivery(restaurantId) {
        return this.deliveryTakeawayOrdersService.getOrdersReadyForDelivery(restaurantId);
    }
    async getOrdersReadyForPickup(restaurantId) {
        return this.deliveryTakeawayOrdersService.getOrdersReadyForPickup(restaurantId);
    }
    async updateItemStatus(orderId, restaurantId, batchNumber, productId, chefId, status) {
        return this.dineInOrdersService.updateItemStatus(orderId, restaurantId, batchNumber, productId, chefId, status);
    }
    async batchPreparing(orderId, restaurantId, batchNumber, chefId, note) {
        return this.dineInOrdersService.batchPreparing(orderId, restaurantId, batchNumber, chefId, note);
    }
    async batchReady(orderId, restaurantId, batchNumber, chefId, note) {
        return this.dineInOrdersService.batchReady(orderId, restaurantId, batchNumber, chefId, note);
    }
    async getPendingDineInOrdersForKitchen(restaurantId) {
        return this.dineInOrdersService.getPendingDineInOrdersForKitchen(restaurantId);
    }
    async getAcceptedDineInOrdersForKitchen(restaurantId) {
        return this.dineInOrdersService.getAcceptedDineInOrdersForKitchen(restaurantId);
    }
    async getCurrentOrdersForWaiter(restaurantId) {
        return this.dineInOrdersService.getCurrentOrdersForWaiter(restaurantId);
    }
    async getCompletedOrdersForWaiter(restaurantId) {
        return this.dineInOrdersService.getCompletedOrdersForWaiter(restaurantId);
    }
    async getReadyBatchesForWaiter(restaurantId) {
        return this.dineInOrdersService.getReadyBatchesForWaiter(restaurantId);
    }
    async pickupTakeawayOrder(restaurantId, orderId, customerId, body) {
        return this.deliveryTakeawayOrdersService.completeTakeawayOrder(orderId, restaurantId, undefined);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        kafka_service_1.KafkaService,
        cart_service_1.CartService,
        axios_1.HttpService,
        products_service_1.ProductsService,
        dine_in_orders_service_1.DineInOrdersService,
        delivery_takeaway_orders_service_1.DeliveryTakeawayOrdersService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map