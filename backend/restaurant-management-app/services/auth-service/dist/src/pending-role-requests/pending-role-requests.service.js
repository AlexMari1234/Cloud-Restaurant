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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingRoleRequestsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const pending_role_request_schema_1 = require("../pending-role-requests/schemas/pending-role-request.schema");
const mongoose_2 = require("mongoose");
let PendingRoleRequestsService = class PendingRoleRequestsService {
    model;
    constructor(model) {
        this.model = model;
    }
    async findAllPending() {
        return this.model
            .find({ status: 'pending' })
            .populate('userId', 'email username name role status')
            .exec();
    }
    async findById(id) {
        return this.model
            .findById(id)
            .populate('userId', 'email username name role status')
            .exec();
    }
    async approveRequest(id) {
        return this.model.findByIdAndUpdate(id, { status: 'approved', processedAt: new Date() }, { new: true });
    }
    async rejectRequest(id) {
        return this.model.findByIdAndUpdate(id, { status: 'rejected', processedAt: new Date() }, { new: true });
    }
    async deleteRequest(id) {
        return this.model.findByIdAndDelete(id);
    }
    async createPendingRequest(userId, requestedRole) {
        return this.model.create({
            userId,
            requestedRole,
            status: 'pending',
            createdAt: new Date(),
        });
    }
};
exports.PendingRoleRequestsService = PendingRoleRequestsService;
exports.PendingRoleRequestsService = PendingRoleRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(pending_role_request_schema_1.PendingRoleRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PendingRoleRequestsService);
//# sourceMappingURL=pending-role-requests.service.js.map