import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantsService } from './tenants.service';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    @Get('my-data')
    @ApiOperation({ summary: 'Get current tenant data' })
    @ApiResponse({ status: 200, description: 'Tenant data retrieved successfully' })
    async getMyData(@Request() req: any) {
        const tenantData = await this.tenantsService.getTenantData(req.user.id);

        return {
            success: true,
            data: tenantData,
        };
    }

    @Get('rent-contract')
    @ApiOperation({ summary: 'Get current tenant rent contract' })
    @ApiResponse({ status: 200, description: 'Rent contract retrieved successfully' })
    async getRentContract(@Request() req: any) {
        const contract = await this.tenantsService.getTenantRentContract(req.user.id);

        return {
            success: true,
            data: contract,
        };
    }

    @Get('payments')
    @ApiOperation({ summary: 'Get tenant payment information' })
    @ApiResponse({ status: 200, description: 'Payment data retrieved successfully' })
    async getPayments(@Request() req: any) {
        const paymentData = await this.tenantsService.getTenantPayments(req.user.id);

        return {
            success: true,
            data: paymentData,
        };
    }

    @Get('reports')
    @ApiOperation({ summary: 'Get tenant reports' })
    @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
    async getReports(@Request() req: any) {
        const reports = await this.tenantsService.getTenantReports(req.user.id);

        return {
            success: true,
            data: reports,
        };
    }

    @Get('complaints')
    @ApiOperation({ summary: 'Get tenant complaints' })
    @ApiResponse({ status: 200, description: 'Complaints retrieved successfully' })
    async getComplaints(@Request() req: any) {
        const complaints = await this.tenantsService.getTenantComplaints(req.user.id);

        return {
            success: true,
            data: complaints,
        };
    }

    @Get('complaints/:id')
    @ApiOperation({ summary: 'Get complaint detail' })
    @ApiResponse({ status: 200, description: 'Complaint detail retrieved successfully' })
    async getComplaintDetail(@Param('id') id: string, @Request() req: any) {
        const complaint = await this.tenantsService.getComplaintDetail(id, req.user.id);

        return {
            success: true,
            data: complaint,
        };
    }

    @Post('complaints')
    @ApiOperation({ summary: 'Submit new complaint' })
    @ApiResponse({ status: 201, description: 'Complaint submitted successfully' })
    async submitComplaint(@Body() complaintData: any, @Request() req: any) {
        const complaint = await this.tenantsService.submitComplaint(complaintData, req.user.id);

        return {
            success: true,
            data: complaint,
        };
    }
}