import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDTO } from './create-reservation.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateReservationDTO extends PartialType(CreateReservationDTO) {
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'seated', 'cancelled', 'completed'])
  status?: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed';
}
