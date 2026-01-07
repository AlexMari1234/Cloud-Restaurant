import { Model } from 'mongoose';
import { Reservation, ReservationDocument } from '../schemas/reservation.schema';
import { ReservationsDto } from '@rm/common';
import { HttpService } from '@nestjs/axios';
import { AuthRequest } from '../../auth/interfaces/auth-request.interface';
export declare class ReservationsService {
    private readonly reservationModel;
    private readonly httpService;
    private readonly request;
    constructor(reservationModel: Model<ReservationDocument>, httpService: HttpService, request: AuthRequest);
    private getAuthHeaders;
    getAvailableTimeSlots(dto: ReservationsDto.GetAvailableTimeSlotsDTO): Promise<string[]>;
    createReservation(createReservationDto: ReservationsDto.CreateReservationDTO): Promise<Reservation>;
    getReservation(id: string): Promise<Reservation>;
    updateReservationStatus(id: string, status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed'): Promise<Reservation>;
    getRestaurantReservations(restaurantId: string, date: Date): Promise<Reservation[]>;
    getUserReservations(userId: string): Promise<Reservation[]>;
    getTableReservations(restaurantId: string, tableNumber: number, date: Date): Promise<Reservation[]>;
    cancelReservation(id: string): Promise<Reservation>;
    completeReservation(id: string): Promise<Reservation>;
}
