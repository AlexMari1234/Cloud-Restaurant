export declare class GeoDTO {
    type: 'Point';
    coordinates: [number, number];
}
export declare class CreateRestaurantDTO {
    name: string;
    slug: string;
    logoUrl: string;
    address: string;
    geo?: GeoDTO;
    timezone: string;
    capacity: number;
    openingHour: number;
    closingHour: number;
    reservationDuration?: number;
    timeSlotInterval?: number;
    closedDays?: string[];
    managerId?: string;
}
//# sourceMappingURL=create-restaurant.dto.d.ts.map