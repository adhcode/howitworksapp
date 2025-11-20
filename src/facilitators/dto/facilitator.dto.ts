import { IsEmail, IsString, IsUUID, IsOptional, IsBoolean, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFacilitatorDto {
  @ApiProperty({ description: 'First name of the facilitator' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the facilitator' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Email address of the facilitator' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password for the facilitator account' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Phone number of the facilitator' })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({ description: 'Next of kin name' })
  @IsOptional()
  @IsString()
  nextOfKinName?: string;

  @ApiPropertyOptional({ description: 'Next of kin phone number' })
  @IsOptional()
  @IsString()
  nextOfKinPhone?: string;

  @ApiPropertyOptional({ description: 'Next of kin relationship' })
  @IsOptional()
  @IsString()
  nextOfKinRelationship?: string;
}

export class AssignFacilitatorDto {
  @ApiProperty({ description: 'ID of the facilitator to assign' })
  @IsUUID()
  facilitatorId: string;

  @ApiProperty({ description: 'ID of the property to assign facilitator to' })
  @IsUUID()
  propertyId: string;
}

export class UpdateFacilitatorStatusDto {
  @ApiProperty({ description: 'Active status of the facilitator' })
  @IsBoolean()
  isActive: boolean;
}

export class FacilitatorStatsDto {
  @ApiProperty({ description: 'Number of properties assigned to facilitator' })
  assignedProperties: number;

  @ApiProperty({ description: 'Number of pending maintenance requests' })
  pendingMaintenanceRequests: number;

  @ApiProperty({ description: 'Number of unread messages' })
  unreadMessages: number;

  @ApiProperty({ description: 'Total number of tenants managed' })
  totalTenants: number;
}

export class FacilitatorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class PropertyAssignmentResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  property: any;

  @ApiProperty()
  facilitator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}



