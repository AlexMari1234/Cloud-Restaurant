import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Shift, ShiftDocument } from '../schemas/shift.schema';
import { RestaurantsDto } from '@rm/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
// If this import fails, check tsconfig paths for @rm/common alias.
import { EmployeeProfile, EmployeeProfileDocument } from '../schemas/employee-profile.schema';

@Injectable()
export class ShiftService {
  constructor(
    @InjectModel(Shift.name)
    private readonly shiftModel: Model<ShiftDocument>,
    @InjectModel(EmployeeProfile.name)
    private readonly employeeProfileModel: Model<EmployeeProfileDocument>,
    private readonly httpService: HttpService,
  ) {}

  private async getUserRoleForRestaurant(restaurantId: string, userId: string, token: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `http://restaurant-service:3001/restaurants/${restaurantId}/check-role/${userId}`,
          { headers: { Authorization: token } }
        )
      );
      const role = response.data?.role;
      if (!role) {
        throw new ForbiddenException('User has no role in this restaurant');
      }
      return role;
    } catch (error) {
      console.error('Error checking restaurant role:', error);
      throw new ForbiddenException('Could not verify restaurant role');
    }
  }

  private async getEmployeeProfileForUser(restaurantId: string, userId: string): Promise<EmployeeProfileDocument | null> {
    return this.employeeProfileModel.findOne({
      userId: new Types.ObjectId(userId),
      restaurantId: new Types.ObjectId(restaurantId)
    }).exec();
  }

  private async verifyEmployeeAccess(restaurantId: string, employeeId: string, userId: string, token: string): Promise<void> {
    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      if (employeeProfileId.toString() !== employeeId) {
        throw new ForbiddenException('You can only access your own shifts');
      }
    }
  }

  private async verifyShiftOwnership(restaurantId: string, shiftId: string, userId: string, token: string): Promise<void> {
    const shift = await this.shiftModel.findById(shiftId);
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }
    if (shift.restaurantId.toString() !== restaurantId) {
      throw new ForbiddenException('Shift does not belong to this restaurant');
    }

    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      const shiftEmployeeId = shift.employeeId as Types.ObjectId;
      if (shiftEmployeeId.toString() !== employeeProfileId.toString()) {
        throw new ForbiddenException('You can only modify your own shifts');
      }
    }
  }

  async getEmployeeProfileIdForUser(restaurantId: string, userId: string): Promise<string | null> {
    const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
    if (!employeeProfile) {
      return null;
    }
    const employeeProfileId = employeeProfile._id as Types.ObjectId;
    return employeeProfileId.toString();
  }

  async create(dto: RestaurantsDto.CreateShiftDto & { restaurantId: string }) {
    // Validare suprapunere ture pentru același angajat
    const overlap = await this.shiftModel.findOne({
      employeeId: new Types.ObjectId(dto.employeeId),
      restaurantId: new Types.ObjectId(dto.restaurantId),
      $or: [
        { startTime: { $lt: dto.endTime }, endTime: { $gt: dto.startTime } },
      ],
    });
    if (overlap) {
      throw new BadRequestException('Shift overlaps with an existing shift for this employee');
    }
    // Asigură-te că salvezi ca ObjectId, nu ca string
    const shiftToCreate = {
      ...dto,
      employeeId: new Types.ObjectId(dto.employeeId),
      restaurantId: new Types.ObjectId(dto.restaurantId),
      status: 'pending', // Setăm statusul inițial
    };
    return this.shiftModel.create(shiftToCreate);
  }

  async findAll(restaurantId: string) {
    return this.shiftModel.find({ restaurantId: new Types.ObjectId(restaurantId) });
  }

  async findByEmployee(restaurantId: string, employeeId: string, userId: string, token: string) {
    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      // employee poate vedea doar propriile ture
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      if (employeeProfileId.toString() !== employeeId) {
        throw new ForbiddenException('You can only view your own shifts');
      }
    }
    // manager/owner pot vedea orice
    return this.shiftModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      employeeId: new Types.ObjectId(employeeId),
    });
  }

  async findOne(shiftId: string, restaurantId: string, userId: string, token: string) {
    await this.verifyShiftOwnership(restaurantId, shiftId, userId, token);
    const shift = await this.shiftModel.findById(shiftId);
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async update(restaurantId: string, shiftId: string, dto: RestaurantsDto.UpdateShiftDto, userId: string, token: string) {
    await this.verifyShiftOwnership(restaurantId, shiftId, userId, token);
    const shift = await this.shiftModel.findOneAndUpdate(
      { _id: shiftId, restaurantId: new Types.ObjectId(restaurantId) },
      dto,
      { new: true },
    );
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async delete(restaurantId: string, shiftId: string, userId: string, token: string) {
    await this.verifyShiftOwnership(restaurantId, shiftId, userId, token);
    const shift = await this.shiftModel.findOneAndDelete({
      _id: shiftId,
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async findByEmployeeAndDay(restaurantId: string, employeeId: string, date: string, userId: string, token: string) {
    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      // employee poate vedea doar propriile ture
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      if (employeeProfileId.toString() !== employeeId) {
        throw new ForbiddenException('You can only view your own shifts');
      }
    }
    // manager/owner pot vedea orice
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.shiftModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      employeeId: new Types.ObjectId(employeeId),
      startTime: { $gte: start, $lte: end },
    });
  }

  async findAllByDay(restaurantId: string, date: string) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return this.shiftModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      startTime: { $gte: start, $lte: end },
    });
  }

  async findUpcoming(restaurantId: string) {
    const now = new Date();
    return this.shiftModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      startTime: { $gte: now },
    });
  }

  async findHistory(restaurantId: string) {
    const now = new Date();
    return this.shiftModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      endTime: { $lt: now },
    });
  }

  async cancelShift(restaurantId: string, shiftId: string, userId: string, token: string) {
    await this.verifyShiftOwnership(restaurantId, shiftId, userId, token);
    const shift = await this.shiftModel.findOneAndUpdate(
      { _id: shiftId, restaurantId: new Types.ObjectId(restaurantId) },
      { status: 'canceled' },
      { new: true },
    );
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async selfCancelShift(restaurantId: string, shiftId: string, userId: string, token: string) {
    const shift = await this.shiftModel.findOne({
      _id: shiftId,
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!shift) throw new NotFoundException('Shift not found');
    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      // employee poate anula doar propria tură
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      if (shift.employeeId.toString() !== employeeProfileId.toString()) {
        throw new ForbiddenException('You can only cancel your own shifts');
      }
    } else if (userRole === 'manager' || userRole === 'owner') {
      // manager/owner pot anula orice tură
    } else {
      throw new ForbiddenException('You do not have permission to cancel this shift');
    }
    if (shift.status === 'canceled') throw new BadRequestException('Already canceled');
    shift.status = 'canceled';
    await shift.save();
    return shift;
  }

  async requestSwap(restaurantId: string, shiftId: string, userId: string, targetEmployeeId: string, token: string) {
    const shift = await this.shiftModel.findOne({
      _id: shiftId,
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!shift) throw new NotFoundException('Shift not found');
    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      // employee poate cere swap doar pentru propria tură
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      if (shift.employeeId.toString() !== employeeProfileId.toString()) {
        throw new ForbiddenException('You can only request swap for your own shifts');
      }
    } else if (userRole === 'manager' || userRole === 'owner') {
      // manager/owner pot face swap pentru orice tură
    } else {
      throw new ForbiddenException('You do not have permission to request swap for this shift');
    }
    shift.status = 'swap_requested';
    shift.swapTarget = new Types.ObjectId(targetEmployeeId);
    await shift.save();
    return shift;
  }

  async acceptShift(restaurantId: string, shiftId: string, userId: string, token: string) {
    const shift = await this.shiftModel.findOne({
      _id: shiftId,
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!shift) throw new NotFoundException('Shift not found');
    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      // employee poate accepta doar propria tură
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      if (shift.employeeId.toString() !== employeeProfileId.toString()) {
        throw new ForbiddenException('You can only accept your own shifts');
      }
    } else if (userRole === 'manager' || userRole === 'owner') {
      // manager/owner pot accepta orice tură
    } else {
      throw new ForbiddenException('You do not have permission to accept this shift');
    }
    shift.status = 'accepted';
    await shift.save();
    return shift;
  }

  async declineShift(restaurantId: string, shiftId: string, userId: string, token: string) {
    const shift = await this.shiftModel.findOne({
      _id: shiftId,
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!shift) throw new NotFoundException('Shift not found');
    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      // employee poate refuza doar propria tură
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      if (shift.employeeId.toString() !== employeeProfileId.toString()) {
        throw new ForbiddenException('You can only decline your own shifts');
      }
    } else if (userRole === 'manager' || userRole === 'owner') {
      // manager/owner pot refuza orice tură
    } else {
      throw new ForbiddenException('You do not have permission to decline this shift');
    }
    shift.status = 'declined';
    await shift.save();
    return shift;
  }

  async checkIn(restaurantId: string, shiftId: string, userId: string, token: string) {
    const shift = await this.shiftModel.findOne({
      _id: shiftId,
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!shift) throw new NotFoundException('Shift not found');
    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      // employee poate check-in doar la propria tură
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      if (shift.employeeId.toString() !== employeeProfileId.toString()) {
        throw new ForbiddenException('You can only check-in to your own shifts');
      }
    } else if (userRole === 'manager' || userRole === 'owner') {
      // manager/owner pot check-in la orice tură
    } else {
      throw new ForbiddenException('You do not have permission to check-in to this shift');
    }
    if (shift.checkInTime) throw new BadRequestException('Already checked in');
    shift.checkInTime = new Date();
    await shift.save();
    return shift;
  }

  async checkOut(restaurantId: string, shiftId: string, userId: string, token: string) {
    const shift = await this.shiftModel.findOne({
      _id: shiftId,
      restaurantId: new Types.ObjectId(restaurantId),
    });
    if (!shift) throw new NotFoundException('Shift not found');
    const userRole = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (userRole === 'employee') {
      // employee poate check-out doar la propria tură
      const employeeProfile = await this.getEmployeeProfileForUser(restaurantId, userId);
      if (!employeeProfile) {
        throw new ForbiddenException('Employee profile not found');
      }
      const employeeProfileId = employeeProfile._id as Types.ObjectId;
      if (shift.employeeId.toString() !== employeeProfileId.toString()) {
        throw new ForbiddenException('You can only check-out from your own shifts');
      }
    } else if (userRole === 'manager' || userRole === 'owner') {
      // manager/owner pot check-out la orice tură
    } else {
      throw new ForbiddenException('You do not have permission to check-out from this shift');
    }
    if (!shift.checkInTime) throw new BadRequestException('Must check in first');
    if (shift.checkOutTime) throw new BadRequestException('Already checked out');
    shift.checkOutTime = new Date();
    await shift.save();
    return shift;
  }

  async summary(restaurantId: string, period: string, employeeId?: string, userId?: string, token?: string) {
    if (employeeId && userId && token) {
      await this.verifyEmployeeAccess(restaurantId, employeeId, userId, token);
    }

    const match: any = { restaurantId: new Types.ObjectId(restaurantId) };
    if (employeeId) match.employeeId = new Types.ObjectId(employeeId);

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
      totalHours += ((s.checkOutTime as any) - (s.checkInTime as any)) / 3600000;
    }

    return { totalShifts, completed, canceled, totalHours };
  }

  async bulkCreate(restaurantId: string, shifts: any[], userId: string, token: string) {
    const role = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (role !== 'manager' && role !== 'owner') {
      throw new ForbiddenException('Only managers and owners can bulk create shifts');
    }

    const docs = shifts.map(s => ({
      ...s,
      restaurantId: new Types.ObjectId(restaurantId),
      employeeId: new Types.ObjectId(s.employeeId),
      status: 'pending',
    }));
    return this.shiftModel.insertMany(docs);
  }

  async advancedFilter(restaurantId: string, filters: any, userId: string, token: string) {
    const role = await this.getUserRoleForRestaurant(restaurantId, userId, token);
    if (role !== 'manager' && role !== 'owner' && role !== 'employee') {
      throw new ForbiddenException('Invalid role for this operation');
    }

    const query: any = { restaurantId: new Types.ObjectId(restaurantId) };
    if (filters.status) query.status = filters.status;
    if (filters.employeeId) {
      if (role === 'employee') {
        const employeeProfileId = await this.getEmployeeProfileIdForUser(restaurantId, userId);
        if (employeeProfileId !== filters.employeeId) {
          throw new ForbiddenException('You can only filter your own shifts');
        }
      }
      query.employeeId = new Types.ObjectId(filters.employeeId);
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
} 