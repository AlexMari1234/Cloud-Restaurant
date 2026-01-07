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
exports.GetAvailableTimeSlotsDTO = exports.CreateReservationDTO = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateReservationDTO {
    restaurantId;
    tableNumber;
    guests;
    reservationTime;
    specialRequests;
    customerName;
    customerPhone;
    customerEmail;
    status;
}
exports.CreateReservationDTO = CreateReservationDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Restaurant ID' }),
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateReservationDTO.prototype, "restaurantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Table number' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateReservationDTO.prototype, "tableNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Number of guests', minimum: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateReservationDTO.prototype, "guests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reservation date and time' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateReservationDTO.prototype, "reservationTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Special requests', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateReservationDTO.prototype, "specialRequests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDTO.prototype, "customerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer phone number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDTO.prototype, "customerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Customer email' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservationDTO.prototype, "customerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reservation status', enum: ['pending', 'confirmed', 'seated', 'cancelled', 'completed'], required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['pending', 'confirmed', 'seated', 'cancelled', 'completed']),
    __metadata("design:type", String)
], CreateReservationDTO.prototype, "status", void 0);
class GetAvailableTimeSlotsDTO {
    restaurantId;
    tableId;
    date;
    partySize;
}
exports.GetAvailableTimeSlotsDTO = GetAvailableTimeSlotsDTO;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], GetAvailableTimeSlotsDTO.prototype, "restaurantId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], GetAvailableTimeSlotsDTO.prototype, "tableId", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetAvailableTimeSlotsDTO.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GetAvailableTimeSlotsDTO.prototype, "partySize", void 0);
//# sourceMappingURL=create-reservation.dto.js.map