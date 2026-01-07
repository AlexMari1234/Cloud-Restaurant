import { IsBoolean } from 'class-validator';

export class BooleanDTO {
  @IsBoolean()
  value: boolean;
}


