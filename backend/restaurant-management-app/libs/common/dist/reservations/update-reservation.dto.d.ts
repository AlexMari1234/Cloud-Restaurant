import { CreateReservationDTO } from './create-reservation.dto';
declare const UpdateReservationDTO_base: import("@nestjs/mapped-types").MappedType<Partial<CreateReservationDTO>>;
export declare class UpdateReservationDTO extends UpdateReservationDTO_base {
    status?: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed';
}
export {};
//# sourceMappingURL=update-reservation.dto.d.ts.map