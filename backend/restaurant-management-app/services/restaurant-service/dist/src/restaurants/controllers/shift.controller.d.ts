import { ShiftService } from '../services/shift.service';
import { RestaurantsDto } from '@rm/common';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';
import { HttpService } from '@nestjs/axios';
export declare class ShiftController {
    private readonly service;
    private readonly httpService;
    constructor(service: ShiftService, httpService: HttpService);
    createShift(restaurantId: string, dto: RestaurantsDto.CreateShiftDto, req: AuthRequest): Promise<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getShifts(restaurantId: string, req: AuthRequest): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getEmployeeShifts(restaurantId: string, employeeId: string, req: AuthRequest): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getEmployeeShiftsByDay(restaurantId: string, employeeId: string, date: string, req: AuthRequest): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getAllShiftsByDay(restaurantId: string, date: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getUpcomingShifts(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getHistoryShifts(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    updateShift(restaurantId: string, shiftId: string, dto: RestaurantsDto.UpdateShiftDto, req: AuthRequest): Promise<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    cancelShift(restaurantId: string, shiftId: string, req: AuthRequest): Promise<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteShift(restaurantId: string, shiftId: string, req: AuthRequest): Promise<import("mongoose").ModifyResult<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    selfCancelShift(restaurantId: string, shiftId: string, req: AuthRequest): Promise<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    requestSwap(restaurantId: string, shiftId: string, req: AuthRequest, targetEmployeeId: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    acceptShift(restaurantId: string, shiftId: string, req: AuthRequest): Promise<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    declineShift(restaurantId: string, shiftId: string, req: AuthRequest): Promise<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    checkIn(restaurantId: string, shiftId: string, req: AuthRequest): Promise<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    checkOut(restaurantId: string, shiftId: string, req: AuthRequest): Promise<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getSummary(restaurantId: string, period: string, req: AuthRequest): Promise<{
        totalShifts: number;
        completed: number;
        canceled: number;
        totalHours: number;
    }>;
    getEmployeeSummary(restaurantId: string, employeeId: string, period: string, req: AuthRequest): Promise<{
        totalShifts: number;
        completed: number;
        canceled: number;
        totalHours: number;
    }>;
    bulkCreate(restaurantId: string, body: {
        shifts: any[];
    }, req: AuthRequest): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, Omit<any, "_id">>[]>;
    advancedFilter(restaurantId: string, query: any, req: AuthRequest): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/shift.schema").ShiftDocument> & import("../schemas/shift.schema").Shift & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getUserRoleForRestaurant(restaurantId: string, userId: string, token: string): Promise<'owner' | 'manager' | 'employee' | null>;
}
