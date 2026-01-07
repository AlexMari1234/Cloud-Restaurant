import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { RestaurantsService } from '../services/restaurants.service';
import { RestaurantsDto } from '@rm/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';
import axios from 'axios';

@ApiTags('Restaurants')
@ApiCookieAuth() // 🔐 Swagger trimite automat cookie-ul jwt
@UseGuards(AuthGuard, RolesGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly service: RestaurantsService) {}

  @Post()
  @Roles('owner')
  async create(
    @Req() req: AuthRequest,
    @Body() dto: RestaurantsDto.CreateRestaurantDTO,
  ) {
    if (!req.user?._id) {
      throw new UnauthorizedException('Missing user ID');
    }

    return this.service.create(req.user._id, dto);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }



  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  @Roles('owner')
  async update(
    @Param('id') id: string,
    @Body() dto: RestaurantsDto.UpdateRestaurantDTO,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('owner')
  async delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Patch(':id/assign-manager/:managerId')
  @Roles('owner')
  async assignManager(
    @Param('id') restaurantId: string,
    @Param('managerId') managerId: string,
  ) {
    return this.service.assignManager(restaurantId, managerId);
  }

  @Post(':restaurantId/tables')
  @Roles('owner', 'manager')
  async createTable(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: RestaurantsDto.CreateTableDTO,
  ) {
    return this.service.createTable(restaurantId, dto);
  }

  @Get(':restaurantId/tables')
  async getTables(@Param('restaurantId') restaurantId: string) {
    return this.service.findAllTables(restaurantId);
  }

  @Get(':restaurantId/tables/:tableId')
  async getTableById(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.service.findTableById(restaurantId, tableId);
  }

  @Get(':restaurantId/tables/number/:tableNumber')
  async getTableByNumber(
    @Param('restaurantId') restaurantId: string,
    @Param('tableNumber') tableNumber: number,
  ) {
    return this.service.findTableByNumber(restaurantId, tableNumber);
  }

  @Patch(':restaurantId/tables/:tableId')
  @Roles('owner', 'manager')
  async updateTable(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
    @Body() dto: RestaurantsDto.UpdateTableDTO,
  ) {
    return this.service.updateTable(restaurantId, tableId, dto);
  }

  @Delete(':restaurantId/tables/:tableId')
  @HttpCode(204)
  @Roles('owner', 'manager')
  async deleteTable(
    @Param('restaurantId') restaurantId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.service.deleteTable(restaurantId, tableId);
  }

  @Post(':restaurantId/employees')
  @Roles('owner', 'manager')
  async createEmployee(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: RestaurantsDto.CreateEmployeeDTO,
  ) {
    return this.service.createEmployee(restaurantId, dto);
  }

  @Get(':restaurantId/employees')
  async getAllEmployees(@Param('restaurantId') restaurantId: string) {
    return this.service.findAllEmployees(restaurantId);
  }

  @Get(':restaurantId/employees/:employeeId')
  async getEmployee(
    @Param('restaurantId') restaurantId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.findEmployeeById(restaurantId, employeeId);
  }

  @Patch(':restaurantId/employees/:employeeId')
  @Roles('owner', 'manager')
  async updateEmployee(
    @Param('restaurantId') restaurantId: string,
    @Param('employeeId') employeeId: string,
    @Body() dto: RestaurantsDto.UpdateEmployeeDTO,
  ) {
    return this.service.updateEmployee(restaurantId, employeeId, dto);
  }

  @Delete(':restaurantId/employees/:employeeId')
  @HttpCode(204)
  @Roles('owner', 'manager')
  async deleteEmployee(
    @Param('restaurantId') restaurantId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.service.deleteEmployee(restaurantId, employeeId);
  }

  @Get(':restaurantId/check-role/:userId')
  @UseGuards(AuthGuard)
  async checkUserRole(
    @Param('restaurantId') restaurantId: string,
    @Param('userId') userId: string,
  ) {
    return this.service.checkUserRole(restaurantId, userId);
  }

}
