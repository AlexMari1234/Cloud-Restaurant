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
exports.ShiftService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const shift_schema_1 = require("../schemas/shift.schema");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const employee_profile_schema_1 = require("../schemas/employee-profile.schema");
let ShiftService = class ShiftService {
    shiftModel;
    employeeProfileModel;
    httpService;
    constructor(shiftModel, employeeProfileModel, httpService) {
        this.shiftModel = shiftModel;
        this.employeeProfileModel = employeeProfileModel;
        this.httpService = httpService;
    }
    async getUserRoleForRestaurant(restaurantId, userId, token) {
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`http://restaurant-service:3001/restaurants/${restaurantId}/check-role/${userId}`, { headers: { Authorization: token } }));
            const role = response.data?.role;
            if (!role) {
                throw new common_1.ForbiddenException('User has no role in this restaurant');
            }
            return role;
        }
        catch (error) {
            console.error('Error checking restaurant role:', error);
            throw new common_1.ForbiddenException('Could not verify restaurant role');
        }
    }
    async getEmployeeProfileForUser(restaurantId, userId) {
        return this.employeeProfileModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId)
        }).exec();
    }
    async verifyEmployeeAccess(restaurantId, employeeId, userId, token) {
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            if (employeeProfileId.toString() !== employeeId) {
                throw new common_1.ForbiddenException('You can only access your own shifts');
            }
        }
    }
    async verifyShiftOwnership(restaurantId, shiftId, userId, token) {
        const shift = await this.shiftModel.findById(shiftId);
        if (!shift) {
            throw new common_1.NotFoundException('Shift not found');
        }
        if (shift.restaurantId.toString() !== restaurantId) {
            throw new common_1.ForbiddenException('Shift does not belong to this restaurant');
        }
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            const shiftEmployeeId = shift.employeeId;
            if (shiftEmployeeId.toString() !== employeeProfileId.toString()) {
                throw new common_1.ForbiddenException('You can only modify your own shifts');
            }
        }
    }
    async getEmployeeProfileIdForUser(restaurantId, userId) {
        const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
        if (!employeeProfile) {
            return null;
        }
        const employeeProfileId = employeeProfile._id;
        return employeeProfileId.toString();
    }
    async create(dto) {
        const overlap = await this.shiftModel.findOne({
            employeeId: new mongoose_2.Types.ObjectId(dto.employeeId),
            restaurantId: new mongoose_2.Types.ObjectId(dto.restaurantId),
            $or: [
                { startTime: { $lt: dto.endTime }, endTime: { $gt: dto.startTime } },
            ],
        });
        if (overlap) {
            throw new common_1.BadRequestException('Shift overlaps with an existing shift for this employee');
        }
        const shiftToCreate = {
            ...dto,
            employeeId: new mongoose_2.Types.ObjectId(dto.employeeId),
            restaurantId: new mongoose_2.Types.ObjectId(dto.restaurantId),
            status: 'pending',
        };
        return this.shiftModel.create(shiftToCreate);
    }
    async findAll(restaurantId) {
        return this.shiftModel.find({ restaurantId: new mongoose_2.Types.ObjectId(restaurantId) });
    }
    async findByEmployee(restaurantId, employeeId, userId, token) {
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            if (employeeProfileId.toString() !== employeeId) {
                throw new common_1.ForbiddenException('You can only view your own shifts');
            }
        }
        return this.shiftModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
        });
    }
    async findOne(shiftId, restaurantId, userId, token) {
        await this.verifyShiftOwnership(restaurantId, shiftId, userId, token);
        const shift = await this.shiftModel.findById(shiftId);
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        return shift;
    }
    async update(restaurantId, shiftId, dto, userId, token) {
        await this.verifyShiftOwnership(restaurantId, shiftId, userId, token);
        const shift = await this.shiftModel.findOneAndUpdate({ _id: shiftId, restaurantId: new mongoose_2.Types.ObjectId(restaurantId) }, dto, { new: true });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        return shift;
    }
    async delete(restaurantId, shiftId, userId, token) {
        await this.verifyShiftOwnership(restaurantId, shiftId, userId, token);
        const shift = await this.shiftModel.findOneAndDelete({
            _id: shiftId,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        return shift;
    }
    async findByEmployeeAndDay(restaurantId, employeeId, date, userId, token) {
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            if (employeeProfileId.toString() !== employeeId) {
                throw new common_1.ForbiddenException('You can only view your own shifts');
            }
        }
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return this.shiftModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            employeeId: new mongoose_2.Types.ObjectId(employeeId),
            startTime: { $gte: start, $lte: end },
        });
    }
    async findAllByDay(restaurantId, date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return this.shiftModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            startTime: { $gte: start, $lte: end },
        });
    }
    async findUpcoming(restaurantId) {
        const now = new Date();
        return this.shiftModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            startTime: { $gte: now },
        });
    }
    async findHistory(restaurantId) {
        const now = new Date();
        return this.shiftModel.find({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            endTime: { $lt: now },
        });
    }
    async cancelShift(restaurantId, shiftId, userId, token) {
        await this.verifyShiftOwnership(restaurantId, shiftId, userId, token);
        const shift = await this.shiftModel.findOneAndUpdate({ _id: shiftId, restaurantId: new mongoose_2.Types.ObjectId(restaurantId) }, { status: 'canceled' }, { new: true });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        return shift;
    }
    async selfCancelShift(restaurantId, shiftId, userId, token) {
        const shift = await this.shiftModel.findOne({
            _id: shiftId,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            if (shift.employeeId.toString() !== employeeProfileId.toString()) {
                throw new common_1.ForbiddenException('You can only cancel your own shifts');
            }
        }
        else if (userRole === 'manager' || userRole === 'owner') {
        }
        else {
            throw new common_1.ForbiddenException('You do not have permission to cancel this shift');
        }
        if (shift.status === 'canceled')
            throw new common_1.BadRequestException('Already canceled');
        shift.status = 'canceled';
        await shift.save();
        return shift;
    }
    async requestSwap(restaurantId, shiftId, userId, targetEmployeeId, token) {
        const shift = await this.shiftModel.findOne({
            _id: shiftId,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            if (shift.employeeId.toString() !== employeeProfileId.toString()) {
                throw new common_1.ForbiddenException('You can only request swap for your own shifts');
            }
        }
        else if (userRole === 'manager' || userRole === 'owner') {
        }
        else {
            throw new common_1.ForbiddenException('You do not have permission to request swap for this shift');
        }
        shift.status = 'swap_requested';
        shift.swapTarget = new mongoose_2.Types.ObjectId(targetEmployeeId);
        await shift.save();
        return shift;
    }
    async acceptShift(restaurantId, shiftId, userId, token) {
        const shift = await this.shiftModel.findOne({
            _id: shiftId,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            if (shift.employeeId.toString() !== employeeProfileId.toString()) {
                throw new common_1.ForbiddenException('You can only accept your own shifts');
            }
        }
        else if (userRole === 'manager' || userRole === 'owner') {
        }
        else {
            throw new common_1.ForbiddenException('You do not have permission to accept this shift');
        }
        shift.status = 'accepted';
        await shift.save();
        return shift;
    }
    async declineShift(restaurantId, shiftId, userId, token) {
        const shift = await this.shiftModel.findOne({
            _id: shiftId,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            if (shift.employeeId.toString() !== employeeProfileId.toString()) {
                throw new common_1.ForbiddenException('You can only decline your own shifts');
            }
        }
        else if (userRole === 'manager' || userRole === 'owner') {
        }
        else {
            throw new common_1.ForbiddenException('You do not have permission to decline this shift');
        }
        shift.status = 'declined';
        await shift.save();
        return shift;
    }
    async checkIn(restaurantId, shiftId, userId, token) {
        const shift = await this.shiftModel.findOne({
            _id: shiftId,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            if (shift.employeeId.toString() !== employeeProfileId.toString()) {
                throw new common_1.ForbiddenException('You can only check-in to your own shifts');
            }
        }
        else if (userRole === 'manager' || userRole === 'owner') {
        }
        else {
            throw new common_1.ForbiddenException('You do not have permission to check-in to this shift');
        }
        if (shift.checkInTime)
            throw new common_1.BadRequestException('Already checked in');
        shift.checkInTime = new Date();
        await shift.save();
        return shift;
    }
    async checkOut(restaurantId, shiftId, userId, token) {
        const shift = await this.shiftModel.findOne({
            _id: shiftId,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!shift)
            throw new common_1.NotFoundException('Shift not found');
        const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (userRole === 'employee') {
            const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
            if (!employeeProfile) {
                throw new common_1.ForbiddenException('Employee profile not found');
            }
            const employeeProfileId = employeeProfile._id;
            if (shift.employeeId.toString() !== employeeProfileId.toString()) {
                throw new common_1.ForbiddenException('You can only check-out from your own shifts');
            }
        }
        else if (userRole === 'manager' || userRole === 'owner') {
        }
        else {
            throw new common_1.ForbiddenException('You do not have permission to check-out from this shift');
        }
        if (!shift.checkInTime)
            throw new common_1.BadRequestException('Must check in first');
        if (shift.checkOutTime)
            throw new common_1.BadRequestException('Already checked out');
        shift.checkOutTime = new Date();
        await shift.save();
        return shift;
    }
    async summary(restaurantId, period, employeeId, userId, token) {
        if (employeeId && userId && token) {
            await this.verifyEmployeeAccess(restaurantId, employeeId, userId, token);
        }
        const match = { restaurantId: new mongoose_2.Types.ObjectId(restaurantId) };
        if (employeeId)
            match.employeeId = new mongoose_2.Types.ObjectId(employeeId);
        const totalShifts = await this.shiftModel.countDocuments(match);
        const completed = await this.shiftModel.countDocuments({ ...match, status: 'completed' });
        const canceled = await this.shiftModel.countDocuments({ ...match, status: 'canceled' });
        const shifts = await this.shiftModel.find({
            ...match,
            checkInTime: { $exists: true },
            checkOutTime: { $exists: true }
        });
        let totalHours = 0;
        for (const s of shifts) {
            totalHours += (s.checkOutTime - s.checkInTime) / 3600000;
        }
        return { totalShifts, completed, canceled, totalHours };
    }
    async bulkCreate(restaurantId, shifts, userId, token) {
        const role = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (role !== 'manager' && role !== 'owner') {
            throw new common_1.ForbiddenException('Only managers and owners can bulk create shifts');
        }
        const docs = shifts.map(s => ({
            ...s,
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            employeeId: new mongoose_2.Types.ObjectId(s.employeeId),
            status: 'pending',
        }));
        return this.shiftModel.insertMany(docs);
    }
    async advancedFilter(restaurantId, filters, userId, token) {
        const role = await this.getUserRoleForRestaurant(restaurantId, userId, token);
        if (role !== 'manager' && role !== 'owner' && role !== 'employee') {
            throw new common_1.ForbiddenException('Invalid role for this operation');
        }
        const query = { restaurantId: new mongoose_2.Types.ObjectId(restaurantId) };
        if (filters.status)
            query.status = filters.status;
        if (filters.employeeId) {
            if (role === 'employee') {
                const employeeProfileId = await this.getEmployeeProfileIdForUser(restaurantId, userId);
                if (employeeProfileId !== filters.employeeId) {
                    throw new common_1.ForbiddenException('You can only filter your own shifts');
                }
            }
            query.employeeId = new mongoose_2.Types.ObjectId(filters.employeeId);
        }
        if (filters.date) {
            const start = new Date(filters.date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(filters.date);
            end.setHours(23, 59, 59, 999);
            query.startTime = { $gte: start, $lte: end };
        }
        return this.shiftModel.find(query);
    }
};
exports.ShiftService = ShiftService;
exports.ShiftService = ShiftService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(shift_schema_1.Shift.name)),
    __param(1, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        axios_1.HttpService])
], ShiftService);
//# sourceMappingURL=shift.service.js.map