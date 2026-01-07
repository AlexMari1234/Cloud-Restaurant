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
exports.DeliveryTakeawayOrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const common_2 = require("@rm/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const kafka_service_1 = require("../../kafka/kafka.service");
const order_schema_1 = require("../schemas/order.schema");
const products_service_1 = require("../../menu/services/products.service");
let DeliveryTakeawayOrdersService = class DeliveryTakeawayOrdersService {
    orderModel;
    kafkaService;
    httpService;
    productsService;
    constructor(orderModel, kafkaService, httpService, productsService) {
        this.orderModel = orderModel;
        this.kafkaService = kafkaService;
        this.httpService = httpService;
        this.productsService = productsService;
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
    async createDeliveryOrder(customerId, createOrderDto) {
        const orderItems = [];
        let totalAmount = 0;
        for (const item of createOrderDto.items) {
            const product = await this.productsService.getProductById(createOrderDto.restaurantId, item.productId);
            const itemPrice = product.price;
            const itemTotal = itemPrice * item.quantity;
            totalAmount += itemTotal;
            orderItems.push({
                productId: new mongoose_2.Types.ObjectId(item.productId),
                quantity: item.quantity,
                price: itemPrice,
                specialInstructions: item.specialInstructions,
                status: 'PENDING',
                sentToKitchenAt: new Date(),
                kitchenAcceptedAt: undefined,
                preparationStartedAt: undefined,
                readyAt: undefined,
                completedAt: undefined,
                chefId: undefined,
            });
        }
        const orderData = {
            restaurantId: new mongoose_2.Types.ObjectId(createOrderDto.restaurantId),
            customerId: new mongoose_2.Types.ObjectId(customerId),
            orderType: 'DELIVERY',
            status: common_2.OrderStatusEnum.PENDING,
            items: orderItems,
            totalAmount,
            customerEmail: createOrderDto.customerEmail,
            customerName: createOrderDto.customerName || 'Customer',
            customerPhone: createOrderDto.customerPhone || '',
            deliveryAddress: createOrderDto.deliveryAddress,
            orderNotes: createOrderDto.orderNotes,
            paymentStatus: 'PENDING',
            kitchenDetails: {
                sentToKitchenAt: new Date()
            },
            deliveryDetails: {}
        };
        const savedOrder = await this.orderModel.create(orderData);
        const event = {
            orderId: savedOrder._id.toString(),
            restaurantId: savedOrder.restaurantId.toString(),
            customerId: savedOrder.customerId.toString(),
            orderType: savedOrder.orderType,
            status: common_2.OrderStatusEnum.PENDING,
            timestamp: new Date(),
            items: savedOrder.items.map(item => ({
                productId: item.productId.toString(),
                quantity: item.quantity,
                price: item.price,
                specialInstructions: item.specialInstructions,
                status: item.status,
            })),
            metadata: {
                deliveryAddress: savedOrder.deliveryAddress,
                customerPhone: savedOrder.customerPhone,
                totalAmount: savedOrder.totalAmount,
            },
        };
        await this.kafkaService.emitDeliveryOrderCreated(event);
        return savedOrder;
    }
    async createTakeawayOrder(customerId, createOrderDto) {
        const orderItems = [];
        let totalAmount = 0;
        for (const item of createOrderDto.items) {
            const product = await this.productsService.getProductById(createOrderDto.restaurantId, item.productId);
            const itemPrice = product.price;
            const itemTotal = itemPrice * item.quantity;
            totalAmount += itemTotal;
            orderItems.push({
                productId: new mongoose_2.Types.ObjectId(item.productId),
                quantity: item.quantity,
                price: itemPrice,
                specialInstructions: item.specialInstructions,
                status: 'PENDING',
                sentToKitchenAt: new Date(),
                kitchenAcceptedAt: undefined,
                preparationStartedAt: undefined,
                readyAt: undefined,
                completedAt: undefined,
                chefId: undefined,
            });
        }
        const orderData = {
            restaurantId: new mongoose_2.Types.ObjectId(createOrderDto.restaurantId),
            customerId: new mongoose_2.Types.ObjectId(customerId),
            orderType: 'TAKEAWAY',
            status: common_2.OrderStatusEnum.PENDING,
            items: orderItems,
            totalAmount,
            customerEmail: createOrderDto.customerEmail,
            customerName: createOrderDto.customerName,
            customerPhone: createOrderDto.customerPhone,
            orderNotes: createOrderDto.orderNotes,
            paymentStatus: 'PENDING',
            kitchenDetails: {
                sentToKitchenAt: new Date()
            },
            takeawayDetails: {
                customerName: createOrderDto.customerName,
                customerPhone: createOrderDto.customerPhone
            }
        };
        const savedOrder = await this.orderModel.create(orderData);
        const event = {
            orderId: savedOrder._id.toString(),
            restaurantId: savedOrder.restaurantId.toString(),
            customerId: savedOrder.customerId.toString(),
            orderType: 'TAKEAWAY',
            status: 'PENDING',
            timestamp: new Date(),
            items: savedOrder.items.map(item => ({
                productId: item.productId.toString(),
                quantity: item.quantity,
                price: item.price,
                specialInstructions: item.specialInstructions,
                status: 'PENDING',
            })),
            metadata: {
                customerPhone: savedOrder.customerPhone,
                customerName: savedOrder.customerName,
                totalAmount: savedOrder.totalAmount,
            },
        };
        await this.kafkaService.emitTakeawayOrderCreatedEvent(event);
        return savedOrder;
    }
    async kitchenAcceptDeliveryOrder(orderId, restaurantId, chefId, body) {
        console.log(`[DeliveryTakeawayOrdersService] kitchenAcceptDeliveryOrder called with orderId: ${orderId}, restaurantId: ${restaurantId}, chefId: ${chefId}`);
        const order = await this.getDeliveryOrderById(orderId, restaurantId);
        console.log(`[DeliveryTakeawayOrdersService] Found order with status: ${order.status}`);
        if (order.status !== common_2.OrderStatusEnum.PENDING) {
            throw new common_1.BadRequestException('Order is not pending kitchen acceptance');
        }
        order.status = common_2.OrderStatusEnum.KITCHEN_ACCEPTED;
        if (!order.kitchenDetails) {
            order.kitchenDetails = {};
        }
        order.kitchenDetails.chefId = new mongoose_2.Types.ObjectId(chefId);
        order.kitchenDetails.acceptedAt = new Date();
        if (body?.estimatedPrepTime) {
            order.kitchenDetails.estimatedPrepTime = body.estimatedPrepTime;
        }
        if (body?.note) {
            order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${body.note}`;
        }
        console.log(`[DeliveryTakeawayOrdersService] Updated order status to: ${order.status}`);
        console.log(`[DeliveryTakeawayOrdersService] Kitchen details:`, order.kitchenDetails);
        order.items.forEach(item => {
            item.status = 'KITCHEN_ACCEPTED';
            item.kitchenAcceptedAt = new Date();
            item.chefId = new mongoose_2.Types.ObjectId(chefId);
        });
        const updatedOrder = await order.save();
        console.log(`[DeliveryTakeawayOrdersService] Order saved successfully with status: ${updatedOrder.status}`);
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: updatedOrder.status,
            timestamp: new Date(),
            metadata: {
                chefId,
                acceptedItems: updatedOrder.items.map(item => item.productId.toString()),
            },
        };
        console.log(`[DeliveryTakeawayOrdersService] Emitting order event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitOrderEvent(event);
        return updatedOrder;
    }
    async kitchenAcceptTakeawayOrder(orderId, restaurantId, chefId, body) {
        console.log(`[DeliveryTakeawayOrdersService] kitchenAcceptTakeawayOrder called with orderId: ${orderId}, restaurantId: ${restaurantId}, chefId: ${chefId}`);
        const order = await this.getTakeawayOrderById(orderId, restaurantId);
        console.log(`[DeliveryTakeawayOrdersService] Found order with status: ${order.status}`);
        if (order.status !== common_2.OrderStatusEnum.PENDING) {
            throw new common_1.BadRequestException('Order is not pending kitchen acceptance');
        }
        order.status = common_2.OrderStatusEnum.KITCHEN_ACCEPTED;
        if (!order.kitchenDetails) {
            order.kitchenDetails = {};
        }
        order.kitchenDetails.chefId = new mongoose_2.Types.ObjectId(chefId);
        order.kitchenDetails.acceptedAt = new Date();
        if (body?.estimatedPrepTime) {
            order.kitchenDetails.estimatedPrepTime = body.estimatedPrepTime;
        }
        if (body?.note) {
            order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${body.note}`;
        }
        console.log(`[DeliveryTakeawayOrdersService] Updated order status to: ${order.status}`);
        console.log(`[DeliveryTakeawayOrdersService] Kitchen details:`, order.kitchenDetails);
        order.items.forEach(item => {
            item.status = 'KITCHEN_ACCEPTED';
            item.kitchenAcceptedAt = new Date();
            item.chefId = new mongoose_2.Types.ObjectId(chefId);
        });
        const updatedOrder = await order.save();
        console.log(`[DeliveryTakeawayOrdersService] Order saved successfully with status: ${updatedOrder.status}`);
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: updatedOrder.status,
            timestamp: new Date(),
            metadata: {
                chefId,
                acceptedItems: updatedOrder.items.map(item => item.productId.toString()),
            },
        };
        console.log(`[DeliveryTakeawayOrdersService] Emitting order event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitOrderEvent(event);
        return updatedOrder;
    }
    async updateDeliveryStatus(orderId, restaurantId, chefId, updateDto) {
        console.log(`[DeliveryTakeawayOrdersService] updateDeliveryStatus called with orderId: ${orderId}, status: ${updateDto.status}`);
        const order = await this.getDeliveryOrderById(orderId, restaurantId);
        const oldStatus = order.status;
        if (updateDto.status === 'PREPARING' && order.status !== 'KITCHEN_ACCEPTED') {
            throw new common_1.BadRequestException(`Cannot start preparing. Order must be kitchen accepted first. Current status: ${order.status}`);
        }
        if (updateDto.status === 'READY_FOR_DELIVERY' && order.status !== 'PREPARING') {
            throw new common_1.BadRequestException(`Cannot mark as ready. Order must be in preparing status first. Current status: ${order.status}`);
        }
        order.status = updateDto.status;
        if (!order.kitchenDetails) {
            order.kitchenDetails = {};
        }
        order.kitchenDetails.chefId = new mongoose_2.Types.ObjectId(chefId);
        switch (updateDto.status) {
            case 'PREPARING':
                order.kitchenDetails.preparationStartedAt = new Date();
                break;
            case 'READY_FOR_DELIVERY':
                order.kitchenDetails.readyAt = new Date();
                break;
        }
        if (updateDto.note) {
            order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${updateDto.note}`;
        }
        if (updateDto.status === 'READY_FOR_DELIVERY') {
            if (!order.deliveryDetails) {
                order.deliveryDetails = {};
            }
            order.deliveryDetails.readyAt = new Date();
            console.log(`[DeliveryTakeawayOrdersService] Updated deliveryDetails.readyAt for order ${orderId}`);
        }
        if (['DRIVER_ACCEPTED', 'IN_DELIVERY', 'DELIVERED'].includes(updateDto.status)) {
            if (!order.deliveryDetails) {
                order.deliveryDetails = {};
            }
            switch (updateDto.status) {
                case 'DRIVER_ACCEPTED':
                    order.deliveryDetails.driverId = new mongoose_2.Types.ObjectId(chefId);
                    order.deliveryDetails.acceptedAt = new Date();
                    break;
                case 'IN_DELIVERY':
                    order.deliveryDetails.pickedUpAt = new Date();
                    break;
                case 'DELIVERED':
                    order.deliveryDetails.deliveredAt = new Date();
                    break;
            }
        }
        order.items.forEach(item => {
            const newItemStatus = this.mapOrderStatusToItemStatus(updateDto.status);
            item.status = newItemStatus;
            item.chefId = new mongoose_2.Types.ObjectId(chefId);
            switch (newItemStatus) {
                case 'PREPARING':
                    item.preparationStartedAt = new Date();
                    break;
                case 'READY':
                    item.readyAt = new Date();
                    console.log(`[DeliveryTakeawayOrdersService] Updated item ${item.productId} readyAt for order ${orderId}`);
                    break;
                case 'DELIVERED':
                    item.completedAt = new Date();
                    break;
            }
        });
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: updatedOrder.status,
            timestamp: new Date(),
            metadata: {
                oldStatus,
                chefId,
                timestamp: new Date(),
            },
        };
        await this.kafkaService.emitOrderEvent(event);
        return updatedOrder;
    }
    async updateTakeawayStatus(orderId, restaurantId, chefId, updateDto) {
        const order = await this.getTakeawayOrderById(orderId, restaurantId);
        const oldStatus = order.status;
        if (updateDto.status === 'PREPARING' && order.status !== 'KITCHEN_ACCEPTED') {
            throw new common_1.BadRequestException(`Cannot start preparing. Order must be kitchen accepted first. Current status: ${order.status}`);
        }
        if (updateDto.status === 'READY' && order.status !== 'PREPARING') {
            throw new common_1.BadRequestException(`Cannot mark as ready. Order must be in preparing status first. Current status: ${order.status}`);
        }
        order.status = updateDto.status;
        if (!order.kitchenDetails) {
            order.kitchenDetails = {};
        }
        order.kitchenDetails.chefId = new mongoose_2.Types.ObjectId(chefId);
        switch (updateDto.status) {
            case 'PREPARING':
                order.kitchenDetails.preparationStartedAt = new Date();
                break;
            case 'READY':
                order.kitchenDetails.readyAt = new Date();
                break;
        }
        if (updateDto.note) {
            order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\n${updateDto.note}`;
        }
        if (updateDto.status === 'READY' && !order.takeawayDetails) {
            order.takeawayDetails = {};
        }
        if (updateDto.status === 'READY' && order.takeawayDetails) {
            order.takeawayDetails.readyAt = new Date();
        }
        order.items.forEach(item => {
            const newItemStatus = this.mapOrderStatusToItemStatus(updateDto.status);
            item.status = newItemStatus;
            item.chefId = new mongoose_2.Types.ObjectId(chefId);
            switch (newItemStatus) {
                case 'PREPARING':
                    item.preparationStartedAt = new Date();
                    break;
                case 'READY':
                    item.readyAt = new Date();
                    break;
                case 'PICKED_UP':
                    item.completedAt = new Date();
                    break;
            }
        });
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: updatedOrder.status,
            timestamp: new Date(),
            metadata: {
                oldStatus,
                chefId,
                timestamp: new Date(),
            },
        };
        await this.kafkaService.emitOrderEvent(event);
        return updatedOrder;
    }
    async completeDeliveryOrder(orderId, restaurantId, driverId) {
        console.log(`[DeliveryTakeawayOrdersService] completeDeliveryOrder called with orderId: ${orderId}, restaurantId: ${restaurantId}, driverId: ${driverId}`);
        const order = await this.getDeliveryOrderById(orderId, restaurantId);
        console.log(`[DeliveryTakeawayOrdersService] Found order with status: ${order.status}`);
        if (order.status !== common_2.OrderStatusEnum.READY_FOR_DELIVERY && order.status !== 'IN_DELIVERY' && order.status !== 'DRIVER_ACCEPTED') {
            throw new common_1.BadRequestException(`Order is not ready for delivery completion. Current status: ${order.status}. Expected: READY_FOR_DELIVERY, DRIVER_ACCEPTED, or IN_DELIVERY`);
        }
        order.status = common_2.OrderStatusEnum.DELIVERED;
        order.paymentStatus = 'COMPLETED';
        if (!order.deliveryDetails) {
            order.deliveryDetails = {};
        }
        if (driverId) {
            order.deliveryDetails.driverId = new mongoose_2.Types.ObjectId(driverId);
        }
        order.deliveryDetails.deliveredAt = new Date();
        console.log(`[DeliveryTakeawayOrdersService] Updated order status to: ${order.status}`);
        console.log(`[DeliveryTakeawayOrdersService] Delivery details:`, order.deliveryDetails);
        order.items.forEach(item => {
            item.status = 'DELIVERED';
            item.completedAt = new Date();
        });
        const updatedOrder = await order.save();
        console.log(`[DeliveryTakeawayOrdersService] Order saved successfully with status: ${updatedOrder.status}`);
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: common_2.OrderStatusEnum.DELIVERED,
            timestamp: new Date(),
            metadata: {
                totalAmount: updatedOrder.totalAmount,
                driverId: driverId,
                deliveredAt: new Date(),
            },
        };
        console.log(`[DeliveryTakeawayOrdersService] Emitting order delivered event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitOrderDelivered(event);
        return updatedOrder;
    }
    async completeTakeawayOrder(orderId, restaurantId, waiterId) {
        console.log(`[DeliveryTakeawayOrdersService] completeTakeawayOrder called with orderId: ${orderId}, restaurantId: ${restaurantId}, waiterId: ${waiterId}`);
        const order = await this.getTakeawayOrderById(orderId, restaurantId);
        console.log(`[DeliveryTakeawayOrdersService] Found order with status: ${order.status}`);
        if (order.status !== common_2.OrderStatusEnum.READY) {
            throw new common_1.BadRequestException('Order is not ready for pickup');
        }
        order.status = common_2.OrderStatusEnum.PICKED_UP;
        order.paymentStatus = 'COMPLETED';
        if (!order.takeawayDetails) {
            order.takeawayDetails = {};
        }
        if (waiterId) {
            order.takeawayDetails.waiterId = new mongoose_2.Types.ObjectId(waiterId);
        }
        order.takeawayDetails.pickedUpAt = new Date();
        console.log(`[DeliveryTakeawayOrdersService] Updated order status to: ${order.status}`);
        console.log(`[DeliveryTakeawayOrdersService] Takeaway details:`, order.takeawayDetails);
        order.items.forEach(item => {
            item.status = 'PICKED_UP';
            item.completedAt = new Date();
        });
        const updatedOrder = await order.save();
        console.log(`[DeliveryTakeawayOrdersService] Order saved successfully with status: ${updatedOrder.status}`);
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: common_2.OrderStatusEnum.PICKED_UP,
            timestamp: new Date(),
            metadata: {
                totalAmount: updatedOrder.totalAmount,
                waiterId: waiterId,
                pickedUpAt: new Date(),
            },
        };
        console.log(`[DeliveryTakeawayOrdersService] Emitting order completed event:`, JSON.stringify(event, null, 2));
        await this.kafkaService.emitOrderCompleted(event);
        return updatedOrder;
    }
    mapOrderStatusToItemStatus(orderStatus) {
        switch (orderStatus) {
            case common_2.OrderStatusEnum.PENDING:
                return 'PENDING';
            case common_2.OrderStatusEnum.KITCHEN_ACCEPTED:
                return 'KITCHEN_ACCEPTED';
            case common_2.OrderStatusEnum.PREPARING:
                return 'PREPARING';
            case common_2.OrderStatusEnum.READY:
                return 'READY';
            case 'READY_FOR_DELIVERY':
                return 'READY';
            case 'OUT_FOR_DELIVERY':
                return 'READY';
            case common_2.OrderStatusEnum.DELIVERED:
                return 'DELIVERED';
            case common_2.OrderStatusEnum.PICKED_UP:
                return 'PICKED_UP';
            default:
                return 'PENDING';
        }
    }
    async getDeliveryOrderById(orderId, restaurantId) {
        const query = {
            _id: new mongoose_2.Types.ObjectId(orderId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'DELIVERY'
        };
        const order = await this.orderModel.findOne(query).exec();
        if (!order) {
            throw new common_1.NotFoundException(`Delivery order with id ${orderId} not found`);
        }
        if (!order.items) {
            throw new common_1.BadRequestException('This is not a valid delivery order (missing items)');
        }
        return order;
    }
    async getTakeawayOrderById(orderId, restaurantId) {
        const query = {
            _id: new mongoose_2.Types.ObjectId(orderId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'TAKEAWAY'
        };
        const order = await this.orderModel.findOne(query).exec();
        if (!order) {
            throw new common_1.NotFoundException(`Takeaway order with id ${orderId} not found`);
        }
        if (!order.items) {
            throw new common_1.BadRequestException('This is not a valid takeaway order (missing items)');
        }
        return order;
    }
    async getActiveDeliveryOrders(restaurantId) {
        return this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'DELIVERY',
            status: { $in: [
                    common_2.OrderStatusEnum.PENDING,
                    common_2.OrderStatusEnum.KITCHEN_ACCEPTED,
                    common_2.OrderStatusEnum.PREPARING,
                    common_2.OrderStatusEnum.READY,
                    'OUT_FOR_DELIVERY'
                ] },
        }).exec();
    }
    async getActiveTakeawayOrders(restaurantId) {
        return this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'TAKEAWAY',
            status: { $in: [
                    common_2.OrderStatusEnum.PENDING,
                    common_2.OrderStatusEnum.KITCHEN_ACCEPTED,
                    common_2.OrderStatusEnum.PREPARING,
                    common_2.OrderStatusEnum.READY
                ] },
        }).exec();
    }
    async getOrdersReadyForDelivery(restaurantId) {
        return this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'DELIVERY',
            status: common_2.OrderStatusEnum.READY,
        }).exec();
    }
    async getOrdersReadyForPickup(restaurantId) {
        return this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'TAKEAWAY',
            status: common_2.OrderStatusEnum.READY,
        }).exec();
    }
};
exports.DeliveryTakeawayOrdersService = DeliveryTakeawayOrdersService;
exports.DeliveryTakeawayOrdersService = DeliveryTakeawayOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        kafka_service_1.KafkaService,
        axios_1.HttpService,
        products_service_1.ProductsService])
], DeliveryTakeawayOrdersService);
//# sourceMappingURL=delivery-takeaway-orders.service.js.map