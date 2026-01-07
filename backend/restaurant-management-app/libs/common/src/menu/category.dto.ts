import { IsString, IsOptional, IsNumber, IsMongoId, IsDate } from 'class-validator';

export class CreateCategoryDto {
  @IsMongoId()
  restaurantId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsString()
  type: 'products' | 'subcategories';
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  type?: 'products' | 'subcategories';
}

export class CategoryResponseDto {
  @IsMongoId()
  _id: string;

  @IsMongoId()
  restaurantId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsString()
  type: 'products' | 'subcategories';

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
} 