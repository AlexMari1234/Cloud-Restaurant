import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Req,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';
import { ShiftService } from '../services/shift.service';
import { RestaurantsDto } from '@rm/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RestaurantRolesGuard } from '../../auth/guards/restaurant-roles.guard';
import { RestaurantRoles } from '../../auth/decorators/restaurant-roles.decorator';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// TODO: Fix import for CreateShiftDto and UpdateShiftDto when build/alias is fixed
// type CreateShiftDto = any;
// type UpdateShiftDto = any;

@ApiTags('Shifts')
@ApiCookieAuth()
@UseGuards(AuthGuard, RestaurantRolesGuard)
@Controller('restaurants/:restaurantId')
export class ShiftController {
  constructor(
    private readonly service: ShiftService,
    private readonly httpService: HttpService
  ) {}

  @Post('shifts')
  @RestaurantRoles('owner', 'manager')
  async createShift(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: RestaurantsDto.CreateShiftDto,
    @Req() req: AuthRequest,
  ) {
    const shiftData = { ...dto, restaurantId };
    return this.service.create(shiftData);
  }

  @Get('shifts')
  @RestaurantRoles('owner', 'manager')
  async getShifts(
    @Param('restaurantId') restaurantId: string,
    @Req() req: AuthRequest,
  ) {
    return this.service.findAll(restaurantId);
  }

  @Get('employees/:employeeId/shifts')
  @RestaurantRoles('owner', 'manager', 'employee')
  async getEmployeeShifts(
    @Param('restaurantId') restaurantId: string,
    @Param('employeeId') employeeId: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.findByEmployee(restaurantId, employeeId, req.user._id, token);
  }

  @Get('employees/:employeeId/shifts/by-day')
  @RestaurantRoles('owner', 'manager', 'employee')
  async getEmployeeShiftsByDay(
    @Param('restaurantId') restaurantId: string,
    @Param('employeeId') employeeId: string,
    @Query('date') date: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.findByEmployeeAndDay(restaurantId, employeeId, date, req.user._id, token);
  }

  @Get('shifts/by-day')
  @RestaurantRoles('owner', 'manager')
  async getAllShiftsByDay(
    @Param('restaurantId') restaurantId: string,
    @Query('date') date: string,
  ) {
    return this.service.findAllByDay(restaurantId, date);
  }

  @Get('shifts/upcoming')
  @RestaurantRoles('owner', 'manager')
  async getUpcomingShifts(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.service.findUpcoming(restaurantId);
  }

  @Get('shifts/history')
  @RestaurantRoles('owner', 'manager')
  async getHistoryShifts(
    @Param('restaurantId') restaurantId: string,
  ) {
    return this.service.findHistory(restaurantId);
  }

  @Patch('shifts/:shiftId')
  @RestaurantRoles('owner', 'manager')
  async updateShift(
    @Param('restaurantId') restaurantId: string,
    @Param('shiftId') shiftId: string,
    @Body() dto: RestaurantsDto.UpdateShiftDto,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.update(restaurantId, shiftId, dto, req.user._id, token);
  }

  @Patch('shifts/:shiftId/cancel')
  @RestaurantRoles('owner', 'manager')
  async cancelShift(
    @Param('restaurantId') restaurantId: string,
    @Param('shiftId') shiftId: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.cancelShift(restaurantId, shiftId, req.user._id, token);
  }

  @Delete('shifts/:shiftId')
  @RestaurantRoles('owner', 'manager')
  async deleteShift(
    @Param('restaurantId') restaurantId: string,
    @Param('shiftId') shiftId: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.delete(restaurantId, shiftId, req.user._id, token);
  }

  @Patch('shifts/:shiftId/self-cancel')
  @RestaurantRoles('owner', 'manager', 'employee')
  async selfCancelShift(
    @Param('restaurantId') restaurantId: string,
    @Param('shiftId') shiftId: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.selfCancelShift(restaurantId, shiftId, req.user._id, token);
  }

  @Post('shifts/:shiftId/request-swap')
  @RestaurantRoles('owner', 'manager', 'employee')
  async requestSwap(
    @Param('restaurantId') restaurantId: string,
    @Param('shiftId') shiftId: string,
    @Req() req: AuthRequest,
    @Body('targetEmployeeId') targetEmployeeId: string,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.requestSwap(restaurantId, shiftId, req.user._id, targetEmployeeId, token);
  }

  @Patch('shifts/:shiftId/accept')
  @RestaurantRoles('owner', 'manager', 'employee')
  async acceptShift(
    @Param('restaurantId') restaurantId: string,
    @Param('shiftId') shiftId: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.acceptShift(restaurantId, shiftId, req.user._id, token);
  }

  @Patch('shifts/:shiftId/decline')
  @RestaurantRoles('owner', 'manager', 'employee')
  async declineShift(
    @Param('restaurantId') restaurantId: string,
    @Param('shiftId') shiftId: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.declineShift(restaurantId, shiftId, req.user._id, token);
  }

  @Patch('shifts/:shiftId/check-in')
  @RestaurantRoles('owner', 'manager', 'employee')
  async checkIn(
    @Param('restaurantId') restaurantId: string,
    @Param('shiftId') shiftId: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.checkIn(restaurantId, shiftId, req.user._id, token);
  }

  @Patch('shifts/:shiftId/check-out')
  @RestaurantRoles('owner', 'manager', 'employee')
  async checkOut(
    @Param('restaurantId') restaurantId: string,
    @Param('shiftId') shiftId: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.checkOut(restaurantId, shiftId, req.user._id, token);
  }

  @Get('shifts/summary')
  @RestaurantRoles('owner', 'manager')
  async getSummary(
    @Param('restaurantId') restaurantId: string,
    @Query('period') period: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.summary(restaurantId, period, undefined, req.user._id, token);
  }

  @Get('employees/:employeeId/shifts/summary')
  @RestaurantRoles('owner', 'manager', 'employee')
  async getEmployeeSummary(
    @Param('restaurantId') restaurantId: string,
    @Param('employeeId') employeeId: string,
    @Query('period') period: string,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.summary(restaurantId, period, employeeId, req.user._id, token);
  }

  @Post('shifts/bulk-create')
  @RestaurantRoles('owner', 'manager')
  async bulkCreate(
    @Param('restaurantId') restaurantId: string,
    @Body() body: { shifts: any[] },
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.bulkCreate(restaurantId, body.shifts, req.user._id, token);
  }

  @Get('shifts/advanced-filter')
  @RestaurantRoles('owner', 'manager', 'employee')
  async advancedFilter(
    @Param('restaurantId') restaurantId: string,
    @Query() query: any,
    @Req() req: AuthRequest,
  ) {
    if (!req.user?._id) throw new ForbiddenException('No user');
    let token = req.headers['authorization'];
    if (!token) {
      // fallback la cookie
      token = req.cookies?.jwt;
      if (token) {
        token = `Bearer ${token}`;
      }
    }
    if (!token) {
      throw new ForbiddenException('Missing authorization token');
    }
    if (!token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    return this.service.advancedFilter(restaurantId, query, req.user._id, token);
  }

  async getUserRoleForRestaurant(restaurantId: string, userId: string, token: string): Promise<'owner'|'manager'|'employee'|null> {
    const response = await firstValueFrom(
      this.httpService.get(
        `http://restaurant-service:3001/restaurants/${restaurantId}/check-role/${userId}`,
        { headers: { Authorization: token } }
      )
    );
    return response.data?.role || null;
  }
} 