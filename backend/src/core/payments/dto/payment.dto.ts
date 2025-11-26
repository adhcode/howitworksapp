import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';

/**
 * DTO for processing a rent payment
 */
export class ProcessPaymentDto {
  @ApiProperty({ description: 'Contract ID' })
  @IsUUID()
  contractId: string;

  @ApiProperty({ description: 'Payment amount', example: 1500.00 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Payment method', example: 'card' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'Payment reference/transaction ID' })
  @IsOptional()
  @IsString()
  reference?: string;
}

/**
 * Payment result response
 */
export class PaymentResultDto {
  @ApiProperty({ description: 'Whether payment was successful' })
  success: boolean;

  @ApiProperty({ description: 'Payout type (monthly/yearly)' })
  payoutType: string;

  @ApiProperty({ description: 'Result message' })
  message: string;

  @ApiProperty({ description: 'Next payment due date' })
  nextPaymentDue: Date;

  @ApiPropertyOptional({ description: 'Transaction ID if applicable' })
  transactionId?: string;
}

/**
 * Payment schedule item
 */
export class PaymentScheduleItemDto {
  @ApiProperty()
  dueDate: Date;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  status: 'pending' | 'paid' | 'overdue';

  @ApiPropertyOptional()
  paidDate?: Date;

  @ApiProperty()
  isPastDue: boolean;

  @ApiProperty()
  daysUntilDue: number;
}

/**
 * Payment history item
 */
export class PaymentHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  contractId: string;

  @ApiProperty()
  amount: string;

  @ApiProperty()
  paidDate: Date;

  @ApiProperty()
  paymentMethod: string;

  @ApiPropertyOptional()
  reference?: string;

  @ApiProperty()
  payoutType: string;
}



