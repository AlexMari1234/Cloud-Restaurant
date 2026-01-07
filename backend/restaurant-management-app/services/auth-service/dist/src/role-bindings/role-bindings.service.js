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
exports.RoleBindingsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_binding_schema_1 = require("./role-binding.schema");
let RoleBindingsService = class RoleBindingsService {
    model;
    constructor(model) {
        this.model = model;
    }
    async upsert(userId, role, resourceId, resourceType) {
        return this.model.updateOne({ userId, resourceId, resourceType }, { $set: { role } }, { upsert: true });
    }
    async revoke(userId, resourceId, resourceType) {
        return this.model.deleteOne({ userId, resourceId, resourceType });
    }
    async listForResource(resourceId, resourceType = 'restaurant') {
        return this.model.find({ resourceId, resourceType });
    }
    async listForUser(userId) {
        return this.model.find({ userId });
    }
};
exports.RoleBindingsService = RoleBindingsService;
exports.RoleBindingsService = RoleBindingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_binding_schema_1.RoleBinding.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RoleBindingsService);
//# sourceMappingURL=role-bindings.service.js.map