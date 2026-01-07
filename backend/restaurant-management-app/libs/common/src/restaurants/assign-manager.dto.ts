import { IsMongoId } from 'class-validator';

export class AssignManagerDTO {
  @IsMongoId()
  managerId: string;
}