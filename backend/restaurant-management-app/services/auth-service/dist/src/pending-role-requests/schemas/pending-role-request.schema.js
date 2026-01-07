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
exports.PendingRoleRequestSchema = exports.PendingRoleRequest = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongoose = require("mongoose");
const user_schema_1 = require("../../users/schemas/user.schema");
let PendingRoleRequest = class PendingRoleRequest extends mongoose_2.Document {
    userId;
    requestedRole;
    status;
    processedAt;
};
exports.PendingRoleRequest = PendingRoleRequest;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", user_schema_1.User)
], PendingRoleRequest.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['manager', 'employee'] }),
    __metadata("design:type", String)
], PendingRoleRequest.prototype, "requestedRole", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' }),
    __metadata("design:type", String)
], PendingRoleRequest.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], PendingRoleRequest.prototype, "processedAt", void 0);
exports.PendingRoleRequest = PendingRoleRequest = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PendingRoleRequest);
exports.PendingRoleRequestSchema = mongoose_1.SchemaFactory.createForClass(PendingRoleRequest);
//# sourceMappingURL=pending-role-request.schema.js.map