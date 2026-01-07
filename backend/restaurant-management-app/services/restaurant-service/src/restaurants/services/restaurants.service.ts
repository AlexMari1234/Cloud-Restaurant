import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant, RestaurantDocument } from '../schemas/restaurant.schema';
import { RoleBinding, RoleBindingDocument } from '../schemas/role-binding.schema';
import { Table, TableDocument } from '../schemas/table.schema';
import { EmployeeProfile, EmployeeProfileDocument } from '../schemas/employee-profile.schema';
import { RestaurantsDto } from '@rm/common';
import { toObjectId } from '../../utils/mongo'

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private readonly restaurantModel: Model<RestaurantDocument>,
    @InjectModel(RoleBinding.name)
    private readonly roleBindingModel: Model<RoleBindingDocument>,
    @InjectModel(Table.name)
    private readonly tableModel: Model<TableDocument>,
    @InjectModel(EmployeeProfile.name)
    private readonly employeeModel: Model<EmployeeProfileDocument>,
  ) {}

  // ================================ Restaurants ================================

  async create(ownerId: string, dto: RestaurantsDto.CreateRestaurantDTO) {
    return this.restaurantModel.create({
      ownerId,
      ...dto,
      geo: dto.geo, // deja e { type: 'Point', coordinates: [...] }
    });
  }

  async findAll() {
    const restaurants = await this.restaurantModel.find().lean();
    
    // Populate manager information
    const result: any[] = [];
    for (const restaurant of restaurants) {
      let managerName: string | null = null;
      
      if (restaurant.managerId) {
        try {
          // Call auth service to get manager details
          const axios = require('axios');
          const response = await axios.get(`http://auth-service:3000/auth/user-by-id/${restaurant.managerId}`);
          managerName = response.data.name;
        } catch (error) {
          console.error('Error fetching manager details:', error);
        }
      }
      
      result.push({
        ...restaurant,
        managerName,
      });
    }
    
    return result;
  }

  async findById(id: string) {
    const doc = await this.restaurantModel.findById(id);
    if (!doc) throw new NotFoundException('Restaurant not found');
    return doc;
  }

  async update(id: string, dto: RestaurantsDto.UpdateRestaurantDTO) {
    const updated = await this.restaurantModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        ...(dto.geo && { geo: dto.geo }),
      },
      { new: true },
    );
    if (!updated) throw new NotFoundException('Restaurant not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.restaurantModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Restaurant not found');

    await this.roleBindingModel.deleteMany({
      resourceId: id,
      resourceType: 'restaurant',
    });
  }

  async assignManager(restaurantId: string, managerId: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    restaurant.managerId = managerId as any;
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

  // ================================= Tables =================================

  async createTable(restaurantId: string, dto: RestaurantsDto.CreateTableDTO) {
    const restId = toObjectId(restaurantId);
    const restaurant = await this.restaurantModel.findById(restId);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    return this.tableModel.create({
      ...dto,
      restaurantId: restId,
    });
  }

  async findAllTables(restaurantId: string) {
    return this.tableModel.find({ restaurantId: toObjectId(restaurantId) });
  }

  async findTableById(restaurantId: string, tableId: string) {
    const table = await this.tableModel.findOne({
      _id: toObjectId(tableId),
      restaurantId: toObjectId(restaurantId),
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  async findTableByNumber(restaurantId: string, tableNumber: number) {
    const table = await this.tableModel.findOne({
      number: tableNumber,
      restaurantId: toObjectId(restaurantId),
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  async updateTable(
    restaurantId: string,
    tableId: string,
    dto: RestaurantsDto.UpdateTableDTO,
  ) {
    const updated = await this.tableModel.findOneAndUpdate(
      {
        _id: toObjectId(tableId),
        restaurantId: toObjectId(restaurantId),
      },
      dto,
      { new: true },
    );
    if (!updated) throw new NotFoundException('Table not found');
    return updated;
  }

  async deleteTable(restaurantId: string, tableId: string) {
    const deleted = await this.tableModel.findOneAndDelete({
      _id: toObjectId(tableId),
      restaurantId: toObjectId(restaurantId),
    });
    if (!deleted) throw new NotFoundException('Table not found');
    return deleted;
  }

  // ================================ Employees ================================

  async createEmployee(restaurantId: string, dto: RestaurantsDto.CreateEmployeeDTO) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    const exists = await this.employeeModel.findOne({
      userId: new Types.ObjectId(dto.userId),
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (exists) {
      throw new BadRequestException('User is already an employee at this restaurant');
    }

    const employee = await this.employeeModel.create({
      restaurantId: new Types.ObjectId(restaurantId),
      userId: new Types.ObjectId(dto.userId),
      roleLabel: dto.roleLabel,
      hourlyRate: dto.hourlyRate,
      status: 'active',
      hireDate: new Date(),
    });

    await this.roleBindingModel.updateOne(
      {
        userId: new Types.ObjectId(dto.userId),
        resourceId: new Types.ObjectId(restaurantId),
        resourceType: 'restaurant',
      },
      {
        $set: {
          role: 'employee',
          userId: new Types.ObjectId(dto.userId),
          resourceId: new Types.ObjectId(restaurantId),
          resourceType: 'restaurant',
        },
      },
      { upsert: true },
    );

    return employee;
  }

  async findAllEmployees(restaurantId: string) {
    return this.employeeModel.find({ restaurantId: new Types.ObjectId(restaurantId) });
  }

  async findEmployeeById(restaurantId: string, employeeId: string) {
    const emp = await this.employeeModel.findOne({ _id: new Types.ObjectId(employeeId), restaurantId: new Types.ObjectId(restaurantId) });
    if (!emp) throw new NotFoundException('Employee not found');
    return emp;
  }

  async updateEmployee(
    restaurantId: string,
    employeeId: string,
    dto: RestaurantsDto.UpdateEmployeeDTO,
  ) {
    const updated = await this.employeeModel.findOneAndUpdate(
      { _id: new Types.ObjectId(employeeId), restaurantId: new Types.ObjectId(restaurantId) },
      dto,
      { new: true },
    );
    if (!updated) throw new NotFoundException('Employee not found');
    return updated;
  }

  async deleteEmployee(restaurantId: string, employeeId: string) {
    const employee = await this.employeeModel.findOne({
      _id: new Types.ObjectId(employeeId),
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!employee) throw new NotFoundException('Employee not found');

    await this.employeeModel.findOneAndDelete({
      _id: new Types.ObjectId(employeeId),
      restaurantId: new Types.ObjectId(restaurantId),
    });

    await this.roleBindingModel.deleteOne({
      userId: employee.userId,
      resourceId: new Types.ObjectId(restaurantId),
      resourceType: 'restaurant',
    });
  }

  async checkUserRole(restaurantId: string, userId: string) {
    const restaurant = await this.restaurantModel.findById(restaurantId);
    if (!restaurant) throw new NotFoundException('Restaurant not found');

    if (restaurant.ownerId.toString() === userId) return { role: 'owner' };
    if (restaurant.managerId?.toString() === userId) return { role: 'manager' };

    const employeeBinding = await this.roleBindingModel.findOne({
      resourceId: new Types.ObjectId(restaurantId),
      resourceType: 'restaurant',
      userId: new Types.ObjectId(userId),
      role: 'employee',
    });

    if (employeeBinding) return { role: 'employee' };

    return { role: null };
  }
}
