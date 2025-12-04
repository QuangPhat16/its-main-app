import { IsEmail, IsEnum, MinLength, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
@ApiProperty({ example: 'instructor@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', minLength: 6 })
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: UserRole.INSTRUCTOR })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}