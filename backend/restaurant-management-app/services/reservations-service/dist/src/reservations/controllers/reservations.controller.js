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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const reservations_service_1 = require("../services/reservations.service");
const common_2 = require("@rm/common");
const guards_1 = require("../../auth/guards");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
let ReservationsController = class ReservationsController {
    reservationsService;
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    async createReservation(dto) {
        return this.reservationsService.createReservation(dto);
    }
    async getAvailableTimeSlots(dto) {
        return this.reservationsService.getAvailableTimeSlots(dto);
    }
    async getReservation(id) {
        return this.reservationsService.getReservation(id);
    }
    async updateReservationStatus(id, status) {
        return this.reservationsService.updateReservationStatus(id, status);
    }
    async getRestaurantReservations(restaurantId, date) {
        return this.reservationsService.getRestaurantReservations(restaurantId, new Date(date));
    }
    async getUserReservations(userId) {
        return this.reservationsService.getUserReservations(userId);
    }
    async getTableReservations(restaurantId, tableNumber, date) {
        return this.reservationsService.getTableReservations(restaurantId, Number(tableNumber), new Date(date));
    }
    async cancelReservation(id) {
        return this.reservationsService.cancelReservation(id);
    }
    async completeReservation(id) {
        return this.reservationsService.completeReservation(id);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new reservation' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Reservation created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurant or table not found' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ReservationsDto.CreateReservationDTO]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "createReservation", null);
__decorate([
    (0, common_1.Get)('available-slots'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available time slots for a table' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns list of available time slots' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Restaurant or table not found' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [common_2.ReservationsDto.GetAvailableTimeSlotsDTO]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getAvailableTimeSlots", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a reservation by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns the reservation' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reservation not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getReservation", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Update reservation status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Status updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Reservation not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "updateReservationStatus", null);
__decorate([
    (0, common_1.Get)('restaurant/:restaurantId'),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reservations for a restaurant on a specific date' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns list of reservations' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getRestaurantReservations", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reservations for a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns list of reservations' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getUserReservations", null);
__decorate([
    (0, common_1.Get)('restaurant/:restaurantId/table/:tableNumber'),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all reservations for a table in a restaurant on a specific day' }),
    __param(0, (0, common_1.Param)('restaurantId')),
    __param(1, (0, common_1.Param)('tableNumber')),
    __param(2, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getTableReservations", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a reservation (user only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "cancelReservation", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, roles_decorator_1.Roles)('owner', 'manager'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark reservation as completed (owner/manager only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "completeReservation", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, swagger_1.ApiTags)('reservations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('reservations'),
    (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
//# sourceMappingURL=reservations.controller.js.map