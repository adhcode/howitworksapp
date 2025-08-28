import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { PaystackService } from './paystack.service';
import { InitializePaymentDto, VerifyPaymentDto, PaymentWebhookDto } from './dto/payment.dto';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
    constructor(
        private readonly paymentsService: PaymentsService,
        private readonly paystackService: PaystackService
    ) {}

    @Get('my-payments')
    @ApiOperation({ summary: 'Get current user payments (tenant)' })
    @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
    async getMyPayments(@Request() req: any) {
        const payments = await this.paymentsService.getTenantPayments(req.user.id);

        return {
            success: true,
            data: payments,
        };
    }

    @Get('landlord-payments')
    @ApiOperation({ summary: 'Get all payments for landlord' })
    @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
    async getLandlordPayments(@Request() req: any) {
        const payments = await this.paymentsService.getLandlordPayments(req.user.id);

        return {
            success: true,
            data: payments,
        };
    }

    @Get('upcoming')
    @ApiOperation({ summary: 'Get upcoming payments for landlord' })
    @ApiResponse({ status: 200, description: 'Upcoming payments retrieved successfully' })
    async getUpcomingPayments(@Request() req: any) {
        const payments = await this.paymentsService.getUpcomingPayments(req.user.id);

        return {
            success: true,
            data: payments,
        };
    }

    @Get('overdue')
    @ApiOperation({ summary: 'Get overdue payments for landlord' })
    @ApiResponse({ status: 200, description: 'Overdue payments retrieved successfully' })
    async getOverduePayments(@Request() req: any) {
        const payments = await this.paymentsService.getOverduePayments(req.user.id);

        return {
            success: true,
            data: payments,
        };
    }

    @Post(':id/process')
    @ApiOperation({ summary: 'Process a payment' })
    @ApiResponse({ status: 200, description: 'Payment processed successfully' })
    async processPayment(
        @Param('id') paymentId: string,
        @Body() paymentData: {
            amount: number;
            paymentMethod?: string;
            notes?: string;
        },
        @Request() req: any
    ) {
        const result = await this.paymentsService.processPayment(
            paymentId,
            paymentData.amount,
            paymentData.paymentMethod,
            paymentData.notes
        );

        return {
            success: true,
            data: result,
        };
    }

    @Post('update-overdue')
    @ApiOperation({ summary: 'Update overdue payments status' })
    @ApiResponse({ status: 200, description: 'Overdue payments updated successfully' })
    async updateOverduePayments() {
        const result = await this.paymentsService.updateOverduePayments();

        return {
            success: true,
            data: result,
        };
    }

    // Paystack Integration Endpoints

    @Post('paystack/initialize')
    @ApiOperation({ summary: 'Initialize Paystack payment' })
    @ApiResponse({ status: 200, description: 'Payment initialized successfully' })
    async initializePayment(@Body() initializePaymentDto: InitializePaymentDto, @Request() req: any) {
        const reference = this.paystackService.generateReference();
        
        const result = await this.paystackService.initializeTransaction({
            email: initializePaymentDto.email,
            amount: initializePaymentDto.amount,
            currency: initializePaymentDto.currency,
            reference: reference,
            metadata: {
                userId: req.user.id,
                userRole: req.user.role,
                description: initializePaymentDto.description,
                ...initializePaymentDto.metadata,
            },
        });

        return result;
    }

    @Post('paystack/verify')
    @ApiOperation({ summary: 'Verify Paystack payment' })
    @ApiResponse({ status: 200, description: 'Payment verified successfully' })
    async verifyPayment(@Body() verifyPaymentDto: VerifyPaymentDto, @Request() req: any) {
        const result = await this.paystackService.verifyTransaction(verifyPaymentDto.reference);
        
        if (result.status && result.data.status === 'success') {
            // Save payment to database
            try {
                await this.paymentsService.recordPayment({
                    tenantId: req.user.id,
                    amount: result.data.amount,
                    reference: result.data.reference,
                    paymentMethod: 'paystack',
                    status: 'paid',
                    paidAt: new Date(result.data.paid_at),
                    metadata: result.data,
                });
            } catch (error) {
                console.error('Error recording payment:', error);
            }
        }

        return result;
    }

    @Post('paystack/webhook')
    @ApiOperation({ summary: 'Paystack webhook endpoint' })
    @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
    async handleWebhook(@Body() webhookData: PaymentWebhookDto) {
        console.log('Paystack webhook received:', webhookData.event);
        
        if (webhookData.event === 'charge.success') {
            const paymentData = webhookData.data;
            
            try {
                // Record successful payment
                await this.paymentsService.recordPayment({
                    tenantId: paymentData.metadata?.userId,
                    amount: paymentData.amount / 100, // Convert from kobo
                    reference: paymentData.reference,
                    paymentMethod: 'paystack',
                    status: 'paid',
                    paidAt: new Date(paymentData.paid_at),
                    metadata: paymentData,
                });
                
                console.log('Payment recorded successfully:', paymentData.reference);
            } catch (error) {
                console.error('Error processing webhook:', error);
            }
        }

        return { status: 'success' };
    }
}