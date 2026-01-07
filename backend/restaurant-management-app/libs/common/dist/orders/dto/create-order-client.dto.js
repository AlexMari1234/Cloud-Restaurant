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
exports.WaiterCreateOrderDto = exports.CreateOrderFromCartDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateOrderFromCartDto {
    customerEmail;
    orderNotes;
}
exports.CreateOrderFromCartDto = CreateOrderFromCartDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Customer email override (only for dine-in when waiter takes order for different customer)',
        example: 'customer@example.com',
        required: false
    }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderFromCartDto.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Special order notes', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderFromCartDto.prototype, "orderNotes", void 0);
class WaiterCreateOrderDto {
    customerEmail;
    tableNumber;
    customerName;
    customerPhone;
    waiterNotes;
}
exports.WaiterCreateOrderDto = WaiterCreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer email if known', required: false }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WaiterCreateOrderDto.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Table number for dine-in orders' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], WaiterCreateOrderDto.prototype, "tableNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name for anonymous orders', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WaiterCreateOrderDto.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer phone for anonymous orders', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WaiterCreateOrderDto.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Waiter notes', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], WaiterCreateOrderDto.prototype, "waiterNotes", void 0);
//# sourceMappingURL=create-order-client.dto.js.map