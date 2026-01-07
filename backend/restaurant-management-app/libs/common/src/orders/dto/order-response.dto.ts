import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsEnum, IsDate, IsMongoId } from 'class-validator';
import { OrderType, OrderStatus, DeliveryAddress } from '../../kafka/constants/events';
import { OrderTypeEnum, OrderStatusEnum } from '../../kafka/constants/enums';

export class OrderItemResponseDto {
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

export class OrderResponseDto {
  @ApiProperty({ description: 'Order ID' })
  @IsMongoId()
  _id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsMongoId()
  restaurantId: string;

  @ApiProperty({ description: 'Customer ID' })
  @IsMongoId()
  customerId: string;

  @ApiProperty({ 
    description: 'Type of order (DINE_IN or DELIVERY)',
    enum: OrderTypeEnum
  })
  @IsEnum(OrderTypeEnum)
  orderType: OrderType;

  @ApiProperty({ 
    description: 'Current status of the order',
    enum: OrderStatusEnum
  })
  @IsEnum(OrderStatusEnum)
  status: OrderStatus;

  @ApiProperty({ description: 'Table number (for DINE_IN)', required: false })
  @IsNumber()
  @IsOptional()
  tableNumber?: number;

  @ApiProperty({ description: 'Delivery address (for DELIVERY)', required: false })
  @IsOptional()
  deliveryAddress?: DeliveryAddress;

  @ApiProperty({ description: 'Order items', type: [OrderItemResponseDto] })
  @IsArray()
  items: OrderItemResponseDto[];

  @ApiProperty({ description: 'Total amount of the order' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ description: 'ID of the waiter (for DINE_IN)', required: false })
  @IsMongoId()
  @IsOptional()
  waiterId?: string;

  @ApiProperty({ description: 'ID of the driver (for DELIVERY)', required: false })
  @IsMongoId()
  @IsOptional()
  driverId?: string;

  @ApiProperty({ description: 'Kitchen notes', required: false })
  @IsString()
  @IsOptional()
  kitchenNotes?: string;

  @ApiProperty({ description: 'Estimated delivery time', required: false })
  @IsDate()
  @IsOptional()
  estimatedDeliveryTime?: Date;

  @ApiProperty({ description: 'Actual delivery time', required: false })
  @IsDate()
  @IsOptional()
  actualDeliveryTime?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @IsDate()
  updatedAt: Date;
} 