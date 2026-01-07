import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Reservation,
  ReservationDocument,
} from '../schemas/reservation.schema';
import { ReservationsDto } from '@rm/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';
import { REQUEST } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { randomBytes } from 'crypto';

interface Restaurant {
  openingHour: number;
  closingHour: number;
  reservationDuration?: number;
  timeSlotInterval?: number;
  closedDays?: string[];
}

interface Table {
  _id: string;
  number: number;
  capacity: number;
  type: 'indoor' | 'outdoor' | 'bar';
  unavailableDays?: string[];
  minReservationTime?: number;
  maxReservationTime?: number;
}

function generateConfirmationCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = randomBytes(length);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    private readonly httpService: HttpService,
    @Inject(REQUEST) private readonly request: AuthRequest,
  ) {}

  private getAuthHeaders() {
    const authHeader = this.request.headers['authorization'];
    const jwtFromCookie = this.request.cookies?.jwt;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.split(' ')[1] 
      : jwtFromCookie;

    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getAvailableTimeSlots(dto: ReservationsDto.GetAvailableTimeSlotsDTO): Promise<string[]> {
    const { restaurantId, tableNumber, date, guests } = dto;
    const requestedDate = new Date(date);
    const now = new Date();

    // Get restaurant and table information
    const restaurantResponse = await firstValueFrom(
      this.httpService.get<Restaurant>(
        `http://restaurant-service:3001/restaurants/${restaurantId}`,
        { headers: this.getAuthHeaders() }
      )
    );
    const restaurant = restaurantResponse.data;
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    // Use the correct endpoint to get table by number
    const tableResponse = await firstValueFrom(
      this.httpService.get<Table>(
        `http://restaurant-service:3001/restaurants/${restaurantId}/tables/number/${tableNumber}`,
        { headers: this.getAuthHeaders() }
      )
    );
    const table = tableResponse.data;
    if (!table) {
      throw new NotFoundException('Table not found');
    }

    // Check if table capacity is sufficient
    if (table.capacity < guests) {
      throw new BadRequestException('Table capacity is insufficient for party size');
    }

    // Check if restaurant is open on the requested day
    const dayOfWeek = requestedDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
    if (restaurant.closedDays?.includes(dayOfWeek)) {
      throw new BadRequestException('Restaurant is closed on this day');
    }

    // Check if table is available on the requested day
    if (table.unavailableDays?.includes(dayOfWeek)) {
      throw new BadRequestException('Table is not available on this day');
    }

    // Get all reservations for the table on the requested date
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Use table._id for reservation lookup
    const existingReservations = await this.reservationModel.find({
      tableId: new Types.ObjectId(table._id),
      reservationTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'completed'] },
    });

    // Generate all possible time slots
    const timeSlots: string[] = [];
    const reservationDuration = restaurant.reservationDuration || 90; // Default 90 minutes
    const timeSlotInterval = restaurant.timeSlotInterval || 30; // Default 30 minutes

    const openingHour = restaurant.openingHour;
    const closingHour = restaurant.closingHour;
    const minReservationTime = table.minReservationTime ?? openingHour;
    const maxReservationTime = table.maxReservationTime ?? closingHour - (reservationDuration / 60);

    for (let hour = minReservationTime; hour <= maxReservationTime; hour += timeSlotInterval / 60) {
      const slotTime = new Date(requestedDate);
      slotTime.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
      const slotEndTime = new Date(slotTime.getTime() + reservationDuration * 60000);

      // Nu include sloturi din trecut (față de data/ora curentă)
      if (slotTime < now) continue;

      // Check if slot overlaps with any existing reservation
      const hasOverlap = existingReservations.some(reservation => {
        const resStart = new Date(reservation.reservationTime);
        const resEnd = new Date(reservation.endTime);
        return (
          (slotTime >= resStart && slotTime < resEnd) ||
          (slotEndTime > resStart && slotEndTime <= resEnd) ||
          (slotTime <= resStart && slotEndTime >= resEnd)
        );
      });

      if (!hasOverlap) {
        timeSlots.push(slotTime.toISOString());
      }
    }

    return timeSlots;
  }

  async createReservation(createReservationDto: ReservationsDto.CreateReservationDTO): Promise<Reservation> {
    console.log('Received DTO:', createReservationDto);
    const { restaurantId, tableNumber, guests, reservationTime, specialRequests, customerName, customerPhone, customerEmail } = createReservationDto;
    console.log('Extracted values:', { restaurantId, tableNumber, guests, reservationTime, specialRequests, customerName, customerPhone, customerEmail });

    // Parse the reservation date
    const reservationDate = new Date(reservationTime);
    const now = new Date();
    if (reservationDate < now) {
      throw new BadRequestException('Cannot make a reservation in the past');
    }
    console.log('Parsed reservation date:', reservationDate);

    // Get restaurant info
    console.log('Making request to restaurant service...');
    const restaurantResponse = await firstValueFrom(
      this.httpService
        .get<Restaurant>(`http://restaurant-service:3001/restaurants/${restaurantId}`, {
          headers: this.getAuthHeaders(),
        })
        .pipe(map((response) => response.data)),
    );
    const restaurant = restaurantResponse;
    console.log('Restaurant found:', restaurant);

    // Get table info
    console.log('Getting table info...');
    const tableResponse = await firstValueFrom(
      this.httpService
        .get<Table>(`http://restaurant-service:3001/restaurants/${restaurantId}/tables/number/${tableNumber}`, {
          headers: this.getAuthHeaders(),
        })
        .pipe(map((response) => response.data)),
    );
    const table = tableResponse;
    console.log('Table found:', table);

    // Validate party size against table capacity
    if (guests > table.capacity) {
      throw new BadRequestException(`Table ${tableNumber} can only accommodate ${table.capacity} guests`);
    }

    // Check if restaurant is open on the requested day
    const dayOfWeek = reservationDate.toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
    if (restaurant.closedDays?.includes(dayOfWeek)) {
      throw new BadRequestException(`Restaurant is closed on ${dayOfWeek}`);
    }

    // Check if table is available on the requested day
    if (table.unavailableDays?.includes(dayOfWeek)) {
      throw new BadRequestException(`Table ${tableNumber} is not available on ${dayOfWeek}`);
    }

    // Validate reservation time against restaurant hours
    const reservationHour = reservationDate.getHours();
    if (reservationHour < restaurant.openingHour || reservationHour >= restaurant.closingHour) {
      throw new BadRequestException(
        `Reservation time must be between ${restaurant.openingHour}:00 and ${restaurant.closingHour}:00`,
      );
    }

    // Validate reservation time against table allowed hours
    if (
      (table.minReservationTime && reservationHour < table.minReservationTime) ||
      (table.maxReservationTime && reservationHour >= table.maxReservationTime)
    ) {
      throw new BadRequestException(
        `Table ${tableNumber} is only available between ${table.minReservationTime}:00 and ${table.maxReservationTime}:00`,
      );
    }

    // Calculate end time based on restaurant's reservation duration
    const endTime = new Date(reservationDate);
    endTime.setMinutes(endTime.getMinutes() + (restaurant.reservationDuration || 120)); // Default 2 hours if not specified

    // Check for overlapping reservations
    const existingReservation = await this.reservationModel.findOne({
      tableId: new Types.ObjectId(table._id),
      reservationTime: { $lt: endTime },
      endTime: { $gt: reservationDate },
      status: { $nin: ['cancelled', 'completed'] },
    });

    if (existingReservation) {
      throw new BadRequestException('Table is already reserved for this time slot');
    }

    // Get userId from request
    const userId = this.request.user?._id;
    if (!userId) {
      throw new BadRequestException('User ID is required to create a reservation');
    }

    const confirmationCode = generateConfirmationCode();

    const reservation = await this.reservationModel.create({
      restaurantId: new Types.ObjectId(restaurantId),
      tableId: new Types.ObjectId(table._id),
      userId: new Types.ObjectId(userId),
      partySize: guests,
      reservationTime: reservationDate,
      endTime,
      specialRequests,
      customerName,
      customerPhone,
      customerEmail,
      confirmationCode,         // <--- aici
      status: 'pending',
    });

    return reservation;
  }

  async getReservation(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return reservation;
  }

  async updateReservationStatus(
    id: string,
    status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed',
  ): Promise<Reservation> {
    const reservation = await this.reservationModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return reservation;
  }

  async getRestaurantReservations(
    restaurantId: string,
    date: Date,
  ): Promise<Reservation[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.reservationModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      reservationTime: { $gte: startOfDay, $lte: endOfDay },
    });
  }

  async getUserReservations(userId: string): Promise<Reservation[]> {
    return this.reservationModel.find({
      userId: new Types.ObjectId(userId),
    });
  }

  // Get all reservations for a table in a restaurant on a specific day
  async getTableReservations(
    restaurantId: string,
    tableNumber: number,
    date: Date,
  ): Promise<Reservation[]> {
    // Get table by number
    const tableResponse = await firstValueFrom(
      this.httpService.get<any>(
        `http://restaurant-service:3001/restaurants/${restaurantId}/tables/number/${tableNumber}`,
        { headers: this.getAuthHeaders() }
      )
    );
    const table = tableResponse.data;
    if (!table) throw new NotFoundException('Table not found');

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.reservationModel.find({
      restaurantId: new Types.ObjectId(restaurantId),
      tableId: new Types.ObjectId(table._id),
      reservationTime: { $gte: startOfDay, $lte: endOfDay },
    });
  }

  // Cancel reservation (user only)
  async cancelReservation(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found');
    const userId = this.request.user?._id;
    if (!userId || !reservation.userId || reservation.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only cancel your own reservation');
    }
    if (reservation.status === 'cancelled') {
      throw new BadRequestException('Reservation is already cancelled');
    }
    const now = new Date();
    if (reservation.reservationTime < now) {
      throw new BadRequestException('Cannot cancel a reservation that has already started');
    }
    reservation.status = 'cancelled';
    await reservation.save();
    return reservation;
  }

  // Mark reservation as completed (owner/manager only)
  async completeReservation(id: string): Promise<Reservation> {
    const reservation = await this.reservationModel.findById(id);
    if (!reservation) throw new NotFoundException('Reservation not found');
    if (reservation.status === 'completed') {
      throw new BadRequestException('Reservation is already completed');
    }
    reservation.status = 'completed';
    await reservation.save();
    return reservation;
  }
}

function nanoid(arg0: number) {
  throw new Error('Function not implemented.');
}
