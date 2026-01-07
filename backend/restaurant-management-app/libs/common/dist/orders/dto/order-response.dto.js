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
exports.OrderResponseDto = exports.OrderItemResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const enums_1 = require("../../kafka/constants/enums");
class OrderItemResponseDto {
    productId;
    quantity;
    price;
    specialInstructions;
}
exports.OrderItemResponseDto = OrderItemResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], OrderItemResponseDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity of the product' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OrderItemResponseDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Price of the product' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OrderItemResponseDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Special instructions for this item', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OrderItemResponseDto.prototype, "specialInstructions", void 0);
class OrderResponseDto {
    _id;
    restaurantId;
    customerId;
    orderType;
    status;
    tableNumber;
    deliveryAddress;
    items;
    totalAmount;
    waiterId;
    driverId;
    kitchenNotes;
    estimatedDeliveryTime;
    actualDeliveryTime;
    createdAt;
    updatedAt;
}
exports.OrderResponseDto = OrderResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restaurant ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "restaurantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of order (DINE_IN or DELIVERY)',
        enum: enums_1.OrderTypeEnum
    }),
    (0, class_validator_1.IsEnum)(enums_1.OrderTypeEnum),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "orderType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the order',
        enum: enums_1.OrderStatusEnum
    }),
    (0, class_validator_1.IsEnum)(enums_1.OrderStatusEnum),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Table number (for DINE_IN)', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "tableNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery address (for DELIVERY)', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], OrderResponseDto.prototype, "deliveryAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order items', type: [OrderItemResponseDto] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], OrderResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total amount of the order' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OrderResponseDto.prototype, "totalAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the waiter (for DINE_IN)', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "waiterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the driver (for DELIVERY)', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "driverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Kitchen notes', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OrderResponseDto.prototype, "kitchenNotes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated delivery time', required: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "estimatedDeliveryTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Actual delivery time', required: false }),
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "actualDeliveryTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Creation timestamp' }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Last update timestamp' }),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], OrderResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=order-response.dto.js.map