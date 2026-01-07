import { IsString, IsArray, IsNotEmpty, IsOptional, IsEmail, ValidateNested, IsPhoneNumber, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ============================= Item DTOs =============================

export class DeliveryTakeawayOrderItemDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

// ============================= Create Order DTOs =============================

export class CreateDeliveryOrderDto {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryTakeawayOrderItemDto)
  items: DeliveryTakeawayOrderItemDto[];

  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsOptional()
  @IsString()
  orderNotes?: string;
}

export class CreateTakeawayOrderDto {
  @IsString()
  @IsNotEmpty()
  restaurantId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DeliveryTakeawayOrderItemDto)
  items: DeliveryTakeawayOrderItemDto[];

  @IsEmail()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  customerPhone: string;

  @IsOptional()
  @IsString()
  orderNotes?: string;
}

// ============================= Update Status DTOs =============================

export class UpdateDeliveryStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'PENDING' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateTakeawayStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'PENDING' | 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY' | 'PICKED_UP';

  @IsOptional()
  @IsString()
  note?: string;
}

// ============================= Kitchen Accept DTOs =============================

export class KitchenAcceptDeliveryOrderDto {
  @ApiProperty({ 
    description: 'Estimated preparation time (e.g., "25-30 mins", "45 mins")',
    example: '25-30 mins' 
  })
  @IsString()
  @IsNotEmpty()
  estimatedPrepTime: string; // Obligatoriu: e.g., "25-30 mins", "45 mins"

  @ApiProperty({ 
    description: 'Optional note from kitchen',
    example: 'Special attention to allergies',
    required: false 
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class KitchenAcceptTakeawayOrderDto {
  @ApiProperty({ 
    description: 'Estimated preparation time (e.g., "25-30 mins", "45 mins")',
    example: '25-30 mins' 
  })
  @IsString()
  @IsNotEmpty()
  estimatedPrepTime: string; // Obligatoriu: e.g., "25-30 mins", "45 mins"

  @ApiProperty({ 
    description: 'Optional note from kitchen',
    example: 'Special attention to allergies',
    required: false 
  })
  @IsOptional()
  @IsString()
  note?: string;
}

// ============================= Kitchen Preparing DTOs =============================

export class KitchenStartPreparingDeliveryOrderDto {
  @ApiProperty({ 
    description: 'Optional note when starting preparation',
    example: 'Started cooking',
    required: false 
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class KitchenStartPreparingTakeawayOrderDto {
  @ApiProperty({ 
    description: 'Optional note when starting preparation',
    example: 'Started cooking',
    required: false 
  })
  @IsOptional()
  @IsString()
  note?: string;
}

// ============================= Kitchen Ready DTOs =============================

export class KitchenMarkReadyDeliveryOrderDto {
  @ApiProperty({ 
    description: 'Optional note when order is ready for delivery',
    example: 'Extra hot as requested',
    required: false 
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class KitchenMarkReadyTakeawayOrderDto {
  @ApiProperty({ 
    description: 'Optional note when order is ready for pickup',
    example: 'Extra hot as requested',
    required: false 
  })
  @IsOptional()
  @IsString()
  note?: string;
}

// ============================= Completion DTOs =============================

export class CompleteDeliveryOrderDto {
  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CompleteTakeawayOrderDto {
  @IsOptional()
  @IsString()
  waiterId?: string;

  @IsOptional()
  @IsString()
  note?: string;
} 