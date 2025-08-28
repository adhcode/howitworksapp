import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
}