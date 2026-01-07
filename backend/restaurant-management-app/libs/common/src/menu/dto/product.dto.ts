import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsMongoId, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NutritionDto {
  @ApiProperty({ description: 'Calories', required: false })
  @IsNumber()
  @IsOptional()
  calories?: number;

  @ApiProperty({ description: 'Protein in grams', required: false })
  @IsNumber()
  @IsOptional()
  protein?: number;

  @ApiProperty({ description: 'Fat in grams', required: false })
  @IsNumber()
  @IsOptional()
  fat?: number;

  @ApiProperty({ description: 'Carbohydrates in grams', required: false })
  @IsNumber()
  @IsOptional()
  carbs?: number;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the product', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price of the product' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Currency used for price', default: 'RON' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'URL of product image', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'List of allergens', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergens?: string[];

  @ApiProperty({ description: 'Product status', enum: ['active', 'archived'], default: 'active' })
  @IsEnum(['active', 'archived'])
  @IsOptional()
  status?: 'active' | 'archived';

  @ApiProperty({ description: 'List of ingredients', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];

  @ApiProperty({ description: 'Weight in grams', required: false })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ description: 'Nutritional information', required: false, type: NutritionDto })
  @ValidateNested()
  @Type(() => NutritionDto)
  @IsOptional()
  nutrition?: NutritionDto;
}

export class UpdateProductDto extends CreateProductDto {
  // Inherits all properties from CreateProductDto
}

export class ProductResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  @IsMongoId()
  _id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsMongoId()
  restaurantId: string;

  @ApiProperty({ description: 'Category ID this product belongs to' })
  @IsMongoId()
  categoryId: string;

  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the product', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price of the product' })
  @IsNumber()
  price: number;

  @ApiProperty({ description: 'Currency used for price' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'URL of product image', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'List of allergens', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergens?: string[];

  @ApiProperty({ description: 'Product status', enum: ['active', 'archived'] })
  @IsEnum(['active', 'archived'])
  status: 'active' | 'archived';

  @ApiProperty({ description: 'List of ingredients', type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  ingredients?: string[];

  @ApiProperty({ description: 'Weight of the product', required: false })
  @IsString()
  @IsOptional()
  weight?: string;

  @ApiProperty({ description: 'Nutritional information', required: false, type: NutritionDto })
  @ValidateNested()
  @Type(() => NutritionDto)
  @IsOptional()
  nutrition?: NutritionDto;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 