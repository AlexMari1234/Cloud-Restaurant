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
exports.DriverPickupDto = exports.DriverAcceptDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class DriverAcceptDto {
    estimatedDeliveryTime;
    note;
}
exports.DriverAcceptDto = DriverAcceptDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated delivery time (e.g., "15-20 mins", "30 mins")',
        example: '15-20 mins'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DriverAcceptDto.prototype, "estimatedDeliveryTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note from driver',
        example: 'Will call when arrived',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DriverAcceptDto.prototype, "note", void 0);
class DriverPickupDto {
    note;
}
exports.DriverPickupDto = DriverPickupDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional note from driver',
        example: 'Package picked up from restaurant',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DriverPickupDto.prototype, "note", void 0);
//# sourceMappingURL=driver.dto.js.map