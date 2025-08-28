import { IsString, IsNumber, IsEmail, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitializePaymentDto {
  @ApiProperty({ example: 'tenant@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 25000, description: 'Amount in Naira' })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiPropertyOptional({ example: 'NGN' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: 'Monthly rent payment for Unit 1A' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 'homezy_1640995200000_abc123' })
  @IsString()
  reference: string;
}

export class PaymentWebhookDto {
  @ApiProperty({ example: 'charge.success' })
  @IsString()
  event: string;

  @ApiProperty()
  @IsObject()
  data: any;
}
