"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingRoleRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const pending_role_requests_service_1 = require("./pending-role-requests.service");
const pending_role_requests_controller_1 = require("./pending-role-requests.controller");
const mongoose_1 = require("@nestjs/mongoose");
const pending_role_request_schema_1 = require("../pending-role-requests/schemas/pending-role-request.schema");
const users_module_1 = require("../users/users.module");
let PendingRoleRequestsModule = class PendingRoleRequestsModule {
};
exports.PendingRoleRequestsModule = PendingRoleRequestsModule;
exports.PendingRoleRequestsModule = PendingRoleRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: pending_role_request_schema_1.PendingRoleRequest.name, schema: pending_role_request_schema_1.PendingRoleRequestSchema },
            ]),
            users_module_1.UsersModule,
        ],
        controllers: [pending_role_requests_controller_1.PendingRoleRequestsController],
        providers: [pending_role_requests_service_1.PendingRoleRequestsService],
        exports: [pending_role_requests_service_1.PendingRoleRequestsService],
    })
], PendingRoleRequestsModule);
//# sourceMappingURL=pending-role-requests.module.js.map