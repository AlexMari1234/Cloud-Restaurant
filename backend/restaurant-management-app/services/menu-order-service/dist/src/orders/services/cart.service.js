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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const cart_schema_1 = require("../schemas/cart.schema");
const product_schema_1 = require("../../menu/schemas/product.schema");
let CartService = class CartService {
    cartModel;
    productModel;
    constructor(cartModel, productModel) {
        this.cartModel = cartModel;
        this.productModel = productModel;
    }
    async getProduct(restaurantId, productId) {
        const product = await this.productModel.findOne({
            _id: new mongoose_2.Types.ObjectId(productId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async calculateTotal(items) {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    toResponseDto(cart) {
        return {
            _id: cart._id.toString(),
            customerId: cart.customerId.toString(),
            restaurantId: cart.restaurantId.toString(),
            items: cart.items.map(item => ({
                productId: item.productId.toString(),
                quantity: item.quantity,
                price: item.price,
                specialInstructions: item.specialInstructions,
            })),
            totalAmount: cart.totalAmount,
            orderType: cart.orderType,
            tableNumber: cart.tableNumber,
            deliveryAddress: cart.deliveryAddress,
            takeawayPhone: cart.takeawayPhone,
            takeawayName: cart.takeawayName,
            lastUpdated: cart.lastUpdated,
            createdAt: cart.createdAt,
            updatedAt: cart.updatedAt,
        };
    }
    async getCart(customerId, restaurantId) {
        const cart = await this.cartModel.findOne({
            customerId: new mongoose_2.Types.ObjectId(customerId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!cart) {
            const newCart = await this.cartModel.create({
                customerId: new mongoose_2.Types.ObjectId(customerId),
                restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
                items: [],
                totalAmount: 0,
            });
            return this.toResponseDto(newCart);
        }
        return this.toResponseDto(cart);
    }
    async updateCart(cart) {
        const updated = await this.cartModel.findByIdAndUpdate(cart._id, cart, { new: true });
        if (!updated) {
            throw new common_1.NotFoundException('Cart not found');
        }
        return updated;
    }
    async addToCart(customerId, restaurantId, productId, quantity, specialInstructions) {
        if (quantity <= 0) {
            throw new common_1.BadRequestException('Quantity must be greater than 0');
        }
        const product = await this.getProduct(restaurantId, productId);
        if (product.status !== 'active') {
            throw new common_1.BadRequestException('Product is not available');
        }
        const cart = await this.cartModel.findOne({
            customerId: new mongoose_2.Types.ObjectId(customerId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        let cartDoc;
        if (!cart) {
            cartDoc = await this.cartModel.create({
                customerId: new mongoose_2.Types.ObjectId(customerId),
                restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
                items: [],
                totalAmount: 0,
            });
        }
        else {
            cartDoc = cart;
        }
        const existingItemIndex = cartDoc.items.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex > -1) {
            cartDoc.items[existingItemIndex].quantity += quantity;
            cartDoc.items[existingItemIndex].price = product.price;
            if (specialInstructions) {
                cartDoc.items[existingItemIndex].specialInstructions = specialInstructions;
            }
        }
        else {
            cartDoc.items.push({
                productId: new mongoose_2.Types.ObjectId(productId),
                quantity,
                price: product.price,
                specialInstructions,
            });
        }
        cartDoc.totalAmount = await this.calculateTotal(cartDoc.items);
        cartDoc.lastUpdated = new Date();
        const updatedCart = await this.updateCart(cartDoc);
        return this.toResponseDto(updatedCart);
    }
    async updateCartItem(customerId, restaurantId, productId, quantity, specialInstructions) {
        if (quantity < 0) {
            throw new common_1.BadRequestException('Quantity cannot be negative');
        }
        const cart = await this.cartModel.findOne({
            customerId: new mongoose_2.Types.ObjectId(customerId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            throw new common_1.NotFoundException('Item not found in cart');
        }
        if (quantity === 0) {
            cart.items.splice(itemIndex, 1);
        }
        else {
            cart.items[itemIndex].quantity = quantity;
            if (specialInstructions !== undefined) {
                cart.items[itemIndex].specialInstructions = specialInstructions;
            }
        }
        cart.totalAmount = await this.calculateTotal(cart.items);
        cart.lastUpdated = new Date();
        const updatedCart = await this.updateCart(cart);
        return this.toResponseDto(updatedCart);
    }
    async removeFromCart(customerId, restaurantId, productId) {
        const cart = await this.cartModel.findOne({
            customerId: new mongoose_2.Types.ObjectId(customerId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            throw new common_1.NotFoundException('Item not found in cart');
        }
        cart.items.splice(itemIndex, 1);
        cart.totalAmount = await this.calculateTotal(cart.items);
        cart.lastUpdated = new Date();
        const updatedCart = await this.updateCart(cart);
        return this.toResponseDto(updatedCart);
    }
    async clearCart(customerId, restaurantId) {
        const cart = await this.cartModel.findOne({
            customerId: new mongoose_2.Types.ObjectId(customerId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        cart.items = [];
        cart.totalAmount = 0;
        cart.lastUpdated = new Date();
        const updatedCart = await this.updateCart(cart);
        return this.toResponseDto(updatedCart);
    }
    async setOrderType(customerId, restaurantId, orderType, tableNumber, deliveryAddress, takeawayPhone, takeawayName) {
        const cart = await this.cartModel.findOne({
            customerId: new mongoose_2.Types.ObjectId(customerId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!cart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        if (orderType === 'DINE_IN' && !tableNumber) {
            throw new common_1.BadRequestException('Table number is required for dine-in orders');
        }
        if (orderType === 'DELIVERY' && !deliveryAddress) {
            throw new common_1.BadRequestException('Delivery address is required for delivery orders');
        }
        if (orderType === 'TAKEAWAY' && !takeawayPhone) {
            throw new common_1.BadRequestException('Phone number is required for takeaway orders');
        }
        const updateOperation = {
            $set: {
                orderType: orderType,
                lastUpdated: new Date(),
            },
            $unset: {}
        };
        updateOperation.$unset.tableNumber = '';
        updateOperation.$unset.deliveryAddress = '';
        updateOperation.$unset.takeawayPhone = '';
        updateOperation.$unset.takeawayName = '';
        if (orderType === 'DINE_IN') {
            updateOperation.$set.tableNumber = tableNumber;
            delete updateOperation.$unset.tableNumber;
        }
        else if (orderType === 'DELIVERY') {
            updateOperation.$set.deliveryAddress = deliveryAddress;
            delete updateOperation.$unset.deliveryAddress;
        }
        else if (orderType === 'TAKEAWAY') {
            updateOperation.$set.takeawayPhone = takeawayPhone;
            updateOperation.$set.takeawayName = takeawayName;
            delete updateOperation.$unset.takeawayPhone;
            delete updateOperation.$unset.takeawayName;
        }
        if (Object.keys(updateOperation.$unset).length === 0) {
            delete updateOperation.$unset;
        }
        const updatedCart = await this.cartModel.findOneAndUpdate({
            customerId: new mongoose_2.Types.ObjectId(customerId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        }, updateOperation, { new: true });
        if (!updatedCart) {
            throw new common_1.NotFoundException('Cart not found');
        }
        return this.toResponseDto(updatedCart);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(cart_schema_1.Cart.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CartService);
//# sourceMappingURL=cart.service.js.map