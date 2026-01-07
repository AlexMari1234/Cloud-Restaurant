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
exports.RestaurantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const restaurants_service_1 = require("../services/restaurants.service");
const common_2 = require("@rm/common");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let RestaurantsController = class RestaurantsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async create(req, dto) {
        if (!req.user?._id) {
            throw new common_1.UnauthorizedException('Missing user ID');
        }
        return this.service.create(req.user._id, dto);
    }
    async findAll() {
        return this.service.findAll();
    }
    async findById(id) {
        return this.service.findById(id);
    }
    async update(id, dto) {
        return this.service.update(id, dto);
    }
    async delete(id) {
        return this.service.delete(id);
    }
    async assignManager(restaurantId, managerId) {
        return this.service.assignManager(restaurantId, managerId);
    }
    async createTable(restaurantId, dto) {
        return this.service.createTable(restaurantId, dto);
    }
    async getTables(restaurantId) {
        return this.service.findAllTables(restaurantId);
    }
    async getTableById(restaurantId, tableId) {
        return this.service.findTableById(restaurantId, tableId);
    }
    async getTableByNumber(restaurantId, tableNumber) {
        return this.service.findTableByNumber(restaurantId, tableNumber);
    }
    async updateTable(restaurantId, tableId, dto) {
        return this.service.updateTable(restaurantId, tableId, dto);
    }
    async deleteTable(restaurantId, tableId) {
        return this.service.deleteTable(restaurantId, tableId);
    }
    async createEmployee(restaurantId, dto) {
        return this.service.createEmployee(restaurantId, dto);
    }
    async getAllEmployees(restaurantId) {
        return this.service.findAllEmployees(restaurantId);
    }
    async getEmployee(restaurantId, employeeId) {
        return this.service.findEmployeeById(restaurantId, employeeId);
    }
    async updateEmployee(restaurantId, employeeId, dto) {
        return this.service.updateEmployee(restaurantId, employeeId, dto);
    }
    async deleteEmployee(restaurantId, employeeId) {
        return this.service.deleteEmployee(restaurantId, employeeId);
    }
    async checkUserRole(restaurantId, userId) {
        return this.service.checkUserRole(restaurantId, userId);
    }
};
exports.RestaurantsController = RestaurantsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('owner'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, common_2.RestaurantsDto.CreateRestaurantDTO]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "findById", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('owner'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.RestaurantsDto.UpdateRestaurantDTO]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    (0, roles_decorator_1.Roles)('owner'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/assign-manager/:managerId'),
    (0, roles_decorator_1.Roles)('owner'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('managerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "assignManager", null);
__decorate([
    (0, common_1.Post)(':restaurantId/tables'),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.RestaurantsDto.CreateTableDTO]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "createTable", null);
__decorate([
    (0, common_1.Get)(':restaurantId/tables'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getTables", null);
__decorate([
    (0, common_1.Get)(':restaurantId/tables/:tableId'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('tableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getTableById", null);
__decorate([
    (0, common_1.Get)(':restaurantId/tables/number/:tableNumber'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('tableNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getTableByNumber", null);
__decorate([
    (0, common_1.Patch)(':restaurantId/tables/:tableId'),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('tableId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.RestaurantsDto.UpdateTableDTO]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "updateTable", null);
__decorate([
    (0, common_1.Delete)(':restaurantId/tables/:tableId'),
    (0, common_1.HttpCode)(204),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('tableId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "deleteTable", null);
__decorate([
    (0, common_1.Post)(':restaurantId/employees'),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.RestaurantsDto.CreateEmployeeDTO]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "createEmployee", null);
__decorate([
    (0, common_1.Get)(':restaurantId/employees'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getAllEmployees", null);
__decorate([
    (0, common_1.Get)(':restaurantId/employees/:employeeId'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "getEmployee", null);
__decorate([
    (0, common_1.Patch)(':restaurantId/employees/:employeeId'),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.RestaurantsDto.UpdateEmployeeDTO]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "updateEmployee", null);
__decorate([
    (0, common_1.Delete)(':restaurantId/employees/:employeeId'),
    (0, common_1.HttpCode)(204),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "deleteEmployee", null);
__decorate([
    (0, common_1.Get)(':restaurantId/check-role/:userId'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RestaurantsController.prototype, "checkUserRole", null);
exports.RestaurantsController = RestaurantsController = __decorate([
    (0, swagger_1.ApiTags)('Restaurants'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('restaurants'),
    __metadata("design:paramtypes", [restaurants_service_1.RestaurantsService])
], RestaurantsController);
//# sourceMappingURL=restaurants.controller.js.map