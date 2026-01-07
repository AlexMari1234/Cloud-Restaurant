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
exports.CompleteTakeawayOrderDto = exports.CompleteDeliveryOrderDto = exports.KitchenMarkReadyTakeawayOrderDto = exports.KitchenMarkReadyDeliveryOrderDto = exports.KitchenStartPreparingTakeawayOrderDto = exports.KitchenStartPreparingDeliveryOrderDto = exports.KitchenAcceptTakeawayOrderDto = exports.KitchenAcceptDeliveryOrderDto = exports.UpdateTakeawayStatusDto = exports.UpdateDeliveryStatusDto = exports.CreateTakeawayOrderDto = exports.CreateDeliveryOrderDto = exports.DeliveryTakeawayOrderItemDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class DeliveryTakeawayOrderItemDto {
    productId;
    quantity;
    specialInstructions;
}
exports.DeliveryTakeawayOrderItemDto = DeliveryTakeawayOrderItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DeliveryTakeawayOrderItemDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], DeliveryTakeawayOrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DeliveryTakeawayOrderItemDto.prototype, "specialInstructions", void 0);
class CreateDeliveryOrderDto {
    restaurantId;
    items;
    customerEmail;
    customerName;
    customerPhone;
    deliveryAddress;
    orderNotes;
}
exports.CreateDeliveryOrderDto = CreateDeliveryOrderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDeliveryOrderDto.prototype, "restaurantId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DeliveryTakeawayOrderItemDto),
    __metadata("design:type", Array)
], CreateDeliveryOrderDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateDeliveryOrderDto.prototype, "customerEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDeliveryOrderDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateDeliveryOrderDto.prototype, "customerPhone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDeliveryOrderDto.prototype, "deliveryAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeliveryOrderDto.prototype, "orderNotes", void 0);
class CreateTakeawayOrderDto {
    restaurantId;
    items;
    customerEmail;
    customerName;
    customerPhone;
    orderNotes;
}
exports.CreateTakeawayOrderDto = CreateTakeawayOrderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTakeawayOrderDto.prototype, "restaurantId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => DeliveryTakeawayOrderItemDto),
    __metadata("design:type", Array)
], CreateTakeawayOrderDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateTakeawayOrderDto.prototype, "customerEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTakeawayOrderDto.prototype, "customerName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsPhoneNumber)(),
    __metadata("design:type", String)
], CreateTakeawayOrderDto.prototype, "customerPhone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTakeawayOrderDto.prototype, "orderNotes", void 0);
class UpdateDeliveryStatusDto {
    status;
    note;
}
exports.UpdateDeliveryStatusDto = UpdateDeliveryStatusDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDeliveryStatusDto.prototype, "note", void 0);
class UpdateTakeawayStatusDto {
    status;
    note;
}
exports.UpdateTakeawayStatusDto = UpdateTakeawayStatusDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateTakeawayStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTakeawayStatusDto.prototype, "note", void 0);
class KitchenAcceptDeliveryOrderDto {
    estimatedPrepTime;
    note;
}
exports.KitchenAcceptDeliveryOrderDto = KitchenAcceptDeliveryOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated preparation time (e.g., "25-30 mins", "45 mins")',
        example: '25-30 mins'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], KitchenAcceptDeliveryOrderDto.prototype, "estimatedPrepTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note from kitchen',
        example: 'Special attention to allergies',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KitchenAcceptDeliveryOrderDto.prototype, "note", void 0);
class KitchenAcceptTakeawayOrderDto {
    estimatedPrepTime;
    note;
}
exports.KitchenAcceptTakeawayOrderDto = KitchenAcceptTakeawayOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated preparation time (e.g., "25-30 mins", "45 mins")',
        example: '25-30 mins'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], KitchenAcceptTakeawayOrderDto.prototype, "estimatedPrepTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note from kitchen',
        example: 'Special attention to allergies',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KitchenAcceptTakeawayOrderDto.prototype, "note", void 0);
class KitchenStartPreparingDeliveryOrderDto {
    note;
}
exports.KitchenStartPreparingDeliveryOrderDto = KitchenStartPreparingDeliveryOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when starting preparation',
        example: 'Started cooking',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KitchenStartPreparingDeliveryOrderDto.prototype, "note", void 0);
class KitchenStartPreparingTakeawayOrderDto {
    note;
}
exports.KitchenStartPreparingTakeawayOrderDto = KitchenStartPreparingTakeawayOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when starting preparation',
        example: 'Started cooking',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KitchenStartPreparingTakeawayOrderDto.prototype, "note", void 0);
class KitchenMarkReadyDeliveryOrderDto {
    note;
}
exports.KitchenMarkReadyDeliveryOrderDto = KitchenMarkReadyDeliveryOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when order is ready for delivery',
        example: 'Extra hot as requested',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KitchenMarkReadyDeliveryOrderDto.prototype, "note", void 0);
class KitchenMarkReadyTakeawayOrderDto {
    note;
}
exports.KitchenMarkReadyTakeawayOrderDto = KitchenMarkReadyTakeawayOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when order is ready for pickup',
        example: 'Extra hot as requested',
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], KitchenMarkReadyTakeawayOrderDto.prototype, "note", void 0);
class CompleteDeliveryOrderDto {
    driverId;
    note;
}
exports.CompleteDeliveryOrderDto = CompleteDeliveryOrderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteDeliveryOrderDto.prototype, "driverId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteDeliveryOrderDto.prototype, "note", void 0);
class CompleteTakeawayOrderDto {
    waiterId;
    note;
}
exports.CompleteTakeawayOrderDto = CompleteTakeawayOrderDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteTakeawayOrderDto.prototype, "waiterId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteTakeawayOrderDto.prototype, "note", void 0);
//# sourceMappingURL=delivery-takeaway.dto.js.map