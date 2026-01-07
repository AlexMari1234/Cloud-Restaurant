import { IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetAvailableTimeSlotsDTO {
  @ApiProperty({ description: 'Restaurant ID' })
  @IsString()
  restaurantId!: string;

  @ApiProperty({ description: 'Table number' })
  @IsNumber()
  @Min(1)
  tableNumber!: number;

  @ApiProperty({ description: 'Date to check availability for (YYYY-MM-DD)' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'Number of guests', minimum: 1 })
  @IsNumber()
  @Min(1)
  @Max(20)
  guests!: number;
} 