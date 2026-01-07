import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsEnum, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, DeliveryAddress } from '../../kafka/constants/events';
import { OrderTypeEnum } from '../../kafka/constants/enums';

export class OrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Quantity of the product' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Special instructions for this item', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class CreateOrderDto {
  @ApiProperty({ 
    description: 'Type of order (DINE_IN, DELIVERY, TAKEAWAY)',
    enum: OrderTypeEnum
  })
  @IsEnum(OrderTypeEnum)
  orderType: OrderType;

  @ApiProperty({ description: 'Table number (required for DINE_IN)', required: false })
  @IsNumber()
  @IsOptional()
  tableNumber?: number;

  @ApiProperty({ description: 'Delivery address (required for DELIVERY)', required: false })
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  @IsOptional()
  deliveryAddress?: DeliveryAddress;

  @ApiProperty({ description: 'Phone number (required for TAKEAWAY)', required: false })
  @IsString()
  @IsOptional()
  takeawayPhone?: string;

  @ApiProperty({ description: 'Customer name (required for TAKEAWAY)', required: false })
  @IsString()
  @IsOptional()
  takeawayName?: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Special notes for the order', required: false })
  @IsString()
  @IsOptional()
  orderNotes?: string;
}

export class DeliveryAddressDto implements DeliveryAddress {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Coordinates', required: false })
  @IsOptional()
  coordinates?: {
    lat: number;
    lng: number;
  };
}

 