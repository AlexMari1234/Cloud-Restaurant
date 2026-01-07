import { IsDateString, IsEnum, IsMongoId, IsNumber, IsOptional, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReservationDTO {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsMongoId()
  restaurantId: string;

  @ApiProperty({ description: 'Table number' })
  @IsNumber()
  @Min(1)
  tableNumber: number;

  @ApiProperty({ description: 'Number of guests', minimum: 1 })
  @IsNumber()
  @Min(1)
  guests: number;

  @ApiProperty({ description: 'Reservation date and time' })
  @IsDateString()
  reservationTime: string;

  @ApiProperty({ description: 'Special requests', required: false })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty({ description: 'Customer name' })
  @IsString()
  customerName: string;

  @ApiProperty({ description: 'Customer phone number' })
  @IsString()
  customerPhone: string;

  @ApiProperty({ description: 'Customer email' })
  @IsString()
  customerEmail: string;

  @ApiProperty({ description: 'Reservation status', enum: ['pending', 'confirmed', 'seated', 'cancelled', 'completed'], required: false })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'seated', 'cancelled', 'completed'])
  status?: 'pending' | 'confirmed' | 'seated' | 'cancelled' | 'completed';
}

export class GetAvailableTimeSlotsDTO {
  @IsMongoId()
  restaurantId: string;

  @IsMongoId()
  tableId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(1)
  partySize: number;
}
