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
exports.KitchenMarkReadyDto = exports.KitchenStartPreparingDto = exports.KitchenAcceptDeliveryDto = exports.KitchenAcceptOrderDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class KitchenAcceptOrderDto {
    estimatedPrepTime;
    kitchenNote;
}
exports.KitchenAcceptOrderDto = KitchenAcceptOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated preparation time (e.g., "25-30 mins", "45 mins")',
        example: '25-30 mins'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], KitchenAcceptOrderDto.prototype, "estimatedPrepTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note from kitchen',
        example: 'Special attention to allergies',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], KitchenAcceptOrderDto.prototype, "kitchenNote", void 0);
class KitchenAcceptDeliveryDto {
    estimatedPrepTime;
    note;
}
exports.KitchenAcceptDeliveryDto = KitchenAcceptDeliveryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated preparation time (e.g., "25-30 mins", "45 mins")',
        example: '25-30 mins'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], KitchenAcceptDeliveryDto.prototype, "estimatedPrepTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note from kitchen',
        example: 'Special attention to allergies',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], KitchenAcceptDeliveryDto.prototype, "note", void 0);
class KitchenStartPreparingDto {
    note;
}
exports.KitchenStartPreparingDto = KitchenStartPreparingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when starting preparation',
        example: 'Started cooking',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], KitchenStartPreparingDto.prototype, "note", void 0);
class KitchenMarkReadyDto {
    note;
}
exports.KitchenMarkReadyDto = KitchenMarkReadyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note when order is ready',
        example: 'Extra hot as requested',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], KitchenMarkReadyDto.prototype, "note", void 0);
//# sourceMappingURL=kitchen.dto.js.map