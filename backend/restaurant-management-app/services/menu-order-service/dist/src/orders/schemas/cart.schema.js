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
exports.CartSchema = exports.Cart = exports.CartItem = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let CartItem = class CartItem {
    productId;
    quantity;
    price;
    specialInstructions;
};
exports.CartItem = CartItem;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], CartItem.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], CartItem.prototype, "quantity", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number }),
    __metadata("design:type", Number)
], CartItem.prototype, "price", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], CartItem.prototype, "specialInstructions", void 0);
exports.CartItem = CartItem = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], CartItem);
let Cart = class Cart {
    customerId;
    restaurantId;
    items;
    totalAmount;
    tableNumber;
    deliveryAddress;
    orderType;
    takeawayPhone;
    takeawayName;
    lastUpdated;
};
exports.Cart = Cart;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Cart.prototype, "customerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: mongoose_2.Types.ObjectId }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Cart.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{
                productId: { type: mongoose_2.Types.ObjectId, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                specialInstructions: String
            }] }),
    __metadata("design:type", Array)
], Cart.prototype, "items", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: Number, default: 0 }),
    __metadata("design:type", Number)
], Cart.prototype, "totalAmount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number }),
    __metadata("design:type", Number)
], Cart.prototype, "tableNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Cart.prototype, "deliveryAddress", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['DINE_IN', 'DELIVERY', 'TAKEAWAY'] }),
    __metadata("design:type", String)
], Cart.prototype, "orderType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Cart.prototype, "takeawayPhone", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String }),
    __metadata("design:type", String)
], Cart.prototype, "takeawayName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: Date.now, expires: 3600 }),
    __metadata("design:type", Date)
], Cart.prototype, "lastUpdated", void 0);
exports.Cart = Cart = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Cart);
exports.CartSchema = mongoose_1.SchemaFactory.createForClass(Cart);
//# sourceMappingURL=cart.schema.js.map