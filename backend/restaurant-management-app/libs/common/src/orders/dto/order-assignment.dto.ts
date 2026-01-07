import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsMongoId, IsEnum } from 'class-validator';

export enum StaffRole {
  CHEF = 'CHEF',
  ASSISTANT_CHEF = 'ASSISTANT_CHEF',
  WAITER = 'WAITER',
  DRIVER = 'DRIVER',
}

export class OrderAssignmentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsMongoId()
  orderId: string;

  @ApiProperty({ description: 'Chef ID (required)' })
  @IsMongoId()
  chefId: string;

  @ApiProperty({ description: 'Assistant Chef ID (optional)', required: false })
  @IsMongoId()
  @IsOptional()
  assistantChefId?: string;

  @ApiProperty({ description: 'Waiter ID (for dine-in orders)', required: false })
  @IsMongoId()
  @IsOptional()
  waiterId?: string;

  @ApiProperty({ description: 'Driver ID (for delivery orders)', required: false })
  @IsMongoId()
  @IsOptional()
  driverId?: string;

  @ApiProperty({ description: 'Estimated preparation time in minutes' })
  @IsNumber()
  estimatedPrepTime: number;

  @ApiProperty({ description: 'Estimated delivery time in minutes (for delivery orders)', required: false })
  @IsNumber()
  @IsOptional()
  estimatedDeliveryTime?: number;
}

export class KitchenConfirmationDto {
  @ApiProperty({ description: 'Order ID' })
  @IsMongoId()
  orderId: string;

  @ApiProperty({ description: 'Chef ID confirming the order' })
  @IsMongoId()
  chefId: string;

  @ApiProperty({ description: 'Assistant Chef ID (optional)', required: false })
  @IsMongoId()
  @IsOptional()
  assistantChefId?: string;

  @ApiProperty({ description: 'Estimated preparation time in minutes' })
  @IsNumber()
  estimatedPrepTime: number;

  @ApiProperty({ description: 'Kitchen notes', required: false })
  @IsString()
  @IsOptional()
  kitchenNotes?: string;
}

export class StaffAssignmentDto {
  @ApiProperty({ description: 'Order ID' })
  @IsMongoId()
  orderId: string;

  @ApiProperty({ description: 'Staff member ID' })
  @IsMongoId()
  staffId: string;

  @ApiProperty({ enum: StaffRole, description: 'Staff role' })
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiProperty({ description: 'Estimated time for this role in minutes', required: false })
  @IsNumber()
  @IsOptional()
  estimatedTime?: number;
} 