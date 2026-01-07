import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsOptional, IsObject, IsMongoId, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatusEnum, OrderTypeEnum } from '../../kafka/constants/enums';

export type OrderType = typeof OrderTypeEnum[keyof typeof OrderTypeEnum];
export type OrderStatus = typeof OrderStatusEnum[keyof typeof OrderStatusEnum];

export class DeliveryAddress {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  postalCode: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export class OrderItem {
  @ApiProperty()
  @IsMongoId()
  productId: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({ enum: OrderTypeEnum })
  @IsEnum(OrderTypeEnum)
  orderType: OrderType;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  tableNumber?: number;

  @ApiProperty({ required: false, type: DeliveryAddress })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryAddress)
  deliveryAddress?: DeliveryAddress;

  @ApiProperty({ type: [OrderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItem)
  items: OrderItem[];
}

export class OrderResponseDto {
  @ApiProperty()
  @IsMongoId()
  _id: string;

  @ApiProperty()
  @IsMongoId()
  restaurantId: string;

  @ApiProperty()
  @IsMongoId()
  customerId: string;

  @ApiProperty({ enum: OrderTypeEnum })
  @IsEnum(OrderTypeEnum)
  orderType: OrderType;

  @ApiProperty({ enum: OrderStatusEnum })
  @IsEnum(OrderStatusEnum)
  status: OrderStatus;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  tableNumber?: number;

  @ApiProperty({ required: false, type: DeliveryAddress })
  @IsObject()
  @IsOptional()
  deliveryAddress?: DeliveryAddress;

  @ApiProperty({ type: [OrderItem] })
  @IsArray()
  items: OrderItem[];

  @ApiProperty()
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  waiterId?: string;

  @ApiProperty({ required: false })
  @IsMongoId()
  @IsOptional()
  driverId?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  kitchenNotes?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  estimatedDeliveryTime?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  actualDeliveryTime?: Date;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  cancellationReason?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export type OrderEvent = {
  orderId: string;
  restaurantId: string;
  customerId: string;
  status: OrderStatus;
  timestamp: Date;
  metadata?: Record<string, any>;
};

// Remove duplicate exports 