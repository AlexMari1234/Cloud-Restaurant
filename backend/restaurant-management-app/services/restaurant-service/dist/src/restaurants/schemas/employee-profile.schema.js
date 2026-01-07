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
exports.EmployeeProfileSchema = exports.EmployeeProfile = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let EmployeeProfile = class EmployeeProfile {
    userId;
    restaurantId;
    roleLabel;
    hourlyRate;
    status;
    hireDate;
};
exports.EmployeeProfile = EmployeeProfile;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EmployeeProfile.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Restaurant', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EmployeeProfile.prototype, "restaurantId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['chef', 'waiter', 'cashier', 'manager', 'assistant_chef', 'driver'], required: true }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "roleLabel", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, required: true }),
    __metadata("design:type", Number)
], EmployeeProfile.prototype, "hourlyRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['active', 'inactive'], default: 'active' }),
    __metadata("design:type", String)
], EmployeeProfile.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date }),
    __metadata("design:type", Date)
], EmployeeProfile.prototype, "hireDate", void 0);
exports.EmployeeProfile = EmployeeProfile = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], EmployeeProfile);
exports.EmployeeProfileSchema = mongoose_1.SchemaFactory.createForClass(EmployeeProfile);
//# sourceMappingURL=employee-profile.schema.js.map