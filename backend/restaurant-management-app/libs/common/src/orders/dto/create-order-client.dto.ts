import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateOrderFromCartDto {
  @ApiProperty({ 
    description: 'Customer email override (only for dine-in when waiter takes order for different customer)', 
    example: 'customer@example.com', 
    required: false 
  })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ description: 'Special order notes', required: false })
  @IsString()
  @IsOptional()
  orderNotes?: string;
}

export class WaiterCreateOrderDto {
  @ApiProperty({ description: 'Customer email if known', required: false })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiProperty({ description: 'Table number for dine-in orders' })
  @IsOptional()
  tableNumber?: number;

  @ApiProperty({ description: 'Customer name for anonymous orders', required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ description: 'Customer phone for anonymous orders', required: false })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ description: 'Waiter notes', required: false })
  @IsString()
  @IsOptional()
  waiterNotes?: string;
} 