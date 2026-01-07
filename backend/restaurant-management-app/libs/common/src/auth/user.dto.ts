import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsString()
  role: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  requestedRole?: string;
}
