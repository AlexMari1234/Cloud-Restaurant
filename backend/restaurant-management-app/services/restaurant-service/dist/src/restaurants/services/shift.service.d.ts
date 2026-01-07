import { Model, Types } from 'mongoose';
import { Shift, ShiftDocument } from '../schemas/shift.schema';
import { RestaurantsDto } from '@rm/common';
import { HttpService } from '@nestjs/axios';
import { EmployeeProfileDocument } from '../schemas/employee-profile.schema';
export declare class ShiftService {
    private readonly shiftModel;
    private readonly employeeProfileModel;
    private readonly httpService;
    constructor(shiftModel: Model<ShiftDocument>, employeeProfileModel: Model<EmployeeProfileDocument>, httpService: HttpService);
    private getUserRoleForRestaurant;
    private getEmployeeProfileForUser;
    private verifyEmployeeAccess;
    private verifyShiftOwnership;
    getEmployeeProfileIdForUser(restaurantId: string, userId: string): Promise<string | null>;
    create(dto: RestaurantsDto.CreateShiftDto & {
        restaurantId: string;
    }): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    findAll(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
    findByEmployee(restaurantId: string, employeeId: string, userId: string, token: string): Promise<(import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
    findOne(shiftId: string, restaurantId: string, userId: string, token: string): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    update(restaurantId: string, shiftId: string, dto: RestaurantsDto.UpdateShiftDto, userId: string, token: string): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    delete(restaurantId: string, shiftId: string, userId: string, token: string): Promise<import("mongoose").ModifyResult<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>>;
    findByEmployeeAndDay(restaurantId: string, employeeId: string, date: string, userId: string, token: string): Promise<(import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
    findAllByDay(restaurantId: string, date: string): Promise<(import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
    findUpcoming(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
    findHistory(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
    cancelShift(restaurantId: string, shiftId: string, userId: string, token: string): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    selfCancelShift(restaurantId: string, shiftId: string, userId: string, token: string): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    requestSwap(restaurantId: string, shiftId: string, userId: string, targetEmployeeId: string, token: string): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    acceptShift(restaurantId: string, shiftId: string, userId: string, token: string): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    declineShift(restaurantId: string, shiftId: string, userId: string, token: string): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    checkIn(restaurantId: string, shiftId: string, userId: string, token: string): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    checkOut(restaurantId: string, shiftId: string, userId: string, token: string): Promise<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    summary(restaurantId: string, period: string, employeeId?: string, userId?: string, token?: string): Promise<{
        totalShifts: number;
        completed: number;
        canceled: number;
        totalHours: number;
    }>;
    bulkCreate(restaurantId: string, shifts: any[], userId: string, token: string): Promise<import("mongoose").MergeType<import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }, Omit<any, "_id">>[]>;
    advancedFilter(restaurantId: string, filters: any, userId: string, token: string): Promise<(import("mongoose").Document<unknown, {}, ShiftDocument> & Shift & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
}
