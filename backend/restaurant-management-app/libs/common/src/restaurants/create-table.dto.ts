import { 
    IsMongoId, 
    IsNotEmpty, 
    IsNumber, 
    IsOptional, 
    IsString,
    IsEnum,
    IsArray,
    Min,
    Max,
} from 'class-validator';

export class CreateTableDTO {
  @IsNumber()
  @IsNotEmpty()
  number: number;

  @IsNumber()
  @Min(1)
  capacity: number;

  @IsEnum(['indoor', 'outdoor', 'bar'])
  type: 'indoor' | 'outdoor' | 'bar';

  @IsArray()
  @IsEnum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], { each: true })
  @IsOptional()
  unavailableDays?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  minReservationTime?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxReservationTime?: number;
}