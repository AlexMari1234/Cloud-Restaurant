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
exports.RestaurantsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const restaurant_schema_1 = require("../schemas/restaurant.schema");
const role_binding_schema_1 = require("../schemas/role-binding.schema");
const table_schema_1 = require("../schemas/table.schema");
const employee_profile_schema_1 = require("../schemas/employee-profile.schema");
const mongo_1 = require("../../utils/mongo");
let RestaurantsService = class RestaurantsService {
    restaurantModel;
    roleBindingModel;
    tableModel;
    employeeModel;
    constructor(restaurantModel, roleBindingModel, tableModel, employeeModel) {
        this.restaurantModel = restaurantModel;
        this.roleBindingModel = roleBindingModel;
        this.tableModel = tableModel;
        this.employeeModel = employeeModel;
    }
    async create(ownerId, dto) {
        return this.restaurantModel.create({
            ownerId,
            ...dto,
            geo: dto.geo,
        });
    }
    async findAll() {
        return this.restaurantModel.find();
    }
    async findById(id) {
        const doc = await this.restaurantModel.findById(id);
        if (!doc)
            throw new common_1.NotFoundException('Restaurant not found');
        return doc;
    }
    async update(id, dto) {
        const updated = await this.restaurantModel.findByIdAndUpdate(id, {
            ...dto,
            ...(dto.geo && { geo: dto.geo }),
        }, { new: true });
        if (!updated)
            throw new common_1.NotFoundException('Restaurant not found');
        return updated;
    }
    async delete(id) {
        const deleted = await this.restaurantModel.findByIdAndDelete(id);
        if (!deleted)
            throw new common_1.NotFoundException('Restaurant not found');
        await this.roleBindingModel.deleteMany({
            resourceId: id,
            resourceType: 'restaurant',
        });
    }
    async assignManager(restaurantId, managerId) {
        const restaurant = await this.restaurantModel.findById(restaurantId);
        if (!restaurant)
            throw new common_1.NotFoundException('Restaurant not found');
        restaurant.managerId = managerId;
        await restaurant.save();
        const existingBinding = await this.roleBindingModel.findOne({
            userId: managerId,
            role: 'manager',
            resourceType: 'restaurant',
            resourceId: restaurantId,
        });
        if (!existingBinding) {
            await this.roleBindingModel.create({
                userId: managerId,
                role: 'manager',
                resourceType: 'restaurant',
                resourceId: restaurantId,
            });
        }
        return { success: true };
    }
    async createTable(restaurantId, dto) {
        const restId = (0, mongo_1.toObjectId)(restaurantId);
        const restaurant = await this.restaurantModel.findById(restId);
        if (!restaurant)
            throw new common_1.NotFoundException('Restaurant not found');
        return this.tableModel.create({
            ...dto,
            restaurantId: restId,
        });
    }
    async findAllTables(restaurantId) {
        return this.tableModel.find({ restaurantId: (0, mongo_1.toObjectId)(restaurantId) });
    }
    async findTableById(restaurantId, tableId) {
        const table = await this.tableModel.findOne({
            _id: (0, mongo_1.toObjectId)(tableId),
            restaurantId: (0, mongo_1.toObjectId)(restaurantId),
        });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        return table;
    }
    async findTableByNumber(restaurantId, tableNumber) {
        const table = await this.tableModel.findOne({
            number: tableNumber,
            restaurantId: (0, mongo_1.toObjectId)(restaurantId),
        });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        return table;
    }
    async updateTable(restaurantId, tableId, dto) {
        const updated = await this.tableModel.findOneAndUpdate({
            _id: (0, mongo_1.toObjectId)(tableId),
            restaurantId: (0, mongo_1.toObjectId)(restaurantId),
        }, dto, { new: true });
        if (!updated)
            throw new common_1.NotFoundException('Table not found');
        return updated;
    }
    async deleteTable(restaurantId, tableId) {
        const deleted = await this.tableModel.findOneAndDelete({
            _id: (0, mongo_1.toObjectId)(tableId),
            restaurantId: (0, mongo_1.toObjectId)(restaurantId),
        });
        if (!deleted)
            throw new common_1.NotFoundException('Table not found');
        return deleted;
    }
    async createEmployee(restaurantId, dto) {
        const restaurant = await this.restaurantModel.findById(restaurantId);
        if (!restaurant)
            throw new common_1.NotFoundException('Restaurant not found');
        const exists = await this.employeeModel.findOne({
            userId: new mongoose_2.Types.ObjectId(dto.userId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (exists) {
            throw new common_1.BadRequestException('User is already an employee at this restaurant');
        }
        const employee = await this.employeeModel.create({
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
            userId: new mongoose_2.Types.ObjectId(dto.userId),
            roleLabel: dto.roleLabel,
            hourlyRate: dto.hourlyRate,
            status: 'active',
            hireDate: new Date(),
        });
        await this.roleBindingModel.updateOne({
            userId: new mongoose_2.Types.ObjectId(dto.userId),
            resourceId: new mongoose_2.Types.ObjectId(restaurantId),
            resourceType: 'restaurant',
        }, {
            $set: {
                role: 'employee',
                userId: new mongoose_2.Types.ObjectId(dto.userId),
                resourceId: new mongoose_2.Types.ObjectId(restaurantId),
                resourceType: 'restaurant',
            },
        }, { upsert: true });
        return employee;
    }
    async findAllEmployees(restaurantId) {
        return this.employeeModel.find({ restaurantId: new mongoose_2.Types.ObjectId(restaurantId) });
    }
    async findEmployeeById(restaurantId, employeeId) {
        const emp = await this.employeeModel.findOne({ _id: new mongoose_2.Types.ObjectId(employeeId), restaurantId: new mongoose_2.Types.ObjectId(restaurantId) });
        if (!emp)
            throw new common_1.NotFoundException('Employee not found');
        return emp;
    }
    async updateEmployee(restaurantId, employeeId, dto) {
        const updated = await this.employeeModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(employeeId), restaurantId: new mongoose_2.Types.ObjectId(restaurantId) }, dto, { new: true });
        if (!updated)
            throw new common_1.NotFoundException('Employee not found');
        return updated;
    }
    async deleteEmployee(restaurantId, employeeId) {
        const employee = await this.employeeModel.findOne({
            _id: new mongoose_2.Types.ObjectId(employeeId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        await this.employeeModel.findOneAndDelete({
            _id: new mongoose_2.Types.ObjectId(employeeId),
            restaurantId: new mongoose_2.Types.ObjectId(restaurantId),
        });
        await this.roleBindingModel.deleteOne({
            userId: employee.userId,
            resourceId: new mongoose_2.Types.ObjectId(restaurantId),
            resourceType: 'restaurant',
        });
    }
    async checkUserRole(restaurantId, userId) {
        const restaurant = await this.restaurantModel.findById(restaurantId);
        if (!restaurant)
            throw new common_1.NotFoundException('Restaurant not found');
        if (restaurant.ownerId.toString() === userId)
            return { role: 'owner' };
        if (restaurant.managerId?.toString() === userId)
            return { role: 'manager' };
        const employeeBinding = await this.roleBindingModel.findOne({
            resourceId: new mongoose_2.Types.ObjectId(restaurantId),
            resourceType: 'restaurant',
            userId: new mongoose_2.Types.ObjectId(userId),
            role: 'employee',
        });
        if (employeeBinding)
            return { role: 'employee' };
        return { role: null };
    }
};
exports.RestaurantsService = RestaurantsService;
exports.RestaurantsService = RestaurantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(restaurant_schema_1.Restaurant.name)),
    __param(1, (0, mongoose_1.InjectModel)(role_binding_schema_1.RoleBinding.name)),
    __param(2, (0, mongoose_1.InjectModel)(table_schema_1.Table.name)),
    __param(3, (0, mongoose_1.InjectModel)(employee_profile_schema_1.EmployeeProfile.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], RestaurantsService);
//# sourceMappingURL=restaurants.service.js.map