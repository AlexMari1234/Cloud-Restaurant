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
  IsObject,
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

export class CreateRestaurantDTO {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  slug: string;

  @IsUrl() @IsNotEmpty()
  logoUrl: string;

  @IsString() @IsNotEmpty()
  address: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeoDTO)
  geo?: GeoDTO;
  
  @IsString() @IsNotEmpty()
  timezone: string;

  @IsNumber() @Min(1)
  capacity: number;

  @IsNumber() @Min(0) @Max(23)
  openingHour: number;

  @IsNumber() @Min(0) @Max(23)
  closingHour: number;

  @IsNumber() @Min(30) @Max(180)
  @IsOptional()
  reservationDuration?: number;

  @IsNumber() @Min(15) @Max(60)
  @IsOptional()
  timeSlotInterval?: number;

  @IsArray()
  @IsEnum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], { each: true })
  @IsOptional()
  closedDays?: string[];

  @IsMongoId() @IsOptional()
  managerId?: string;
}

