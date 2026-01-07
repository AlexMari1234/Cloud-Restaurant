import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ description: 'Name of the menu' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the menu', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether the menu is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Currency used for prices', default: 'RON' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Language of the menu', default: 'ro' })
  @IsString()
  @IsOptional()
  language?: string;
}

export class UpdateMenuDto extends CreateMenuDto {
  // Inherits all properties from CreateMenuDto
}

export class MenuResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  @IsMongoId()
  _id: string;

  @ApiProperty({ description: 'Restaurant ID' })
  @IsMongoId()
  restaurantId: string;

  @ApiProperty({ description: 'Name of the menu' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the menu', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Whether the menu is active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Currency used for prices' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Language of the menu' })
  @IsString()
  language: string;

  @ApiProperty({ description: 'ID of user who last updated the menu', required: false })
  @IsMongoId()
  @IsOptional()
  lastUpdatedBy?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
} 