import { IsString, IsMongoId, IsNumber, IsOptional, IsArray, IsEnum, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class NutritionInfoDto {
  @IsOptional()
  @IsNumber()
  calories?: number;

  @IsOptional()
  @IsNumber()
  protein?: number;

  @IsOptional()
  @IsNumber()
  fat?: number;

  @IsOptional()
  @IsNumber()
  carbs?: number;
}

export class CreateProductDto {
  @IsMongoId()
  restaurantId: string;

  @IsMongoId()
  categoryId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @IsOptional()
  @IsEnum(['active', 'archived'])
  status?: 'active' | 'archived';

  // ML & Inventory relevant fields:
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[]; // ex: ['chicken', 'rice', 'pepper']

  @IsOptional()
  @IsNumber()
  weight?: number; // in grams

  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionInfoDto)
  nutrition?: NutritionInfoDto;
}

export class UpdateProductDto {
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @IsOptional()
  @IsEnum(['active', 'archived'])
  status?: 'active' | 'archived';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionInfoDto)
  nutrition?: NutritionInfoDto;
}

export class ProductResponseDto {
  @IsMongoId()
  _id: string;

  @IsMongoId()
  restaurantId: string;

  @IsMongoId()
  categoryId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @IsEnum(['active', 'archived'])
  status: 'active' | 'archived';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionInfoDto)
  nutrition?: NutritionInfoDto;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
} 