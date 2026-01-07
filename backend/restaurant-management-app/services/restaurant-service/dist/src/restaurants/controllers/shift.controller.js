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
exports.ShiftController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const shift_service_1 = require("../services/shift.service");
const common_2 = require("@rm/common");
const auth_guard_1 = require("../../auth/guards/auth.guard");
const restaurant_roles_guard_1 = require("../../auth/guards/restaurant-roles.guard");
const restaurant_roles_decorator_1 = require("../../auth/decorators/restaurant-roles.decorator");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
let ShiftController = class ShiftController {
    service;
    httpService;
    constructor(service, httpService) {
        this.service = service;
        this.httpService = httpService;
    }
    async createShift(restaurantId, dto, req) {
        const shiftData = { ...dto, restaurantId };
        return this.service.create(shiftData);
    }
    async getShifts(restaurantId, req) {
        return this.service.findAll(restaurantId);
    }
    async getEmployeeShifts(restaurantId, employeeId, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.findByEmployee(restaurantId, employeeId, req.user._id, token);
    }
    async getEmployeeShiftsByDay(restaurantId, employeeId, date, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.findByEmployeeAndDay(restaurantId, employeeId, date, req.user._id, token);
    }
    async getAllShiftsByDay(restaurantId, date) {
        return this.service.findAllByDay(restaurantId, date);
    }
    async getUpcomingShifts(restaurantId) {
        return this.service.findUpcoming(restaurantId);
    }
    async getHistoryShifts(restaurantId) {
        return this.service.findHistory(restaurantId);
    }
    async updateShift(restaurantId, shiftId, dto, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.update(restaurantId, shiftId, dto, req.user._id, token);
    }
    async cancelShift(restaurantId, shiftId, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.cancelShift(restaurantId, shiftId, req.user._id, token);
    }
    async deleteShift(restaurantId, shiftId, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.delete(restaurantId, shiftId, req.user._id, token);
    }
    async selfCancelShift(restaurantId, shiftId, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.selfCancelShift(restaurantId, shiftId, req.user._id, token);
    }
    async requestSwap(restaurantId, shiftId, req, targetEmployeeId) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.requestSwap(restaurantId, shiftId, req.user._id, targetEmployeeId, token);
    }
    async acceptShift(restaurantId, shiftId, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.acceptShift(restaurantId, shiftId, req.user._id, token);
    }
    async declineShift(restaurantId, shiftId, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.declineShift(restaurantId, shiftId, req.user._id, token);
    }
    async checkIn(restaurantId, shiftId, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.checkIn(restaurantId, shiftId, req.user._id, token);
    }
    async checkOut(restaurantId, shiftId, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.checkOut(restaurantId, shiftId, req.user._id, token);
    }
    async getSummary(restaurantId, period, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.summary(restaurantId, period, undefined, req.user._id, token);
    }
    async getEmployeeSummary(restaurantId, employeeId, period, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.summary(restaurantId, period, employeeId, req.user._id, token);
    }
    async bulkCreate(restaurantId, body, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.bulkCreate(restaurantId, body.shifts, req.user._id, token);
    }
    async advancedFilter(restaurantId, query, req) {
        if (!req.user?._id)
            throw new common_1.ForbiddenException('No user');
        let token = req.headers['authorization'];
        if (!token) {
            token = req.cookies?.jwt;
            if (token) {
                token = `Bearer ${token}`;
            }
        }
        if (!token) {
            throw new common_1.ForbiddenException('Missing authorization token');
        }
        if (!token.startsWith('Bearer ')) {
            token = `Bearer ${token}`;
        }
        return this.service.advancedFilter(restaurantId, query, req.user._id, token);
    }
    async getUserRoleForRestaurant(restaurantId, userId, token) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://restaurant-service:3001/restaurants/${restaurantId}/check-role/${userId}`, { headers: { Authorization: token } }));
        return response.data?.role || null;
    }
};
exports.ShiftController = ShiftController;
__decorate([
    (0, common_1.Post)('shifts'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, common_2.RestaurantsDto.CreateShiftDto, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "createShift", null);
__decorate([
    (0, common_1.Get)('shifts'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getShifts", null);
__decorate([
    (0, common_1.Get)('employees/:employeeId/shifts'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getEmployeeShifts", null);
__decorate([
    (0, common_1.Get)('employees/:employeeId/shifts/by-day'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getEmployeeShiftsByDay", null);
__decorate([
    (0, common_1.Get)('shifts/by-day'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getAllShiftsByDay", null);
__decorate([
    (0, common_1.Get)('shifts/upcoming'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getUpcomingShifts", null);
__decorate([
    (0, common_1.Get)('shifts/history'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getHistoryShifts", null);
__decorate([
    (0, common_1.Patch)('shifts/:shiftId'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('shiftId')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, common_2.RestaurantsDto.UpdateShiftDto, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "updateShift", null);
__decorate([
    (0, common_1.Patch)('shifts/:shiftId/cancel'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('shiftId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "cancelShift", null);
__decorate([
    (0, common_1.Delete)('shifts/:shiftId'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('shiftId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "deleteShift", null);
__decorate([
    (0, common_1.Patch)('shifts/:shiftId/self-cancel'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('shiftId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "selfCancelShift", null);
__decorate([
    (0, common_1.Post)('shifts/:shiftId/request-swap'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('shiftId')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Body)('targetEmployeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "requestSwap", null);
__decorate([
    (0, common_1.Patch)('shifts/:shiftId/accept'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('shiftId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "acceptShift", null);
__decorate([
    (0, common_1.Patch)('shifts/:shiftId/decline'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('shiftId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "declineShift", null);
__decorate([
    (0, common_1.Patch)('shifts/:shiftId/check-in'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('shiftId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Patch)('shifts/:shiftId/check-out'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('shiftId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Get)('shifts/summary'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('period')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getSummary", null);
__decorate([
    (0, common_1.Get)('employees/:employeeId/shifts/summary'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('employeeId')),
    __param(2, (0, common_1.Query)('period')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "getEmployeeSummary", null);
__decorate([
    (0, common_1.Post)('shifts/bulk-create'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Get)('shifts/advanced-filter'),
    (0, restaurant_roles_decorator_1.RestaurantRoles)('owner', 'manager', 'employee'),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ShiftController.prototype, "advancedFilter", null);
exports.ShiftController = ShiftController = __decorate([
    (0, swagger_1.ApiTags)('Shifts'),
    (0, swagger_1.ApiCookieAuth)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, restaurant_roles_guard_1.RestaurantRolesGuard),
    (0, common_1.Controller)('restaurants/:restaurantId'),
    __metadata("design:paramtypes", [shift_service_1.ShiftService,
        axios_1.HttpService])
], ShiftController);
//# sourceMappingURL=shift.controller.js.map