import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsNumber, IsArray, ValidateNested, IsMongoId, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class WaiterAcceptOrderDto {
  @ApiProperty({ 
    description: 'Optional note when accepting the order',
    example: 'Will serve to table 5',
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class WaiterServeOrderDto {
  @ApiProperty({ 
    description: 'Optional note when serving the order',
    example: 'Served hot and fresh to table 5',
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class WaiterCompleteOrderDto {
  @ApiProperty({ 
    description: 'Optional note when completing the order',
    example: 'Customer satisfied, payment processed',
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;
}

// DTO for creating individual items in a batch
export class CreateDineInOrderItemDto {
  @ApiProperty({ 
    description: 'Product ID from menu',
    example: '675abc123def456789012345'
  })
  @IsMongoId()
  productId: string;

  @ApiProperty({ 
    description: 'Quantity of the product',
    example: 2
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({ 
    description: 'Special instructions for this item',
    example: 'No onions, extra cheese',
    required: false
  })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

// DTO for creating a batch within an order
export class CreateDineInOrderBatchDto {
  @ApiProperty({ 
    description: 'List of items in this batch',
    type: [CreateDineInOrderItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDineInOrderItemDto)
  items: CreateDineInOrderItemDto[];

  @ApiProperty({ 
    description: 'Optional note for this batch',
    example: 'First course - appetizers',
    required: false
  })
  @IsString()
  @IsOptional()
  batchNote?: string;
}

// DTO for creating complete dine-in order with batches
export class CreateDineInOrderDto {
  @ApiProperty({ 
    description: 'Customer email to identify/create customer account',
    example: 'customer@example.com'
  })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ 
    description: 'Table number for dine-in service',
    example: 5
  })
  @IsNumber()
  tableNumber: number;

  @ApiProperty({ 
    description: 'Array of batches, each containing items',
    type: [CreateDineInOrderBatchDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDineInOrderBatchDto)
  batches: CreateDineInOrderBatchDto[];

  @ApiProperty({ 
    description: 'Optional order notes',
    example: 'Customer has nut allergy',
    required: false
  })
  @IsString()
  @IsOptional()
  orderNotes?: string;

  @ApiProperty({ 
    description: 'Optional customer name for reservation reference',
    example: 'John Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  customerName?: string;
}

// DTO for adding items to existing order
export class AddItemToOrderDto {
  @ApiProperty({ 
    description: 'Product ID to add',
    example: '675abc123def456789012345'
  })
  @IsMongoId()
  productId: string;

  @ApiProperty({ 
    description: 'Quantity to add',
    example: 1
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({ 
    description: 'Special instructions for this item',
    example: 'Extra spicy',
    required: false
  })
  @IsString()
  @IsOptional()
  specialInstructions?: string;
}

// DTO for sending a complete batch to kitchen
export class SendBatchToKitchenDto {
  @ApiProperty({ 
    description: 'Batch number to send to kitchen (1, 2, 3, etc.)',
    example: 1
  })
  @IsNumber()
  batchNumber: number;

  @ApiProperty({ 
    description: 'Optional note for the kitchen',
    example: 'Customer is in a hurry',
    required: false
  })
  @IsString()
  @IsOptional()
  kitchenNote?: string;
}

export class KitchenAcceptBatchDto {
  @ApiProperty({ 
    description: 'Batch number to accept',
    example: 1
  })
  @IsNumber()
  batchNumber: number;

  @ApiProperty({ 
    description: 'Optional note when accepting the batch',
    example: 'All items in batch are feasible',
    required: false
  })
  @IsString()
  @IsOptional()
  note?: string;
}

// DTO for updating batch status
export class UpdateBatchStatusDto {
  @ApiProperty({ 
    description: 'Batch number to update',
    example: 1
  })
  @IsNumber()
  batchNumber: number;

  @ApiProperty({ 
    description: 'New status for all items in batch',
    example: 'PREPARING',
    enum: ['KITCHEN_ACCEPTED', 'PREPARING', 'READY']
  })
  @IsString()
  batchStatus: 'KITCHEN_ACCEPTED' | 'PREPARING' | 'READY';

  @ApiProperty({ 
    description: 'Optional note for batch update',
    example: 'All items in batch are being prepared',
    required: false
  })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({
    description: 'Optional array for updating status of individual items in batch',
    required: false,
    type: [Object],
    example: [
      { productId: '68415844316a7bab4b7a6233', status: 'PREPARING' }
    ]
  })
  @IsOptional()
  @IsArray()
  itemStatuses?: { productId: string; status: string }[];
}

// DTO for serving a complete batch
export class ServeBatchDto {
  @ApiProperty({ 
    description: 'Batch number to serve',
    example: 1
  })
  @IsNumber()
  batchNumber: number;

  @ApiProperty({ 
    description: 'Optional note when serving',
    example: 'Served hot to table 5',
    required: false
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class RequestPaymentDto {
  @ApiProperty({ 
    description: 'Optional note for payment request',
    example: 'Customer ready to pay',
    required: false
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class CompletePaymentDto {
  @ApiProperty({ 
    description: 'Payment method used',
    example: 'CARD',
    enum: ['CASH', 'CARD', 'DIGITAL']
  })
  @IsString()
  paymentMethod: 'CASH' | 'CARD' | 'DIGITAL';

  @ApiProperty({ 
    description: 'Amount paid by customer',
    example: 45.50
  })
  @IsNumber()
  amountPaid: number;

  @ApiProperty({ 
    description: 'Optional note for payment completion',
    example: 'Customer satisfied',
    required: false
  })
  @IsString()
  @IsOptional()
  note?: string;
}

// DTO for adding a new batch to existing order
export class AddBatchToOrderDto {
  @ApiProperty({ 
    description: 'List of items in this new batch',
    type: [CreateDineInOrderItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDineInOrderItemDto)
  items: CreateDineInOrderItemDto[];

  @ApiProperty({ 
    description: 'Optional note for the batch',
    example: 'Customer ordered desserts',
    required: false
  })
  @IsString()
  @IsOptional()
  batchNote?: string;

  @ApiProperty({ 
    description: 'Send directly to kitchen after adding',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  sendToKitchen?: boolean;
}

 