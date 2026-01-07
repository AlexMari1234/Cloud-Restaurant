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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const cart_service_1 = require("../services/cart.service");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@rm/common");
let CartController = class CartController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    async getCart(req, restaurantId) {
        return this.cartService.getCart(req.user._id, restaurantId);
    }
    async addToCart(req, restaurantId, productId, addToCartDto) {
        return this.cartService.addToCart(req.user._id, restaurantId, productId, addToCartDto.quantity, addToCartDto.specialInstructions);
    }
    async updateCartItem(req, restaurantId, productId, updateCartItemDto) {
        return this.cartService.updateCartItem(req.user._id, restaurantId, productId, updateCartItemDto.quantity, updateCartItemDto.specialInstructions);
    }
    async removeFromCart(req, restaurantId, productId) {
        return this.cartService.removeFromCart(req.user._id, restaurantId, productId);
    }
    async clearCart(req, restaurantId) {
        return this.cartService.clearCart(req.user._id, restaurantId);
    }
    async setOrderType(req, restaurantId, setOrderTypeDto) {
        return this.cartService.setOrderType(req.user._id, restaurantId, setOrderTypeDto.orderType, setOrderTypeDto.tableNumber, setOrderTypeDto.deliveryAddress, setOrderTypeDto.takeawayPhone, setOrderTypeDto.takeawayName);
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get cart for current user and restaurant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the cart', type: common_2.CartResponseDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)('products/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Add product to cart' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Product added to cart', type: common_2.CartResponseDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('productId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.AddToCartDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addToCart", null);
__decorate([
    (0, common_1.Put)('products/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update cart item' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cart item updated', type: common_2.CartResponseDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('productId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, common_2.UpdateCartItemDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Delete)('products/:productId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove product from cart' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product removed from cart', type: common_2.CartResponseDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeFromCart", null);
__decorate([
    (0, common_1.Delete)(),
    (0, swagger_1.ApiOperation)({ summary: 'Clear cart' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cart cleared', type: common_2.CartResponseDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "clearCart", null);
__decorate([
    (0, common_1.Put)('order-type'),
    (0, swagger_1.ApiOperation)({ summary: 'Set order type and related details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Order type set', type: common_2.CartResponseDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('restaurantId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, common_2.SetOrderTypeDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "setOrderType", null);
exports.CartController = CartController = __decorate([
    (0, swagger_1.ApiTags)('Cart'),
    (0, common_1.Controller)('restaurants/:restaurantId/cart'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map