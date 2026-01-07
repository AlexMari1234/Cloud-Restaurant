export declare class CreateReservationDTO {
    restaurantId: string;
    tableNumber: number;
    guests: number;
    reservationTime: string;
    specialRequests?: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    status?: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed';
}
export declare class GetAvailableTimeSlotsDTO {
    restaurantId: string;
    tableId: string;
    date: string;
    partySize: number;
}
//# sourceMappingURL=create-reservation.dto.d.ts.map