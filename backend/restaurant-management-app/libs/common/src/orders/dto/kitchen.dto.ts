import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class KitchenAcceptOrderDto {
  @ApiProperty({ 
    description: 'Estimated preparation time (e.g., "25-30 mins", "45 mins")',
    example: '25-30 mins' 
  })
  @IsString()
  @IsNotEmpty()
  estimatedPrepTime: string;

  @ApiProperty({ 
    description: 'Optional note from kitchen',
    example: 'Special attention to allergies',
    required: false 
  })
  @IsString()
  @IsOptional()
  kitchenNote?: string;
}

export class KitchenAcceptDeliveryDto {
  @ApiProperty({ 
    description: 'Estimated preparation time (e.g., "25-30 mins", "45 mins")',
    example: '25-30 mins' 
  })
  @IsString()
  @IsNotEmpty()
  estimatedPrepTime: string;

  @ApiProperty({ 
    description: 'Optional note from kitchen',
    example: 'Special attention to allergies',
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class KitchenStartPreparingDto {
  @ApiProperty({ 
    description: 'Optional note when starting preparation',
    example: 'Started cooking',
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;
}

export class KitchenMarkReadyDto {
  @ApiProperty({ 
    description: 'Optional note when order is ready',
    example: 'Extra hot as requested',
    required: false 
  })
  @IsString()
  @IsOptional()
  note?: string;
} 