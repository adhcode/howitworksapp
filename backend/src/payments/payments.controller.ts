import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

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
}