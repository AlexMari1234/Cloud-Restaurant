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
var DineInOrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DineInOrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const common_2 = require("@rm/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const kafka_service_1 = require("../../kafka/kafka.service");
const order_schema_1 = require("../schemas/order.schema");
const products_service_1 = require("../../menu/services/products.service");
let DineInOrdersService = DineInOrdersService_1 = class DineInOrdersService {
    orderModel;
    kafkaService;
    httpService;
    productsService;
    logger = new common_1.Logger(DineInOrdersService_1.name);
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
    async createDineInOrder(waiterId, waiterEmail, restaurantId, createOrderDto) {
        const customerId = await this.getUserIdFromEmail(createOrderDto.customerEmail);
        const orderBatches = [];
        let totalAmount = 0;
        for (let batchIndex = 0; batchIndex < createOrderDto.batches.length; batchIndex++) {
            const batch = createOrderDto.batches[batchIndex];
            const batchItems = [];
            for (const item of batch.items) {
                const product = await this.productsService.getProductById(restaurantId, item.productId);
                const itemPrice = product.price;
                const itemTotal = itemPrice * item.quantity;
                totalAmount += itemTotal;
                batchItems.push({
                    productId: new mongoose_2.Types.ObjectId(item.productId),
                    quantity: item.quantity,
                    price: itemPrice,
                    specialInstructions: item.specialInstructions,
                    itemStatus: 'PENDING',
                    sentToKitchenAt: undefined,
                    kitchenAcceptedAt: undefined,
                    preparationStartedAt: undefined,
                    readyAt: undefined,
                    servedAt: undefined,
                    chefId: undefined,
                });
            }
            orderBatches.push({
                batchNumber: batchIndex + 1,
                items: batchItems,
                batchStatus: 'PENDING',
                batchNote: batch.batchNote,
                sentToKitchenAt: undefined,
                kitchenAcceptedAt: undefined,
                allItemsReadyAt: undefined,
                allItemsServedAt: undefined,
                chefId: undefined,
            });
        }
        const orderData = {
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            customerId: new mongoose_2.Types.ObjectId(customerId),
            orderType: 'DINE_IN',
            status: common_2.OrderStatusEnum.DRAFT,
            tableNumber: createOrderDto.tableNumber,
            batches: orderBatches,
            totalAmount,
            customerEmail: createOrderDto.customerEmail,
            customerName: createOrderDto.customerName,
            orderNotes: createOrderDto.orderNotes,
            waiterId: new mongoose_2.Types.ObjectId(waiterId),
            paymentStatus: 'PENDING',
        };
        const savedOrder = await this.orderModel.create(orderData);
        const event = {
            orderId: savedOrder._id.toString(),
            restaurantId: savedOrder.restaurantId.toString(),
            customerId: savedOrder.customerId.toString(),
            orderType: savedOrder.orderType,
            status: common_2.OrderStatusEnum.DRAFT,
            timestamp: new Date(),
            batches: savedOrder.batches.map(batch => ({
                batchNumber: batch.batchNumber,
                batchStatus: batch.batchStatus,
                batchNote: batch.batchNote,
                items: batch.items.map(item => ({
                    productId: item.productId.toString(),
                    quantity: item.quantity,
                    price: item.price,
                    specialInstructions: item.specialInstructions,
                    itemStatus: item.itemStatus,
                })),
            })),
            metadata: {
                tableNumber: savedOrder.tableNumber,
                waiterId: waiterId,
                customerEmail: savedOrder.customerEmail,
            },
        };
        await this.kafkaService.emitDineInCreated(event);
        return savedOrder;
    }
    async sendBatchToKitchen(orderId, restaurantId, waiterId, batchDto) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        const batch = order.batches.find(b => b.batchNumber === batchDto.batchNumber);
        if (!batch) {
            throw new common_1.BadRequestException(`Batch ${batchDto.batchNumber} not found`);
        }
        if (batch.batchStatus !== 'PENDING') {
            throw new common_1.BadRequestException(`Batch ${batchDto.batchNumber} has already been sent to kitchen`);
        }
        batch.batchStatus = 'SENT_TO_KITCHEN';
        batch.sentToKitchenAt = new Date();
        const sentItems = [];
        batch.items.forEach(item => {
            item.itemStatus = 'SENT_TO_KITCHEN';
            item.sentToKitchenAt = new Date();
            sentItems.push(item.productId.toString());
        });
        const hasPendingBatches = order.batches.some(b => b.batchStatus === 'PENDING');
        order.status = hasPendingBatches ? common_2.OrderStatusEnum.PARTIAL_KITCHEN : common_2.OrderStatusEnum.PARTIAL_KITCHEN;
        if (batchDto.kitchenNote) {
            if (!order.kitchenDetails) {
                order.kitchenDetails = {};
            }
            order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\nBatch ${batchDto.batchNumber}: ${batchDto.kitchenNote}`;
        }
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: common_2.OrderStatusEnum.PARTIAL_KITCHEN,
            timestamp: new Date(),
            metadata: {
                batchNumber: batchDto.batchNumber,
                itemIds: sentItems,
                sentAt: new Date(),
            },
        };
        await this.kafkaService.emitBatchSentToKitchen(event);
        return updatedOrder;
    }
    async kitchenAcceptBatch(orderId, restaurantId, chefId, batchNumber) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        const batch = order.batches.find(b => b.batchNumber === batchNumber);
        if (!batch) {
            throw new common_1.BadRequestException(`Batch ${batchNumber} not found`);
        }
        if (batch.batchStatus !== 'SENT_TO_KITCHEN') {
            throw new common_1.BadRequestException(`Batch ${batchNumber} is not awaiting kitchen acceptance`);
        }
        batch.batchStatus = 'KITCHEN_ACCEPTED';
        batch.kitchenAcceptedAt = new Date();
        batch.chefId = new mongoose_2.Types.ObjectId(chefId);
        const acceptedItems = [];
        batch.items.forEach(item => {
            item.itemStatus = 'KITCHEN_ACCEPTED';
            item.kitchenAcceptedAt = new Date();
            item.chefId = new mongoose_2.Types.ObjectId(chefId);
            acceptedItems.push(item.productId.toString());
        });
        const hasUnacceptedBatches = order.batches.some(b => b.batchStatus === 'PENDING' || b.batchStatus === 'SENT_TO_KITCHEN');
        if (!hasUnacceptedBatches) {
            order.status = common_2.OrderStatusEnum.KITCHEN_ACCEPTED;
        }
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: updatedOrder.status,
            timestamp: new Date(),
            metadata: {
                batchNumber,
                acceptedItems,
                chefId,
            },
        };
        await this.kafkaService.emitOrderEvent(event);
        return updatedOrder;
    }
    async updateBatchStatus(orderId, restaurantId, chefId, updateDto) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        const batchNum = Number(updateDto.batchNumber);
        const batch = order.batches.find(b => b.batchNumber === batchNum);
        if (!batch) {
            throw new common_1.BadRequestException(`Batch ${updateDto.batchNumber} not found`);
        }
        const oldStatus = batch.batchStatus;
        batch.batchStatus = updateDto.batchStatus;
        batch.chefId = new mongoose_2.Types.ObjectId(chefId);
        if (Array.isArray(updateDto.itemStatuses) && updateDto.itemStatuses.length > 0) {
            for (const itemStatusUpdate of updateDto.itemStatuses) {
                const item = batch.items.find(i => i.productId.toString() === itemStatusUpdate.productId);
                if (item) {
                    item.itemStatus = common_2.ItemStatusEnum[itemStatusUpdate.status];
                    item.chefId = new mongoose_2.Types.ObjectId(chefId);
                    switch (itemStatusUpdate.status) {
                        case 'PREPARING':
                            item.preparationStartedAt = new Date();
                            break;
                        case 'READY':
                            item.readyAt = new Date();
                            break;
                    }
                }
            }
        }
        else {
            batch.items.forEach(item => {
                item.itemStatus = updateDto.batchStatus;
                item.chefId = new mongoose_2.Types.ObjectId(chefId);
                switch (updateDto.batchStatus) {
                    case 'PREPARING':
                        item.preparationStartedAt = new Date();
                        break;
                    case 'READY':
                        item.readyAt = new Date();
                        break;
                }
            });
        }
        switch (updateDto.batchStatus) {
            case 'READY':
                batch.allItemsReadyAt = new Date();
                break;
        }
        const allBatchesReady = order.batches.every(b => b.batchStatus === 'READY' || b.batchStatus === 'SERVED');
        if (allBatchesReady && order.status !== common_2.OrderStatusEnum.ALL_READY) {
            order.status = common_2.OrderStatusEnum.ALL_READY;
        }
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: updatedOrder.status,
            timestamp: new Date(),
            metadata: {
                batchNumber: updateDto.batchNumber,
                oldStatus: oldStatus,
                newStatus: updateDto.batchStatus,
                chefId: chefId,
                timestamp: new Date(),
            },
        };
        await this.kafkaService.emitOrderEvent(event);
        return updatedOrder;
    }
    async serveBatch(orderId, restaurantId, waiterId, serveDto) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        const batchNum = Number(serveDto.batchNumber);
        const batch = order.batches.find(b => b.batchNumber === batchNum);
        if (!batch) {
            throw new common_1.BadRequestException(`Batch ${serveDto.batchNumber} not found`);
        }
        if (batch.batchStatus !== 'READY') {
            throw new common_1.BadRequestException(`Batch ${serveDto.batchNumber} is not ready for service`);
        }
        batch.batchStatus = 'SERVED';
        batch.allItemsServedAt = new Date();
        batch.items.forEach(item => {
            item.itemStatus = 'SERVED';
            item.servedAt = new Date();
        });
        if (serveDto.note) {
            order.waiterNotes = (order.waiterNotes || '') + `\nServed Batch ${serveDto.batchNumber}: ${serveDto.note}`;
        }
        const allBatchesServed = order.batches.every(b => b.batchStatus === 'SERVED');
        if (allBatchesServed) {
            order.status = 'SERVED';
        }
        else {
            order.status = 'PARTIAL_SERVED';
        }
        order.updatedAt = new Date();
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: updatedOrder.status,
            timestamp: new Date(),
            metadata: {
                batchNumber: serveDto.batchNumber,
                servedAt: new Date(),
                waiterId: waiterId,
            },
        };
        await this.kafkaService.emitOrderEvent(event);
        return updatedOrder;
    }
    async addBatchToOrder(orderId, restaurantId, waiterId, batchDto) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        const nextBatchNumber = Math.max(...order.batches.map(b => b.batchNumber)) + 1;
        const batchItems = [];
        let batchTotal = 0;
        for (const item of batchDto.items) {
            const product = await this.productsService.getProductById(restaurantId, item.productId);
            const itemPrice = product.price;
            const itemTotal = itemPrice * item.quantity;
            batchTotal += itemTotal;
            batchItems.push({
                productId: new mongoose_2.Types.ObjectId(item.productId),
                quantity: item.quantity,
                price: itemPrice,
                specialInstructions: item.specialInstructions,
                itemStatus: 'PENDING',
                sentToKitchenAt: undefined,
                kitchenAcceptedAt: undefined,
                preparationStartedAt: undefined,
                readyAt: undefined,
                servedAt: undefined,
                chefId: undefined,
            });
        }
        const newBatch = {
            batchNumber: nextBatchNumber,
            items: batchItems,
            batchStatus: batchDto.sendToKitchen ? 'SENT_TO_KITCHEN' : 'PENDING',
            batchNote: batchDto.batchNote,
            sentToKitchenAt: batchDto.sendToKitchen ? new Date() : undefined,
            kitchenAcceptedAt: undefined,
            allItemsReadyAt: undefined,
            allItemsServedAt: undefined,
            chefId: undefined,
        };
        if (batchDto.sendToKitchen) {
            newBatch.items.forEach(item => {
                item.itemStatus = 'SENT_TO_KITCHEN';
                item.sentToKitchenAt = new Date();
            });
        }
        order.batches.push(newBatch);
        order.totalAmount += batchTotal;
        const updatedOrder = await order.save();
        if (batchDto.sendToKitchen) {
            const event = {
                orderId: updatedOrder._id.toString(),
                restaurantId: updatedOrder.restaurantId.toString(),
                customerId: updatedOrder.customerId.toString(),
                orderType: updatedOrder.orderType,
                status: common_2.OrderStatusEnum.PARTIAL_KITCHEN,
                timestamp: new Date(),
                metadata: {
                    batchNumber: nextBatchNumber,
                    itemIds: batchItems.map(item => item.productId.toString()),
                    sentAt: new Date(),
                },
            };
            await this.kafkaService.emitBatchSentToKitchen(event);
        }
        return updatedOrder;
    }
    async requestPayment(orderId, restaurantId, waiterId, requestDto) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        const allBatchesServed = order.batches.every(b => b.batchStatus === 'SERVED');
        if (!allBatchesServed) {
            throw new common_1.BadRequestException('Cannot request payment until all items are served');
        }
        order.status = common_2.OrderStatusEnum.PAYMENT_REQUESTED;
        order.paymentStatus = 'REQUESTED';
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: common_2.OrderStatusEnum.PAYMENT_REQUESTED,
            timestamp: new Date(),
            metadata: {
                totalAmount: updatedOrder.totalAmount,
                waiterId: waiterId,
                note: requestDto.note,
            },
        };
        await this.kafkaService.emitPaymentRequested(event);
        return updatedOrder;
    }
    async completePayment(orderId, restaurantId, waiterId, paymentDto) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        if (order.status !== common_2.OrderStatusEnum.PAYMENT_REQUESTED) {
            throw new common_1.BadRequestException('Payment has not been requested for this order');
        }
        order.status = common_2.OrderStatusEnum.DINE_IN_COMPLETED;
        order.paymentStatus = 'COMPLETED';
        order.paymentMethod = paymentDto.paymentMethod;
        order.amountPaid = paymentDto.amountPaid;
        if (paymentDto.note) {
            order.waiterNotes = (order.waiterNotes || '') + `\nPayment completed: ${paymentDto.note}`;
        }
        order.updatedAt = new Date();
        const updatedOrder = await order.save();
        const event = {
            orderId: updatedOrder._id.toString(),
            restaurantId: updatedOrder.restaurantId.toString(),
            customerId: updatedOrder.customerId.toString(),
            orderType: updatedOrder.orderType,
            status: common_2.OrderStatusEnum.DINE_IN_COMPLETED,
            timestamp: new Date(),
            metadata: {
                totalAmount: updatedOrder.totalAmount,
                paymentMethod: paymentDto.paymentMethod,
                amountPaid: paymentDto.amountPaid,
                waiterId: waiterId,
                completedAt: new Date(),
            },
        };
        await this.kafkaService.emitDineInCompleted(event);
        return updatedOrder;
    }
    async getDineInOrderById(orderId, restaurantId) {
        const query = {
            _id: new mongoose_2.Types.ObjectId(orderId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'DINE_IN'
        };
        const order = await this.orderModel.findOne(query).exec();
        if (!order) {
            throw new common_1.NotFoundException(`Dine-in order with id ${orderId} not found`);
        }
        if (!order.batches) {
            throw new common_1.BadRequestException('This is not a valid dine-in order (missing batches)');
        }
        return order;
    }
    async getActiveDineInOrders(restaurantId) {
        return this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'DINE_IN',
            status: { $in: [
                    common_2.OrderStatusEnum.DRAFT,
                    common_2.OrderStatusEnum.PARTIAL_KITCHEN,
                    common_2.OrderStatusEnum.KITCHEN_ACCEPTED,
                    common_2.OrderStatusEnum.PREPARING,
                    common_2.OrderStatusEnum.ALL_READY,
                    common_2.OrderStatusEnum.PARTIAL_SERVED
                ] },
        }).exec();
    }
    async getOrdersReadyForService(restaurantId) {
        return this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'DINE_IN',
            'batches.batchStatus': 'READY',
        }).exec();
    }
    async updateItemStatus(orderId, restaurantId, batchNumber, productId, chefId, status) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        const batchNum = Number(batchNumber);
        const batch = order.batches.find(b => b.batchNumber === batchNum);
        if (!batch) {
            throw new common_1.BadRequestException(`Batch ${batchNumber} not found`);
        }
        const item = batch.items.find(i => i.productId.toString() === productId);
        if (!item) {
            throw new common_1.BadRequestException(`Item with productId ${productId} not found in batch ${batchNumber}`);
        }
        const allowed = [
            'PENDING', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'SENT_TO_KITCHEN'
        ];
        if (!allowed.includes(status)) {
            throw new common_1.BadRequestException('Invalid item status');
        }
        item.itemStatus = common_2.ItemStatusEnum[status];
        item.chefId = new mongoose_2.Types.ObjectId(chefId);
        switch (status) {
            case 'PREPARING':
                item.preparationStartedAt = new Date();
                break;
            case 'READY':
                item.readyAt = new Date();
                break;
        }
        if (batch.items.every(i => i.itemStatus === 'READY')) {
            batch.batchStatus = 'READY';
            batch.allItemsReadyAt = new Date();
        }
        const updatedOrder = await order.save();
        return updatedOrder;
    }
    async batchPreparing(orderId, restaurantId, batchNumber, chefId, note) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        const batchNum = Number(batchNumber);
        const batch = order.batches.find(b => b.batchNumber === batchNum);
        if (!batch) {
            throw new common_1.BadRequestException(`Batch ${batchNumber} not found`);
        }
        batch.batchStatus = 'PREPARING';
        batch.chefId = new mongoose_2.Types.ObjectId(chefId);
        batch.kitchenAcceptedAt = batch.kitchenAcceptedAt || new Date();
        batch.preparationStartedAt = new Date();
        batch.items.forEach(item => {
            item.itemStatus = 'PREPARING';
            item.chefId = new mongoose_2.Types.ObjectId(chefId);
            item.preparationStartedAt = new Date();
        });
        if (note) {
            if (!order.kitchenDetails) {
                order.kitchenDetails = {};
            }
            order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\nBatch ${batchNumber}: ${note}`;
        }
        if (order.status !== 'PREPARING') {
            order.status = 'PREPARING';
        }
        order.updatedAt = new Date();
        const updatedOrder = await order.save();
        return updatedOrder;
    }
    async batchReady(orderId, restaurantId, batchNumber, chefId, note) {
        const order = await this.getDineInOrderById(orderId, restaurantId);
        const batchNum = Number(batchNumber);
        const batch = order.batches.find(b => b.batchNumber === batchNum);
        if (!batch) {
            throw new common_1.BadRequestException(`Batch ${batchNumber} not found`);
        }
        batch.batchStatus = 'READY';
        batch.chefId = new mongoose_2.Types.ObjectId(chefId);
        batch.allItemsReadyAt = new Date();
        batch.readyAt = new Date();
        batch.items.forEach(item => {
            item.itemStatus = 'READY';
            item.chefId = new mongoose_2.Types.ObjectId(chefId);
            item.readyAt = new Date();
        });
        if (note) {
            if (!order.kitchenDetails) {
                order.kitchenDetails = {};
            }
            order.kitchenDetails.notes = (order.kitchenDetails.notes || '') + `\nBatch ${batchNumber}: ${note}`;
        }
        const allBatchesReady = order.batches.every(b => b.batchStatus === 'READY');
        if (allBatchesReady) {
            order.status = 'ALL_READY';
        }
        order.updatedAt = new Date();
        const updatedOrder = await order.save();
        return updatedOrder;
    }
    async getPendingDineInOrdersForKitchen(restaurantId) {
        const orders = await this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'DINE_IN',
            'batches.batchStatus': 'SENT_TO_KITCHEN'
        }).exec();
        const filteredOrders = orders.filter(order => {
            const hasAcceptedBatches = order.batches?.some(batch => ['KITCHEN_ACCEPTED', 'PREPARING', 'READY'].includes(batch.batchStatus));
            return !hasAcceptedBatches;
        });
        return { orders: filteredOrders };
    }
    async getAcceptedDineInOrdersForKitchen(restaurantId) {
        const orders = await this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'DINE_IN',
            $and: [
                { 'batches.batchStatus': { $in: ['KITCHEN_ACCEPTED', 'PREPARING'] } },
                { 'batches.batchStatus': { $ne: 'READY' } }
            ]
        }).exec();
        return { orders };
    }
    async getCurrentOrdersForWaiter(restaurantId) {
        const orders = await this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            status: {
                $nin: [
                    'COMPLETED',
                    'CANCELLED',
                    'DINE_IN_COMPLETED',
                    'DELIVERED',
                    'PICKED_UP'
                ]
            }
        }).sort({ createdAt: -1 }).exec();
        return { orders };
    }
    async getCompletedOrdersForWaiter(restaurantId) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const orders = await this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            status: {
                $in: [
                    'COMPLETED',
                    'DINE_IN_COMPLETED',
                    'DELIVERED',
                    'PICKED_UP'
                ]
            },
            updatedAt: { $gte: yesterday }
        }).sort({ updatedAt: -1 }).exec();
        return { orders };
    }
    async getReadyBatchesForWaiter(restaurantId) {
        const orders = await this.orderModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            orderType: 'DINE_IN',
            'batches.batchStatus': 'READY'
        }).exec();
        const filteredOrders = orders.filter(order => order.batches?.some(batch => batch.batchStatus === 'READY'));
        return { orders: filteredOrders };
    }
};
exports.DineInOrdersService = DineInOrdersService;
exports.DineInOrdersService = DineInOrdersService = DineInOrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        kafka_service_1.KafkaService,
        axios_1.HttpService,
        products_service_1.ProductsService])
], DineInOrdersService);
//# sourceMappingURL=dine-in-orders.service.js.map