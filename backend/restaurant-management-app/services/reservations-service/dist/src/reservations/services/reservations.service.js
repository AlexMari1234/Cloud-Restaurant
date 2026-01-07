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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const reservation_schema_1 = require("../schemas/reservation.schema");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const crypto_1 = require("crypto");
function generateConfirmationCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = (0, crypto_1.randomBytes)(length);
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}
let ReservationsService = class ReservationsService {
    reservationModel;
    httpService;
    request;
    constructor(reservationModel, httpService, request) {
        this.reservationModel = reservationModel;
        this.httpService = httpService;
        this.request = request;
    }
    getAuthHeaders() {
        const authHeader = this.request.headers['authorization'];
        const jwtFromCookie = this.request.cookies?.jwt;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : jwtFromCookie;
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
    async getAvailableTimeSlots(dto) {
        const { restaurantId, tableNumber, date, guests } = dto;
        const requestedDate = new Date(date);
        const now = new Date();
        const restaurantResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://restaurant-service:3001/restaurants/${restaurantId}`, { headers: this.getAuthHeaders() }));
        const restaurant = restaurantResponse.data;
        if (!restaurant) {
            throw new common_1.NotFoundException('Restaurant not found');
        }
        const tableResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://restaurant-service:3001/restaurants/${restaurantId}/tables/number/${tableNumber}`, { headers: this.getAuthHeaders() }));
        const table = tableResponse.data;
        if (!table) {
            throw new common_1.NotFoundException('Table not found');
        }
        if (table.capacity < guests) {
            throw new common_1.BadRequestException('Table capacity is insufficient for party size');
        }
        const dayOfWeek = requestedDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
        if (restaurant.closedDays?.includes(dayOfWeek)) {
            throw new common_1.BadRequestException('Restaurant is closed on this day');
        }
        if (table.unavailableDays?.includes(dayOfWeek)) {
            throw new common_1.BadRequestException('Table is not available on this day');
        }
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);
        const existingReservations = await this.reservationModel.find({
            tableId: new mongoose_2.Types.ObjectId(table._id),
            reservationTime: { $gte: startOfDay, $lte: endOfDay },
            status: { $nin: ['cancelled', 'completed'] },
        });
        const timeSlots = [];
        const reservationDuration = restaurant.reservationDuration || 90;
        const timeSlotInterval = restaurant.timeSlotInterval || 30;
        const openingHour = restaurant.openingHour;
        const closingHour = restaurant.closingHour;
        const minReservationTime = table.minReservationTime ?? openingHour;
        const maxReservationTime = table.maxReservationTime ?? closingHour - (reservationDuration / 60);
        for (let hour = minReservationTime; hour <= maxReservationTime; hour += timeSlotInterval / 60) {
            const slotTime = new Date(requestedDate);
            slotTime.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
            const slotEndTime = new Date(slotTime.getTime() + reservationDuration * 60000);
            if (slotTime < now)
                continue;
            const hasOverlap = existingReservations.some(reservation => {
                const resStart = new Date(reservation.reservationTime);
                const resEnd = new Date(reservation.endTime);
                return ((slotTime >= resStart && slotTime < resEnd) ||
                    (slotEndTime > resStart && slotEndTime <= resEnd) ||
                    (slotTime <= resStart && slotEndTime >= resEnd));
            });
            if (!hasOverlap) {
                timeSlots.push(slotTime.toISOString());
            }
        }
        return timeSlots;
    }
    async createReservation(createReservationDto) {
        console.log('Received DTO:', createReservationDto);
        const { restaurantId, tableNumber, guests, reservationTime, specialRequests, customerName, customerPhone, customerEmail } = createReservationDto;
        console.log('Extracted values:', { restaurantId, tableNumber, guests, reservationTime, specialRequests, customerName, customerPhone, customerEmail });
        const reservationDate = new Date(reservationTime);
        const now = new Date();
        if (reservationDate < now) {
            throw new common_1.BadRequestException('Cannot make a reservation in the past');
        }
        console.log('Parsed reservation date:', reservationDate);
        console.log('Making request to restaurant service...');
        const restaurantResponse = await (0, rxjs_1.firstValueFrom)(this.httpService
            .get(`http://restaurant-service:3001/restaurants/${restaurantId}`, {
            headers: this.getAuthHeaders(),
        })
            .pipe((0, operators_1.map)((response) => response.data)));
        const restaurant = restaurantResponse;
        console.log('Restaurant found:', restaurant);
        console.log('Getting table info...');
        const tableResponse = await (0, rxjs_1.firstValueFrom)(this.httpService
            .get(`http://restaurant-service:3001/restaurants/${restaurantId}/tables/number/${tableNumber}`, {
            headers: this.getAuthHeaders(),
        })
            .pipe((0, operators_1.map)((response) => response.data)));
        const table = tableResponse;
        console.log('Table found:', table);
        if (guests > table.capacity) {
            throw new common_1.BadRequestException(`Table ${tableNumber} can only accommodate ${table.capacity} guests`);
        }
        const dayOfWeek = reservationDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
        if (restaurant.closedDays?.includes(dayOfWeek)) {
            throw new common_1.BadRequestException(`Restaurant is closed on ${dayOfWeek}`);
        }
        if (table.unavailableDays?.includes(dayOfWeek)) {
            throw new common_1.BadRequestException(`Table ${tableNumber} is not available on ${dayOfWeek}`);
        }
        const reservationHour = reservationDate.getHours();
        if (reservationHour < restaurant.openingHour || reservationHour >= restaurant.closingHour) {
            throw new common_1.BadRequestException(`Reservation time must be between ${restaurant.openingHour}:00 and ${restaurant.closingHour}:00`);
        }
        if ((table.minReservationTime && reservationHour < table.minReservationTime) ||
            (table.maxReservationTime && reservationHour >= table.maxReservationTime)) {
            throw new common_1.BadRequestException(`Table ${tableNumber} is only available between ${table.minReservationTime}:00 and ${table.maxReservationTime}:00`);
        }
        const endTime = new Date(reservationDate);
        endTime.setMinutes(endTime.getMinutes() + (restaurant.reservationDuration || 120));
        const existingReservation = await this.reservationModel.findOne({
            tableId: new mongoose_2.Types.ObjectId(table._id),
            reservationTime: { $lt: endTime },
            endTime: { $gt: reservationDate },
            status: { $nin: ['cancelled', 'completed'] },
        });
        if (existingReservation) {
            throw new common_1.BadRequestException('Table is already reserved for this time slot');
        }
        const userId = this.request.user?._id;
        if (!userId) {
            throw new common_1.BadRequestException('User ID is required to create a reservation');
        }
        const confirmationCode = generateConfirmationCode();
        const reservation = await this.reservationModel.create({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            tableId: new mongoose_2.Types.ObjectId(table._id),
            userId: new mongoose_2.Types.ObjectId(userId),
            partySize: guests,
            reservationTime: reservationDate,
            endTime,
            specialRequests,
            customerName,
            customerPhone,
            customerEmail,
            confirmationCode,
            status: 'pending',
        });
        return reservation;
    }
    async getReservation(id) {
        const reservation = await this.reservationModel.findById(id);
        if (!reservation) {
            throw new common_1.NotFoundException('Reservation not found');
        }
        return reservation;
    }
    async updateReservationStatus(id, status) {
        const reservation = await this.reservationModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!reservation) {
            throw new common_1.NotFoundException('Reservation not found');
        }
        return reservation;
    }
    async getRestaurantReservations(restaurantId, date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.reservationModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            reservationTime: { $gte: startOfDay, $lte: endOfDay },
        });
    }
    async getUserReservations(userId) {
        return this.reservationModel.find({
            userId: new mongoose_2.Types.ObjectId(userId),
        });
    }
    async getTableReservations(restaurantId, tableNumber, date) {
        const tableResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://restaurant-service:3001/restaurants/${restaurantId}/tables/number/${tableNumber}`, { headers: this.getAuthHeaders() }));
        const table = tableResponse.data;
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.reservationModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            tableId: new mongoose_2.Types.ObjectId(table._id),
            reservationTime: { $gte: startOfDay, $lte: endOfDay },
        });
    }
    async cancelReservation(id) {
        const reservation = await this.reservationModel.findById(id);
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        const userId = this.request.user?._id;
        if (!userId || !reservation.userId || reservation.userId.toString() !== userId.toString()) {
            throw new common_1.ForbiddenException('You can only cancel your own reservation');
        }
        if (reservation.status === 'cancelled') {
            throw new common_1.BadRequestException('Reservation is already cancelled');
        }
        const now = new Date();
        if (reservation.reservationTime < now) {
            throw new common_1.BadRequestException('Cannot cancel a reservation that has already started');
        }
        reservation.status = 'cancelled';
        await reservation.save();
        return reservation;
    }
    async completeReservation(id) {
        const reservation = await this.reservationModel.findById(id);
        if (!reservation)
            throw new common_1.NotFoundException('Reservation not found');
        if (reservation.status === 'completed') {
            throw new common_1.BadRequestException('Reservation is already completed');
        }
        reservation.status = 'completed';
        await reservation.save();
        return reservation;
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(reservation_schema_1.Reservation.name)),
    __param(2, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        axios_1.HttpService, Object])
], ReservationsService);
function nanoid(arg0) {
    throw new Error('Function not implemented.');
}
//# sourceMappingURL=reservations.service.js.map