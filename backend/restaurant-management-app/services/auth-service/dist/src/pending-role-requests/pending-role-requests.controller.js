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
exports.PendingRoleRequestsController = void 0;
const common_1 = require("@nestjs/common");
const pending_role_requests_service_1 = require("./pending-role-requests.service");
const users_service_1 = require("../users/users.service");
const auth_guard_1 = require("../auth/guards/auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
let PendingRoleRequestsController = class PendingRoleRequestsController {
    pendingRoleRequestsService;
    usersService;
    constructor(pendingRoleRequestsService, usersService) {
        this.pendingRoleRequestsService = pendingRoleRequestsService;
        this.usersService = usersService;
    }
    async getAllPending() {
        return this.pendingRoleRequestsService.findAllPending();
    }
    async approve(id) {
        const request = await this.pendingRoleRequestsService.findById(id);
        if (!request || request.status !== 'pending') {
            throw new Error('Invalid request');
        }
        await this.usersService.promoteUserRole(request.userId._id.toString(), request.requestedRole);
        await this.pendingRoleRequestsService.approveRequest(id);
        await this.pendingRoleRequestsService.deleteRequest(id);
        return { message: 'User promoted successfully' };
    }
    async reject(id) {
        const request = await this.pendingRoleRequestsService.findById(id);
        if (!request || request.status !== 'pending') {
            throw new Error('Invalid request');
        }
        await this.usersService.disableUser(request.userId._id.toString());
        await this.pendingRoleRequestsService.rejectRequest(id);
        await this.pendingRoleRequestsService.deleteRequest(id);
        return { message: 'User rejected and disabled' };
    }
};
exports.PendingRoleRequestsController = PendingRoleRequestsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('owner'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PendingRoleRequestsController.prototype, "getAllPending", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)('owner'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PendingRoleRequestsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)('owner'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PendingRoleRequestsController.prototype, "reject", null);
exports.PendingRoleRequestsController = PendingRoleRequestsController = __decorate([
    (0, common_1.Controller)('pending-role-requests'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [pending_role_requests_service_1.PendingRoleRequestsService,
        users_service_1.UsersService])
], PendingRoleRequestsController);
//# sourceMappingURL=pending-role-requests.controller.js.map