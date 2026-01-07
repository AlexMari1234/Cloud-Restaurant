import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UserRegisterDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsEnum(['manager', 'employee'])
  requestedRole?: 'manager' | 'employee';
}