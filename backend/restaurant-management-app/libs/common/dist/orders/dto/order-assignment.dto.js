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
exports.StaffAssignmentDto = exports.KitchenConfirmationDto = exports.OrderAssignmentDto = exports.StaffRole = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var StaffRole;
(function (StaffRole) {
    StaffRole["CHEF"] = "CHEF";
    StaffRole["ASSISTANT_CHEF"] = "ASSISTANT_CHEF";
    StaffRole["WAITER"] = "WAITER";
    StaffRole["DRIVER"] = "DRIVER";
})(StaffRole || (exports.StaffRole = StaffRole = {}));
class OrderAssignmentDto {
    orderId;
    chefId;
    assistantChefId;
    waiterId;
    driverId;
    estimatedPrepTime;
    estimatedDeliveryTime;
}
exports.OrderAssignmentDto = OrderAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], OrderAssignmentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chef ID (required)' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], OrderAssignmentDto.prototype, "chefId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assistant Chef ID (optional)', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OrderAssignmentDto.prototype, "assistantChefId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Waiter ID (for dine-in orders)', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OrderAssignmentDto.prototype, "waiterId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Driver ID (for delivery orders)', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], OrderAssignmentDto.prototype, "driverId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated preparation time in minutes' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], OrderAssignmentDto.prototype, "estimatedPrepTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated delivery time in minutes (for delivery orders)', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], OrderAssignmentDto.prototype, "estimatedDeliveryTime", void 0);
class KitchenConfirmationDto {
    orderId;
    chefId;
    assistantChefId;
    estimatedPrepTime;
    kitchenNotes;
}
exports.KitchenConfirmationDto = KitchenConfirmationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], KitchenConfirmationDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chef ID confirming the order' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], KitchenConfirmationDto.prototype, "chefId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Assistant Chef ID (optional)', required: false }),
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], KitchenConfirmationDto.prototype, "assistantChefId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated preparation time in minutes' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], KitchenConfirmationDto.prototype, "estimatedPrepTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Kitchen notes', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], KitchenConfirmationDto.prototype, "kitchenNotes", void 0);
class StaffAssignmentDto {
    orderId;
    staffId;
    role;
    estimatedTime;
}
exports.StaffAssignmentDto = StaffAssignmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Order ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], StaffAssignmentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Staff member ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], StaffAssignmentDto.prototype, "staffId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: StaffRole, description: 'Staff role' }),
    (0, class_validator_1.IsEnum)(StaffRole),
    __metadata("design:type", String)
], StaffAssignmentDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Estimated time for this role in minutes', required: false }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], StaffAssignmentDto.prototype, "estimatedTime", void 0);
//# sourceMappingURL=order-assignment.dto.js.map