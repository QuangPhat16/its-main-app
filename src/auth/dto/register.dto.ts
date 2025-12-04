import { IsEmail, IsEnum, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user-role.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}