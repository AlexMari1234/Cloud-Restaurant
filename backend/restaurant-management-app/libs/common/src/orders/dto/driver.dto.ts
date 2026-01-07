import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DriverAcceptDto {
  @ApiProperty({ 
    description: 'Estimated delivery time (e.g., "15-20 mins", "30 mins")',
    example: '15-20 mins' 
  })
  @IsString()
  @IsNotEmpty()
  estimatedDeliveryTime: string;

  @ApiProperty({ 
    description: 'Optional note from driver',
    example: 'Will call when arrived',
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class DriverPickupDto {
  @ApiProperty({ 
    description: 'Optional note from driver',
    example: 'Package picked up from restaurant',
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;
} 