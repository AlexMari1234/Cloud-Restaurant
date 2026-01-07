import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { OrderStatus } from './order.dto';
import { OrderStatusEnum } from '../../kafka/constants/enums';

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    description: 'New order status',
    enum: OrderStatusEnum,
    example: 'KITCHEN_ACCEPTED'
  })
  @IsEnum(OrderStatusEnum)
  status: OrderStatus;

  @ApiProperty({ 
    description: 'Optional note for the status update',
    example: 'Special attention to allergies',
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ 
    description: 'Additional metadata for the status update',
    example: {
      chefId: 'chef123',
      estimatedPrepTime: '25-30 mins',
      waiterId: 'waiter456',
      driverId: 'driver789'
    },
    required: false
  })
  @IsObject()
  @IsOptional()
  metadata?: {
    chefId?: string;
    waiterId?: string;
    driverId?: string;
    estimatedPrepTime?: string;
    preparationStartedAt?: Date;
    readyAt?: Date;
    [key: string]: any;
  };
} 