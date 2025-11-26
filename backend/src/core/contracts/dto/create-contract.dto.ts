import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsEnum, IsDateString, IsBoolean, IsOptional, Min } from 'class-validator';

export enum LandlordPayoutType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/**
 * DTO for creating a contract for a NEW tenant
 * 
 * New tenant = Starting fresh lease, no existing lease elsewhere
 * Payment starts on lease start date
 */
export class CreateNewTenantContractDto {
  @ApiProperty({ description: 'Tenant user ID' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Landlord user ID' })
  @IsUUID()
  landlordId: string;

  @ApiProperty({ description: 'Property ID' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ description: 'Unit ID' })
  @IsUUID()
  unitId: string;

  @ApiProperty({ description: 'Monthly rent amount', example: 1500.00 })
  @IsNumber()
  @Min(0)
  monthlyAmount: number;

  @ApiProperty({ description: 'Lease start date (when tenant moves in)' })
  @IsDateString()
  leaseStartDate: string;

  @ApiProperty({ description: 'Lease end date (when lease expires)' })
  @IsDateString()
  leaseEndDate: string;

  @ApiProperty({ 
    description: 'How landlord wants to receive payment',
    enum: LandlordPayoutType,
    example: LandlordPayoutType.MONTHLY
  })
  @IsEnum(LandlordPayoutType)
  landlordPayoutType: LandlordPayoutType;
}

/**
 * DTO for creating a contract for an EXISTING tenant
 * 
 * Existing tenant = Already has active lease elsewhere, transitioning to Homezy
 * 
 * Landlord provides:
 * - Current lease expiry date (when their existing lease ends)
 * - New monthly rent amount (what they'll pay through Homezy)
 * 
 * System calculates:
 * - Transition start date (when they start paying):
 *   * If monthly payout: 3 months before expiry
 *   * If yearly payout: 6 months before expiry
 *   * If that date has passed, starts immediately
 * - First payment due date
 */
export class CreateExistingTenantContractDto {
  @ApiProperty({ description: 'Tenant user ID' })
  @IsUUID()
  tenantId: string;

  @ApiProperty({ description: 'Landlord user ID' })
  @IsUUID()
  landlordId: string;

  @ApiProperty({ description: 'Property ID' })
  @IsUUID()
  propertyId: string;

  @ApiProperty({ description: 'Unit ID' })
  @IsUUID()
  unitId: string;

  @ApiProperty({ description: 'Monthly rent amount (NEW amount for Homezy)', example: 1500.00 })
  @IsNumber()
  @Min(0)
  monthlyAmount: number;

  @ApiProperty({ 
    description: 'When the tenant\'s CURRENT lease expires (not on Homezy)',
    example: '2025-12-31'
  })
  @IsDateString()
  currentLeaseExpiryDate: string;

  @ApiProperty({ 
    description: 'How landlord wants to receive payment',
    enum: LandlordPayoutType,
    example: LandlordPayoutType.MONTHLY
  })
  @IsEnum(LandlordPayoutType)
  landlordPayoutType: LandlordPayoutType;

  @ApiPropertyOptional({ 
    description: 'Optional: When the new Homezy lease should end. If not provided, defaults to 1 year after current lease expiry.',
  })
  @IsOptional()
  @IsDateString()
  newLeaseEndDate?: string;
}

/**
 * DTO for updating a contract
 */
export class UpdateContractDto {
  @ApiPropertyOptional({ description: 'Update monthly rent amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyAmount?: number;

  @ApiPropertyOptional({ description: 'Update lease end date' })
  @IsOptional()
  @IsDateString()
  leaseEndDate?: string;

  @ApiPropertyOptional({ description: 'Update payout type' })
  @IsOptional()
  @IsEnum(LandlordPayoutType)
  landlordPayoutType?: LandlordPayoutType;
}

/**
 * DTO for querying contracts
 */
export class ContractQueryDto {
  @ApiPropertyOptional({ description: 'Filter by tenant ID' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({ description: 'Filter by landlord ID' })
  @IsOptional()
  @IsUUID()
  landlordId?: string;

  @ApiPropertyOptional({ description: 'Filter by property ID' })
  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ['active', 'expired', 'terminated', 'pending'] })
  @IsOptional()
  status?: string;
}

/**
 * Response DTO for contract details
 */
export class ContractResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  landlordId: string;

  @ApiProperty()
  propertyId: string;

  @ApiProperty()
  unitId: string;

  @ApiProperty()
  monthlyAmount: string;

  @ApiProperty()
  leaseStartDate: Date;

  @ApiProperty()
  leaseEndDate: Date;

  @ApiProperty({ enum: LandlordPayoutType })
  landlordPayoutType: LandlordPayoutType;

  @ApiProperty()
  nextPaymentDue: Date;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isExistingTenant: boolean;

  @ApiPropertyOptional({ description: 'For existing tenants only' })
  currentLeaseExpiry?: Date;

  @ApiPropertyOptional({ description: 'For existing tenants only' })
  transitionStartDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}



