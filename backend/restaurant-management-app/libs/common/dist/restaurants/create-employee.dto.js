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
exports.UpdateShiftDto = exports.CreateShiftDto = exports.CreateEmployeeDTO = void 0;
const class_validator_1 = require("class-validator");
class CreateEmployeeDTO {
    userId;
    roleLabel;
    hourlyRate;
}
exports.CreateEmployeeDTO = CreateEmployeeDTO;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateEmployeeDTO.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['chef', 'waiter', 'cashier', 'manager', 'assistant_chef', 'driver']),
    __metadata("design:type", String)
], CreateEmployeeDTO.prototype, "roleLabel", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEmployeeDTO.prototype, "hourlyRate", void 0);
class CreateShiftDto {
    employeeId;
    startTime;
    endTime;
}
exports.CreateShiftDto = CreateShiftDto;
class UpdateShiftDto {
    startTime;
    endTime;
    status;
}
exports.UpdateShiftDto = UpdateShiftDto;
//# sourceMappingURL=create-employee.dto.js.map