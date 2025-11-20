import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../auth/dto/auth.dto';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'facilitator@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ enum: UserRole, example: UserRole.FACILITATOR })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @ApiPropertyOptional({ example: '+2348087654321' })
  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  @ApiPropertyOptional({ example: 'Sister' })
  @IsOptional()
  @IsString()
  nextOfKinRelationship?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @ApiPropertyOptional({ example: '+2348087654321' })
  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  @ApiPropertyOptional({ example: 'Sister' })
  @IsOptional()
  @IsString()
  nextOfKinRelationship?: string;
}

export class AdminAssignFacilitatorDto {
  @ApiProperty({ example: 'uuid-string' })
  @IsUUID()
  facilitatorId: string;
}


