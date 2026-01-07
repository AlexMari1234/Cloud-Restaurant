import { Model, Types } from 'mongoose';
import { Restaurant, RestaurantDocument } from '../schemas/restaurant.schema';
import { RoleBindingDocument } from '../schemas/role-binding.schema';
import { Table, TableDocument } from '../schemas/table.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../schemas/employee-profile.schema';
import { RestaurantsDto } from '@rm/common';
export declare class RestaurantsService {
    private readonly restaurantModel;
    private readonly roleBindingModel;
    private readonly tableModel;
    private readonly employeeModel;
    constructor(restaurantModel: Model<RestaurantDocument>, roleBindingModel: Model<RoleBindingDocument>, tableModel: Model<TableDocument>, employeeModel: Model<EmployeeProfileDocument>);
    create(ownerId: string, dto: RestaurantsDto.CreateRestaurantDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Restaurant> & Restaurant & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Restaurant> & Restaurant & {
        _id: Types.ObjectId;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Restaurant> & Restaurant & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Restaurant> & Restaurant & {
        _id: Types.ObjectId;
    })[]>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Restaurant> & Restaurant & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Restaurant> & Restaurant & {
        _id: Types.ObjectId;
    }>;
    update(id: string, dto: RestaurantsDto.UpdateRestaurantDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Restaurant> & Restaurant & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Restaurant> & Restaurant & {
        _id: Types.ObjectId;
    }>;
    delete(id: string): Promise<void>;
    assignManager(restaurantId: string, managerId: string): Promise<{
        success: boolean;
    }>;
    createTable(restaurantId: string, dto: RestaurantsDto.CreateTableDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }>;
    findAllTables(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    })[]>;
    findTableById(restaurantId: string, tableId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }>;
    findTableByNumber(restaurantId: string, tableNumber: number): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }>;
    updateTable(restaurantId: string, tableId: string, dto: RestaurantsDto.UpdateTableDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }>;
    deleteTable(restaurantId: string, tableId: string): Promise<import("mongoose").ModifyResult<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, Table> & Table & {
        _id: Types.ObjectId;
    }>>;
    createEmployee(restaurantId: string, dto: RestaurantsDto.CreateEmployeeDTO): Promise<import("mongoose").Document<unknown, {}, EmployeeProfileDocument> & EmployeeProfile & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    findAllEmployees(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, EmployeeProfileDocument> & EmployeeProfile & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    })[]>;
    findEmployeeById(restaurantId: string, employeeId: string): Promise<import("mongoose").Document<unknown, {}, EmployeeProfileDocument> & EmployeeProfile & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    updateEmployee(restaurantId: string, employeeId: string, dto: RestaurantsDto.UpdateEmployeeDTO): Promise<import("mongoose").Document<unknown, {}, EmployeeProfileDocument> & EmployeeProfile & import("mongoose").Document<any, any, any> & {
        _id: Types.ObjectId;
    }>;
    deleteEmployee(restaurantId: string, employeeId: string): Promise<void>;
    checkUserRole(restaurantId: string, userId: string): Promise<{
        role: string;
    } | {
        role: null;
    }>;
}
