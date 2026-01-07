import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsEnum, IsMongoId, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from '../../kafka/constants/events';
import { OrderTypeEnum } from '../../kafka/constants/enums';

export class AddToCartDto {
  @ApiProperty({ description: 'Quantity of the product to add' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Special instructions for this item', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class UpdateCartItemDto {
  @ApiProperty({ description: 'New quantity for the cart item' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Special instructions for this item', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class DeliveryAddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Phone number for delivery contact' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ description: 'Additional delivery instructions', required: false })
  @IsString()
  @IsOptional()
  deliveryInstructions?: string;

  @ApiProperty({ description: 'Coordinates', required: false })
  @IsObject()
  @IsOptional()
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export class SetOrderTypeDto {
  @ApiProperty({ enum: OrderTypeEnum, description: 'Type of order' })
  @IsEnum(OrderTypeEnum)
  orderType: OrderType;

  @ApiProperty({ description: 'Table number for dine-in orders', required: false })
  @IsNumber()
  @IsOptional()
  tableNumber?: number;

  @ApiProperty({ description: 'Delivery address for delivery orders', required: false, type: DeliveryAddressDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress?: DeliveryAddressDto;

  @ApiProperty({ description: 'Customer phone for takeaway orders', required: false })
  @IsString()
  @IsOptional()
  takeawayPhone?: string;

  @ApiProperty({ description: 'Customer name for takeaway orders', required: false })
  @IsString()
  @IsOptional()
  takeawayName?: string;
}

export class CartItemResponseDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Quantity of the product' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Price of the product' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Special instructions for this item', required: false })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

export class CartResponseDto {
  @ApiProperty({ description: 'Cart ID' })
  @IsMongoId()
  _id: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsMongoId()
  customerId: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsMongoId()
  restaurantId: string;

  @ApiProperty({ description: 'Items in the cart', type: [CartItemResponseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemResponseDto)
  items: CartItemResponseDto[];

  @ApiProperty({ description: 'Total amount' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ enum: OrderTypeEnum, description: 'Order type', required: false })
  @IsEnum(OrderTypeEnum)
  @IsOptional()
  orderType?: OrderType;

  @ApiProperty({ description: 'Table number for dine-in', required: false })
  @IsNumber()
  @IsOptional()
  tableNumber?: number;

  @ApiProperty({ description: 'Delivery address', required: false, type: DeliveryAddressDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress?: DeliveryAddressDto;

  @ApiProperty({ description: 'Customer phone for takeaway orders', required: false })
  @IsString()
  @IsOptional()
  takeawayPhone?: string;

  @ApiProperty({ description: 'Customer name for takeaway orders', required: false })
  @IsString()
  @IsOptional()
  takeawayName?: string;

  @ApiProperty({ description: 'Last updated timestamp' })
  lastUpdated: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;
} 