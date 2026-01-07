import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsUrl,
  ValidateNested,
  ArrayMinSize,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GeoDTO {
  @IsString()
  type: 'Point';

  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  coordinates: [number, number];
}

export class UpdateRestaurantDTO {
  @IsOptional()
  @IsString() @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString() @IsNotEmpty()
  slug?: string;

  @IsOptional()
  @IsUrl() @IsNotEmpty()
  logoUrl?: string;

  @IsOptional()
  @IsString() @IsNotEmpty()
  address?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoDTO)
  geo?: GeoDTO;
  
  @IsOptional()
  @IsString() @IsNotEmpty()
  timezone?: string;

  @IsOptional()
  @IsNumber() @Min(1)
  capacity?: number;

  @IsOptional()
  @IsNumber() @Min(0) @Max(23)
  openingHour?: number;

  @IsOptional()
  @IsNumber() @Min(0) @Max(23)
  closingHour?: number;

  @IsOptional()
  @IsNumber() @Min(30) @Max(180)
  reservationDuration?: number;

  @IsOptional()
  @IsNumber() @Min(15) @Max(60)
  timeSlotInterval?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], { each: true })
  closedDays?: string[];

  @IsOptional()
  @IsMongoId()
  managerId?: string;
}
