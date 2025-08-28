import { IsString, IsEmail, IsOptional, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantInvitationDto {
  @ApiProperty({ description: 'Property ID' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ description: 'Unit ID' })
  @IsUUID()
  unitId: string;

  @ApiProperty({ description: 'Tenant first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Tenant last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Tenant email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Tenant phone number' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Emergency contact name' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Emergency contact phone' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiProperty({ description: 'Lease start date' })
  @IsDateString()
  leaseStartDate: string;

  @ApiProperty({ description: 'Lease end date' })
  @IsDateString()
  leaseEndDate: string;

  @ApiProperty({ description: 'Monthly rent amount' })
  @IsNumber()
  monthlyRent: number;

  @ApiPropertyOptional({ description: 'Security deposit amount' })
  @IsOptional()
  @IsNumber()
  securityDeposit?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Invitation token' })
  @IsString()
  token: string;
}

export class TenantSignupWithTokenDto {
  @ApiProperty({ description: 'Invitation token' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Password for the new account' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Email address for the new account' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Updated phone number' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Updated emergency contact' })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiPropertyOptional({ description: 'Updated emergency phone' })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;
}