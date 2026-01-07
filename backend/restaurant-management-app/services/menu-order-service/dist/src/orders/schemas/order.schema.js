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
exports.OrderSchema = exports.Order = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const common_1 = require("@rm/common");
let Order = class Order {
    restaurantId;
    customerId;
    orderType;
    status;
    tableNumber;
    deliveryAddress;
    items;
    batches;
    totalAmount;
    chefId;
    waiterId;
    kitchenDetails;
    deliveryDetails;
    takeawayDetails;
    cancellationReason;
    customerName;
    customerPhone;
    customerEmail;
    orderNotes;
    waiterNotes;
    takeawayPhone;
    takeawayName;
    paymentStatus;
    updatedAt;
};
exports.Order = Order;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['DINE_IN', 'DELIVERY', 'TAKEAWAY'] }),
    __metadata("design:type", String)
], Order.prototype, "orderType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: [
            'PENDING',
            'RESTAURANT_CONFIRMED',
            'KITCHEN_ACCEPTED',
            'PREPARING',
            'READY',
            'WAITER_ACCEPTED',
            'SERVED',
            'READY_FOR_DELIVERY',
            'DRIVER_ACCEPTED',
            'IN_DELIVERY',
            'DELIVERED',
            'READY_FOR_PICKUP',
            'PICKED_UP',
            'COMPLETED',
            'CANCELLED',
            'DRAFT',
            'PARTIAL_KITCHEN',
            'ALL_READY',
            'PARTIAL_SERVED',
            'PAYMENT_REQUESTED',
            'DINE_IN_COMPLETED'
        ] }),
    __metadata("design:type", String)
], Order.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "tableNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", common_1.DeliveryAddress)
], Order.prototype, "deliveryAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{
                productId: { type: mongoose_2.Types.ObjectId, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                specialInstructions: String,
                status: { type: String, enum: ['PENDING', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'PICKED_UP'] },
                sentToKitchenAt: Date,
                kitchenAcceptedAt: Date,
                preparationStartedAt: Date,
                readyAt: Date,
                completedAt: Date,
                chefId: mongoose_2.Types.ObjectId
            }] }),
    __metadata("design:type", Array)
], Order.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{
                batchNumber: { type: Number, required: true },
                items: [{
                        productId: { type: mongoose_2.Types.ObjectId, required: true },
                        quantity: { type: Number, required: true },
                        price: { type: Number, required: true },
                        specialInstructions: String,
                        itemStatus: { type: String, enum: ['PENDING', 'SENT_TO_KITCHEN', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY', 'SERVED'] },
                        sentToKitchenAt: Date,
                        kitchenAcceptedAt: Date,
                        preparationStartedAt: Date,
                        readyAt: Date,
                        servedAt: Date,
                        chefId: mongoose_2.Types.ObjectId
                    }],
                batchStatus: { type: String, enum: ['PENDING', 'SENT_TO_KITCHEN', 'KITCHEN_ACCEPTED', 'PREPARING', 'READY', 'SERVED'] },
                batchNote: String,
                sentToKitchenAt: Date,
                kitchenAcceptedAt: Date,
                allItemsReadyAt: Date,
                allItemsServedAt: Date,
                chefId: mongoose_2.Types.ObjectId,
                preparationStartedAt: Date,
                readyAt: Date
            }] }),
    __metadata("design:type", Array)
], Order.prototype, "batches", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], Order.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "chefId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Order.prototype, "waiterId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: {
            chefId: { type: mongoose_2.Types.ObjectId },
            assistantChefId: { type: mongoose_2.Types.ObjectId },
            sentToKitchenAt: { type: Date },
            acceptedAt: { type: Date },
            preparationStartedAt: { type: Date },
            readyAt: { type: Date },
            notes: { type: String },
            estimatedPrepTime: { type: String }
        } }),
    __metadata("design:type", Object)
], Order.prototype, "kitchenDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: {
            driverId: { type: mongoose_2.Types.ObjectId },
            acceptedAt: { type: Date },
            readyAt: { type: Date },
            pickedUpAt: { type: Date },
            deliveredAt: { type: Date },
            estimatedDeliveryTime: { type: Number },
            actualDeliveryTime: { type: Number },
            notes: { type: String }
        } }),
    __metadata("design:type", Object)
], Order.prototype, "deliveryDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: {
            waiterId: { type: mongoose_2.Types.ObjectId },
            readyAt: { type: Date },
            pickedUpAt: { type: Date },
            customerName: { type: String },
            customerPhone: { type: String },
            notes: { type: String }
        } }),
    __metadata("design:type", Object)
], Order.prototype, "takeawayDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "cancellationReason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "customerName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "customerPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "customerEmail", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "orderNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "waiterNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "takeawayPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "takeawayName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Order.prototype, "paymentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], Order.prototype, "updatedAt", void 0);
exports.Order = Order = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Order);
exports.OrderSchema = mongoose_1.SchemaFactory.createForClass(Order);
//# sourceMappingURL=order.schema.js.map