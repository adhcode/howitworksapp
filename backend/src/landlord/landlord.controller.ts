import { Controller, Get, Post, UseGuards, Request, Query, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LandlordService } from './landlord.service';

@ApiTags('landlord')
@Controller('landlord')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LandlordController {
    constructor(private readonly landlordService: LandlordService) {}

    @Get('dashboard')
    @ApiOperation({ summary: 'Get landlord dashboard data' })
    @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
    async getDashboard(@Request() req: any) {
        const dashboardData = await this.landlordService.getDashboardData(req.user.id);

        return {
            success: true,
            data: dashboardData,
        };
    }

    @Post('generate-payment-schedules')
    @ApiOperation({ summary: 'Generate payment schedules for existing tenants' })
    @ApiResponse({ status: 200, description: 'Payment schedules generated successfully' })
    async generatePaymentSchedules(@Request() req: any) {
        try {
            console.log('🚀 Starting payment schedule generation for landlord:', req.user.id);
            const result = await this.landlordService.generatePaymentSchedulesForExistingTenants(req.user.id);
            console.log('✅ Payment schedule generation completed:', result);

            return {
                success: true,
                data: result,
            };
        } catch (error) {
            console.error('❌ Error generating payment schedules:', error);
            console.error('Error stack:', error.stack);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('dashboard/refresh')
    @ApiOperation({ summary: 'Refresh dashboard data with real calculations' })
    @ApiResponse({ status: 200, description: 'Dashboard refreshed successfully' })
    async refreshDashboard(@Request() req: any) {
        try {
            console.log('🔄 Refreshing dashboard for landlord:', req.user.id);
            const dashboardData = await this.landlordService.getDashboardData(req.user.id);
            console.log('✅ Dashboard refreshed with data:', dashboardData);

            return {
                success: true,
                data: dashboardData,
            };
        } catch (error) {
            console.error('❌ Error refreshing dashboard:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('rent-contracts')
    @ApiOperation({ summary: 'Get landlord rent contracts' })
    @ApiResponse({ status: 200, description: 'Rent contracts retrieved successfully' })
    @ApiQuery({ name: 'status', required: false, enum: ['active', 'expired', 'terminated'] })
    @ApiQuery({ name: 'payoutType', required: false, enum: ['monthly', 'yearly'] })
    async getRentContracts(
        @Request() req: any,
        @Query('status') status?: string,
        @Query('payoutType') payoutType?: string
    ) {
        try {
            const contracts = await this.landlordService.getRentContracts(req.user.id, { status, payoutType });
            return {
                success: true,
                data: contracts,
            };
        } catch (error) {
            console.error('❌ Error fetching rent contracts:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('escrow-balances')
    @ApiOperation({ summary: 'Get landlord escrow balances' })
    @ApiResponse({ status: 200, description: 'Escrow balances retrieved successfully' })
    async getEscrowBalances(@Request() req: any) {
        try {
            const balances = await this.landlordService.getEscrowBalances(req.user.id);
            return {
                success: true,
                data: balances,
            };
        } catch (error) {
            console.error('❌ Error fetching escrow balances:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('payment-history')
    @ApiOperation({ summary: 'Get landlord payment history with contract filtering' })
    @ApiResponse({ status: 200, description: 'Payment history retrieved successfully' })
    @ApiQuery({ name: 'contractId', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getPaymentHistory(
        @Request() req: any,
        @Query('contractId') contractId?: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 20
    ) {
        try {
            const history = await this.landlordService.getPaymentHistory(req.user.id, {
                contractId,
                page,
                limit,
            });
            return {
                success: true,
                data: history,
            };
        } catch (error) {
            console.error('❌ Error fetching payment history:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('contract-stats')
    @ApiOperation({ summary: 'Get contract-based payment statistics' })
    @ApiResponse({ status: 200, description: 'Contract statistics retrieved successfully' })
    async getContractStats(@Request() req: any) {
        try {
            const stats = await this.landlordService.getContractStats(req.user.id);
            return {
                success: true,
                data: stats,
            };
        } catch (error) {
            console.error('❌ Error fetching contract stats:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Maintenance endpoints
    @Get('maintenance')
    @ApiOperation({ summary: 'Get all maintenance requests for landlord properties' })
    @ApiResponse({ status: 200, description: 'Maintenance requests retrieved successfully' })
    @ApiQuery({ name: 'status', required: false, enum: ['pending', 'in_progress', 'completed', 'cancelled'] })
    @ApiQuery({ name: 'propertyId', required: false })
    async getMaintenanceRequests(
        @Request() req: any,
        @Query('status') status?: string,
        @Query('propertyId') propertyId?: string
    ) {
        try {
            const requests = await this.landlordService.getMaintenanceRequests(req.user.id, { status, propertyId });
            return {
                success: true,
                data: requests,
            };
        } catch (error) {
            console.error('❌ Error fetching maintenance requests:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('maintenance/stats')
    @ApiOperation({ summary: 'Get maintenance statistics for landlord' })
    @ApiResponse({ status: 200, description: 'Maintenance statistics retrieved successfully' })
    async getMaintenanceStats(@Request() req: any) {
        try {
            const stats = await this.landlordService.getMaintenanceStats(req.user.id);
            return {
                success: true,
                data: stats,
            };
        } catch (error) {
            console.error('❌ Error fetching maintenance stats:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Get('maintenance/:id')
    @ApiOperation({ summary: 'Get maintenance request details' })
    @ApiResponse({ status: 200, description: 'Maintenance request retrieved successfully' })
    async getMaintenanceRequest(@Request() req: any, @Param('id') id: string) {
        try {
            const request = await this.landlordService.getMaintenanceRequest(req.user.id, id);
            return {
                success: true,
                data: request,
            };
        } catch (error) {
            console.error('❌ Error fetching maintenance request:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Post('maintenance')
    @ApiOperation({ summary: 'Report a maintenance issue' })
    @ApiResponse({ status: 201, description: 'Maintenance request created successfully' })
    async reportMaintenance(
        @Request() req: any,
        @Body() maintenanceData: {
            propertyId: string;
            title: string;
            description: string;
            priority?: 'low' | 'medium' | 'high' | 'urgent';
            images?: string[];
        }
    ) {
        try {
            const request = await this.landlordService.reportMaintenance(req.user.id, maintenanceData);
            return {
                success: true,
                data: request,
                message: 'Maintenance request submitted successfully',
            };
        } catch (error) {
            console.error('❌ Error reporting maintenance:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    @Post('maintenance/:id/comment')
    @ApiOperation({ summary: 'Add a comment to a maintenance request' })
    @ApiResponse({ status: 201, description: 'Comment added successfully' })
    async addMaintenanceComment(
        @Request() req: any,
        @Param('id') id: string,
        @Body() commentData: { comment: string }
    ) {
        try {
            const result = await this.landlordService.addMaintenanceComment(req.user.id, id, commentData.comment);
            return {
                success: true,
                data: result,
                message: 'Comment added successfully',
            };
        } catch (error) {
            console.error('❌ Error adding comment:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}