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
exports.CartResponseDto = exports.CartItemResponseDto = exports.SetOrderTypeDto = exports.DeliveryAddressDto = exports.UpdateCartItemDto = exports.AddToCartDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const enums_1 = require("../../kafka/constants/enums");
class AddToCartDto {
    quantity;
    specialInstructions;
}
exports.AddToCartDto = AddToCartDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity of the product to add' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AddToCartDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Special instructions for this item', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AddToCartDto.prototype, "specialInstructions", void 0);
class UpdateCartItemDto {
    quantity;
    specialInstructions;
}
exports.UpdateCartItemDto = UpdateCartItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New quantity for the cart item' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCartItemDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Special instructions for this item', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateCartItemDto.prototype, "specialInstructions", void 0);
class DeliveryAddressDto {
    street;
    city;
    postalCode;
    phoneNumber;
    deliveryInstructions;
    coordinates;
}
exports.DeliveryAddressDto = DeliveryAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Street address' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeliveryAddressDto.prototype, "street", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'City' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeliveryAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Postal code' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeliveryAddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number for delivery contact' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeliveryAddressDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional delivery instructions', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DeliveryAddressDto.prototype, "deliveryInstructions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Coordinates', required: false }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], DeliveryAddressDto.prototype, "coordinates", void 0);
class SetOrderTypeDto {
    orderType;
    tableNumber;
    deliveryAddress;
    takeawayPhone;
    takeawayName;
}
exports.SetOrderTypeDto = SetOrderTypeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.OrderTypeEnum, description: 'Type of order' }),
    (0, class_validator_1.IsEnum)(enums_1.OrderTypeEnum),
    __metadata("design:type", String)
], SetOrderTypeDto.prototype, "orderType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Table number for dine-in orders', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SetOrderTypeDto.prototype, "tableNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery address for delivery orders', required: false, type: DeliveryAddressDto }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DeliveryAddressDto),
    __metadata("design:type", DeliveryAddressDto)
], SetOrderTypeDto.prototype, "deliveryAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer phone for takeaway orders', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SetOrderTypeDto.prototype, "takeawayPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name for takeaway orders', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SetOrderTypeDto.prototype, "takeawayName", void 0);
class CartItemResponseDto {
    productId;
    quantity;
    price;
    specialInstructions;
}
exports.CartItemResponseDto = CartItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CartItemResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity of the product' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CartItemResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price of the product' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CartItemResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Special instructions for this item', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartItemResponseDto.prototype, "specialInstructions", void 0);
class CartResponseDto {
    _id;
    customerId;
    restaurantId;
    items;
    totalAmount;
    orderType;
    tableNumber;
    deliveryAddress;
    takeawayPhone;
    takeawayName;
    lastUpdated;
    createdAt;
    updatedAt;
}
exports.CartResponseDto = CartResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cart ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CartResponseDto.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CartResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restaurant ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CartResponseDto.prototype, "restaurantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Items in the cart', type: [CartItemResponseDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CartItemResponseDto),
    __metadata("design:type", Array)
], CartResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CartResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enums_1.OrderTypeEnum, description: 'Order type', required: false }),
    (0, class_validator_1.IsEnum)(enums_1.OrderTypeEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartResponseDto.prototype, "orderType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Table number for dine-in', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CartResponseDto.prototype, "tableNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery address', required: false, type: DeliveryAddressDto }),
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DeliveryAddressDto),
    __metadata("design:type", DeliveryAddressDto)
], CartResponseDto.prototype, "deliveryAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer phone for takeaway orders', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartResponseDto.prototype, "takeawayPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name for takeaway orders', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CartResponseDto.prototype, "takeawayName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last updated timestamp' }),
    __metadata("design:type", Date)
], CartResponseDto.prototype, "lastUpdated", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    __metadata("design:type", Date)
], CartResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Update timestamp' }),
    __metadata("design:type", Date)
], CartResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=cart.dto.js.map