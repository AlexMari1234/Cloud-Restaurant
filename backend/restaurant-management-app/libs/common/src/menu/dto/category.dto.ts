import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsMongoId } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the category' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Parent category ID', required: false })
  @IsMongoId()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'Sort order for display', default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Type of category', enum: ['products', 'subcategories'] })
  @IsString()
  type: 'products' | 'subcategories';
}

export class UpdateCategoryDto extends CreateCategoryDto {
  // Inherits all properties from CreateCategoryDto
}

export class CategoryResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  @IsMongoId()
  _id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsMongoId()
  restaurantId: string;

  @ApiProperty({ description: 'Menu ID this category belongs to' })
  @IsMongoId()
  menuId: string;

  @ApiProperty({ description: 'Name of the category' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Parent category ID', required: false })
  @IsMongoId()
  @IsOptional()
  parentId?: string;

  @ApiProperty({ description: 'Sort order for display', default: 0 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({ description: 'Type of category', enum: ['products', 'subcategories'] })
  @IsString()
  type: 'products' | 'subcategories';

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 