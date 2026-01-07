import { ReservationsService } from '../services/reservations.service';
import { ReservationsDto } from '@rm/common';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    createReservation(dto: ReservationsDto.CreateReservationDTO): Promise<import("../schemas/reservation.schema").Reservation>;
    getAvailableTimeSlots(dto: ReservationsDto.GetAvailableTimeSlotsDTO): Promise<string[]>;
    getReservation(id: string): Promise<import("../schemas/reservation.schema").Reservation>;
    updateReservationStatus(id: string, status: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed'): Promise<import("../schemas/reservation.schema").Reservation>;
    getRestaurantReservations(restaurantId: string, date: string): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getUserReservations(userId: string): Promise<import("../schemas/reservation.schema").Reservation[]>;
    getTableReservations(restaurantId: string, tableNumber: string, date: string): Promise<import("../schemas/reservation.schema").Reservation[]>;
    cancelReservation(id: string): Promise<import("../schemas/reservation.schema").Reservation>;
    completeReservation(id: string): Promise<import("../schemas/reservation.schema").Reservation>;
}
