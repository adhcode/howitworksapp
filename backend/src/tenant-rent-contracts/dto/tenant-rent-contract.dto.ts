import { 
  IsString, 
  IsNumber, 
  IsBoolean, 
  IsDateString, 
  IsEnum, 
  IsUUID, 
  IsOptional, 
  Min, 
  Max,
  Length,
  ValidateIf,
  IsNotEmpty
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsFutureDate, 
  IsAfterOriginalExpiry, 
  IsReasonableRentAmount, 
  IsValidContractDuration,
  IsValidOriginalExpiry
} from '../validators/custom-validators';

export enum LandlordPayoutType {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum ContractStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
}

export class CreateRentContractDto {
  @ApiProperty({ description: 'Tenant user ID' })
  @IsUUID()
  tenantId!: string;

  @ApiProperty({ description: 'Landlord user ID' })
  @IsUUID()
  landlordId!: string;

  @ApiProperty({ description: 'Property ID' })
  @IsUUID()
  propertyId!: string;

  @ApiProperty({ description: 'Unit ID' })
  @IsUUID()
  unitId!: string;

  @ApiProperty({ description: 'Monthly rent amount', example: 25000 })
  @IsNumber({}, { message: 'Monthly amount must be a valid number' })
  @Min(1000, { message: 'Monthly amount must be at least ₦1,000' })
  @Max(10000000, { message: 'Monthly amount cannot exceed ₦10,000,000' })
  @IsReasonableRentAmount()
  monthlyAmount!: number;

  @ApiProperty({ description: 'Contract expiry date', example: '2024-12-31T23:59:59.000Z' })
  @IsDateString({}, { message: 'Expiry date must be a valid ISO date string' })
  @IsFutureDate({ message: 'Contract expiry date must be in the future' })
  @IsValidContractDuration()
  @IsAfterOriginalExpiry()
  expiryDate!: string;

  @ApiProperty({ 
    enum: LandlordPayoutType, 
    description: 'Landlord payout preference',
    example: LandlordPayoutType.MONTHLY 
  })
  @IsEnum(LandlordPayoutType)
  landlordPayoutType!: LandlordPayoutType;

  @ApiProperty({ description: 'Whether this is an existing tenant being transitioned' })
  @IsBoolean()
  isExistingTenant!: boolean;

  @ApiPropertyOptional({ 
    description: 'Original expiry date for existing tenants',
    example: '2024-06-30T23:59:59.000Z' 
  })
  @ValidateIf(o => o.isExistingTenant === true)
  @IsNotEmpty({ message: 'Original expiry date is required for existing tenants' })
  @IsDateString({}, { message: 'Original expiry date must be a valid ISO date string' })
  @IsValidOriginalExpiry()
  originalExpiryDate?: string;
}

export class ProcessPaymentDto {
  @ApiProperty({ description: 'Rent contract ID' })
  @IsUUID()
  contractId!: string;

  @ApiProperty({ description: 'Payment amount', example: 25000 })
  @IsNumber({}, { message: 'Payment amount must be a valid number' })
  @Min(1, { message: 'Payment amount must be greater than 0' })
  @Max(10000000, { message: 'Payment amount cannot exceed ₦10,000,000' })
  amount!: number;

  @ApiPropertyOptional({ description: 'Payment method used' })
  @IsOptional()
  @IsString({ message: 'Payment method must be a string' })
  @Length(1, 50, { message: 'Payment method must be between 1 and 50 characters' })
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Payment reference from payment gateway' })
  @IsOptional()
  @IsString({ message: 'Payment reference must be a string' })
  @Length(1, 100, { message: 'Payment reference must be between 1 and 100 characters' })
  reference?: string;
}

export class UpdateContractStatusDto {
  @ApiProperty({ 
    enum: ContractStatus, 
    description: 'New contract status',
    example: ContractStatus.TERMINATED 
  })
  @IsEnum(ContractStatus)
  status!: ContractStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @Length(1, 500, { message: 'Reason must be between 1 and 500 characters' })
  reason?: string;
}

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

  @ApiPropertyOptional({ 
    enum: ContractStatus, 
    description: 'Filter by contract status' 
  })
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;
}

export class EscrowBalanceQueryDto {
  @ApiProperty({ description: 'Landlord user ID' })
  @IsUUID()
  landlordId!: string;

  @ApiPropertyOptional({ description: 'Include only unreleased balances' })
  @IsOptional()
  @IsBoolean()
  unreleasedOnly?: boolean;
}

export class ScheduleNotificationDto {
  @ApiProperty({ description: 'Rent contract ID' })
  @IsUUID()
  contractId!: string;

  @ApiProperty({ description: 'Notification type', enum: ['reminder', 'overdue', 'success'] })
  @IsEnum(['reminder', 'overdue', 'success'])
  notificationType!: 'reminder' | 'overdue' | 'success';

  @ApiProperty({ description: 'When to send the notification' })
  @IsDateString()
  scheduledFor!: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString({ message: 'Notification title must be a string' })
  @Length(1, 100, { message: 'Notification title must be between 1 and 100 characters' })
  title!: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString({ message: 'Notification message must be a string' })
  @Length(1, 500, { message: 'Notification message must be between 1 and 500 characters' })
  message!: string;
}

// Response DTOs (no validation decorators needed)
export class RentContractResponseDto {
  @ApiProperty({ description: 'Contract ID' })
  id!: string;

  @ApiProperty({ description: 'Tenant user ID' })
  tenantId!: string;

  @ApiProperty({ description: 'Landlord user ID' })
  landlordId!: string;

  @ApiProperty({ description: 'Property ID' })
  propertyId!: string;

  @ApiProperty({ description: 'Unit ID' })
  unitId!: string;

  @ApiProperty({ description: 'Monthly rent amount' })
  monthlyAmount!: string;

  @ApiProperty({ description: 'Contract expiry date' })
  expiryDate!: Date;

  @ApiProperty({ enum: LandlordPayoutType, description: 'Landlord payout preference' })
  landlordPayoutType!: LandlordPayoutType;

  @ApiProperty({ description: 'Next payment due date' })
  nextPaymentDue!: Date;

  @ApiProperty({ description: 'Transition start date' })
  transitionStartDate!: Date;

  @ApiProperty({ enum: ContractStatus, description: 'Contract status' })
  status!: ContractStatus;

  @ApiProperty({ description: 'Whether this is an existing tenant' })
  isExistingTenant!: boolean;

  @ApiProperty({ description: 'Original expiry date for existing tenants', required: false })
  originalExpiryDate?: Date;

  @ApiProperty({ description: 'Contract creation date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Contract last update date' })
  updatedAt!: Date;
}

export class EscrowBalanceResponseDto {
  @ApiProperty({ description: 'Escrow balance ID' })
  id!: string;

  @ApiProperty({ description: 'Landlord user ID' })
  landlordId!: string;

  @ApiProperty({ description: 'Associated contract ID' })
  contractId!: string;

  @ApiProperty({ description: 'Total amount in escrow' })
  totalEscrowed!: string;

  @ApiProperty({ description: 'Number of months accumulated' })
  monthsAccumulated!: number;

  @ApiProperty({ description: 'Expected release date' })
  expectedReleaseDate!: Date;

  @ApiProperty({ description: 'Whether the escrow has been released' })
  isReleased!: boolean;

  @ApiProperty({ description: 'Release date', required: false })
  releasedAt?: Date;

  @ApiProperty({ description: 'Released amount', required: false })
  releasedAmount?: string;

  @ApiProperty({ description: 'Escrow creation date' })
  createdAt!: Date;

  @ApiProperty({ description: 'Escrow last update date' })
  updatedAt!: Date;
}

export class PaymentNotificationResponseDto {
  @ApiProperty({ description: 'Notification ID' })
  id!: string;

  @ApiProperty({ description: 'Associated contract ID' })
  contractId!: string;

  @ApiProperty({ description: 'Tenant user ID' })
  tenantId!: string;

  @ApiProperty({ description: 'Notification type', enum: ['reminder', 'overdue', 'success'] })
  notificationType!: 'reminder' | 'overdue' | 'success';

  @ApiProperty({ description: 'Scheduled send time' })
  scheduledFor!: Date;

  @ApiProperty({ description: 'Actual send time', required: false })
  sentAt?: Date;

  @ApiProperty({ description: 'Notification title' })
  title!: string;

  @ApiProperty({ description: 'Notification message' })
  message!: string;

  @ApiProperty({ description: 'Notification status', enum: ['pending', 'sent', 'failed'] })
  status!: 'pending' | 'sent' | 'failed';

  @ApiProperty({ description: 'Expo receipt ID', required: false })
  expoReceiptId?: string;

  @ApiProperty({ description: 'Notification creation date' })
  createdAt!: Date;
}

export class PaymentResultDto {
  @ApiProperty({ description: 'Whether the payment was successful' })
  success!: boolean;

  @ApiProperty({ enum: LandlordPayoutType, description: 'How the payment was processed' })
  payoutType!: LandlordPayoutType;

  @ApiProperty({ description: 'Payment processing message' })
  message!: string;

  @ApiProperty({ description: 'Next payment due date' })
  nextPaymentDue!: Date;
}

// Additional utility DTOs
export class TransitionDateCalculationDto {
  @ApiProperty({ description: 'Contract expiry date' })
  @IsDateString()
  expiryDate!: string;

  @ApiPropertyOptional({ description: 'Original expiry date for existing tenants' })
  @IsOptional()
  @IsDateString()
  originalExpiryDate?: string;

  @ApiPropertyOptional({ description: 'Whether this is an existing tenant' })
  @IsOptional()
  @IsBoolean()
  isExistingTenant?: boolean;

  @ApiProperty({ enum: LandlordPayoutType, description: 'Landlord payout preference' })
  @IsEnum(LandlordPayoutType)
  payoutType!: LandlordPayoutType;
}

export class TransitionDateResponseDto {
  @ApiProperty({ description: 'Calculated transition start date' })
  transitionStartDate!: Date;

  @ApiProperty({ description: 'First payment due date' })
  firstPaymentDue!: Date;

  @ApiProperty({ description: 'Months until transition' })
  monthsUntilTransition!: number;
}