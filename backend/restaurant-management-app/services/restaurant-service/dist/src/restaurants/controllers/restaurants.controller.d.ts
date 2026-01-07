import { RestaurantsService } from '../services/restaurants.service';
import { RestaurantsDto } from '@rm/common';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';
export declare class RestaurantsController {
    private readonly service;
    constructor(service: RestaurantsService);
    create(req: AuthRequest, dto: RestaurantsDto.CreateRestaurantDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/restaurant.schema").Restaurant> & import("../schemas/restaurant.schema").Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/restaurant.schema").Restaurant> & import("../schemas/restaurant.schema").Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/restaurant.schema").Restaurant> & import("../schemas/restaurant.schema").Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/restaurant.schema").Restaurant> & import("../schemas/restaurant.schema").Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/restaurant.schema").Restaurant> & import("../schemas/restaurant.schema").Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/restaurant.schema").Restaurant> & import("../schemas/restaurant.schema").Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    update(id: string, dto: RestaurantsDto.UpdateRestaurantDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/restaurant.schema").Restaurant> & import("../schemas/restaurant.schema").Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/restaurant.schema").Restaurant> & import("../schemas/restaurant.schema").Restaurant & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    delete(id: string): Promise<void>;
    assignManager(restaurantId: string, managerId: string): Promise<{
        success: boolean;
    }>;
    createTable(restaurantId: string, dto: RestaurantsDto.CreateTableDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getTables(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getTableById(restaurantId: string, tableId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getTableByNumber(restaurantId: string, tableNumber: number): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateTable(restaurantId: string, tableId: string, dto: RestaurantsDto.UpdateTableDTO): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteTable(restaurantId: string, tableId: string): Promise<import("mongoose").ModifyResult<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }> & import("mongoose").Document<unknown, {}, import("../schemas/table.schema").Table> & import("../schemas/table.schema").Table & {
        _id: import("mongoose").Types.ObjectId;
    }>>;
    createEmployee(restaurantId: string, dto: RestaurantsDto.CreateEmployeeDTO): Promise<import("mongoose").Document<unknown, {}, import("../schemas/employee-profile.schema").EmployeeProfileDocument> & import("../schemas/employee-profile.schema").EmployeeProfile & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    getAllEmployees(restaurantId: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/employee-profile.schema").EmployeeProfileDocument> & import("../schemas/employee-profile.schema").EmployeeProfile & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getEmployee(restaurantId: string, employeeId: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/employee-profile.schema").EmployeeProfileDocument> & import("../schemas/employee-profile.schema").EmployeeProfile & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateEmployee(restaurantId: string, employeeId: string, dto: RestaurantsDto.UpdateEmployeeDTO): Promise<import("mongoose").Document<unknown, {}, import("../schemas/employee-profile.schema").EmployeeProfileDocument> & import("../schemas/employee-profile.schema").EmployeeProfile & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteEmployee(restaurantId: string, employeeId: string): Promise<void>;
    checkUserRole(restaurantId: string, userId: string): Promise<{
        role: string;
    } | {
        role: null;
    }>;
}
