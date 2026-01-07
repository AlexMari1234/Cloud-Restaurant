import { IsMongoId, IsEnum, IsNumber } from 'class-validator';

export class CreateEmployeeDTO {
  @IsMongoId()
  userId: string;

  @IsEnum(['chef', 'waiter', 'cashier', 'manager', 'assistant_chef', 'driver'])
  roleLabel: 'chef' | 'waiter' | 'cashier' | 'manager' | 'assistant_chef' | 'driver';

  @IsNumber()
  hourlyRate: number;
}

export class CreateShiftDto {
  employeeId: string;
  startTime: Date;
  endTime: Date;
}

export class UpdateShiftDto {
  startTime?: Date;
  endTime?: Date;
  status?: 'scheduled' | 'completed' | 'missed';
}
