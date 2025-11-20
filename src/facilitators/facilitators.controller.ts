import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Req,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { FacilitatorsService } from './facilitators.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';
import { 
  CreateFacilitatorDto, 
  AssignFacilitatorDto, 
  UpdateFacilitatorStatusDto,
  FacilitatorResponseDto,
  PropertyAssignmentResponseDto,
  FacilitatorStatsDto
} from './dto/facilitator.dto';

@ApiTags('facilitators')
@Controller('facilitators')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FacilitatorsController {
  constructor(private readonly facilitatorsService: FacilitatorsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new facilitator (Admin only)' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Facilitator created successfully',
    type: FacilitatorResponseDto
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only admins can create facilitators' })
  async createFacilitator(@Body() createFacilitatorDto: CreateFacilitatorDto) {
    const facilitator = await this.facilitatorsService.createFacilitator(createFacilitatorDto);
    return {
      success: true,
      message: 'Facilitator created successfully',
      data: facilitator,
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all facilitators (Admin only)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Facilitators retrieved successfully',
    type: [FacilitatorResponseDto]
  })
  async getAllFacilitators() {
    const facilitators = await this.facilitatorsService.getAllFacilitators();
    return {
      success: true,
      data: facilitators,
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get facilitator by ID' })
  @ApiParam({ name: 'id', description: 'Facilitator ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Facilitator retrieved successfully',
    type: FacilitatorResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Facilitator not found' })
  async getFacilitatorById(@Param('id') id: string) {
    const facilitator = await this.facilitatorsService.getFacilitatorById(id);
    return {
      success: true,
      data: facilitator,
    };
  }

  @Post('assign')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign facilitator to property (Admin only)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Facilitator assigned successfully',
    type: PropertyAssignmentResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Facilitator or property not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only admins can assign facilitators' })
  async assignFacilitatorToProperty(
    @Body() assignDto: AssignFacilitatorDto,
    @Req() req: any
  ) {
    const result = await this.facilitatorsService.assignFacilitatorToProperty(
      assignDto,
      req.user.id
    );
    return result;
  }

  @Delete('property/:propertyId/facilitator')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Remove facilitator from property (Admin only)' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitator removed successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only admins can remove facilitators' })
  async removeFacilitatorFromProperty(
    @Param('propertyId') propertyId: string,
    @Req() req: any
  ) {
    const result = await this.facilitatorsService.removeFacilitatorFromProperty(
      propertyId,
      req.user.id
    );
    return result;
  }

  @Get(':id/properties')
  @Roles(UserRole.ADMIN, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get properties assigned to facilitator' })
  @ApiParam({ name: 'id', description: 'Facilitator ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Properties retrieved successfully' })
  async getFacilitatorProperties(@Param('id') id: string) {
    const properties = await this.facilitatorsService.getFacilitatorProperties(id);
    return {
      success: true,
      data: properties,
    };
  }

  @Get(':id/stats')
  @Roles(UserRole.ADMIN, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get facilitator dashboard statistics' })
  @ApiParam({ name: 'id', description: 'Facilitator ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Statistics retrieved successfully',
    type: FacilitatorStatsDto
  })
  async getFacilitatorStats(@Param('id') id: string) {
    const stats = await this.facilitatorsService.getFacilitatorStats(id);
    return {
      success: true,
      data: stats,
    };
  }

  @Put(':id/status')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update facilitator status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Facilitator ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Facilitator status updated successfully',
    type: FacilitatorResponseDto
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Facilitator not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Only admins can update facilitator status' })
  async updateFacilitatorStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateFacilitatorStatusDto,
    @Req() req: any
  ) {
    const facilitator = await this.facilitatorsService.updateFacilitatorStatus(
      id,
      updateStatusDto.isActive,
      req.user.id
    );
    return {
      success: true,
      message: `Facilitator ${updateStatusDto.isActive ? 'activated' : 'deactivated'} successfully`,
      data: facilitator,
    };
  }

  @Get(':id/tenants')
  @Roles(UserRole.ADMIN, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get tenants for facilitator\'s assigned properties' })
  @ApiParam({ name: 'id', description: 'Facilitator ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tenants retrieved successfully' })
  async getFacilitatorTenants(@Param('id') id: string) {
    const tenants = await this.facilitatorsService.getFacilitatorTenants(id);
    return {
      success: true,
      data: tenants,
    };
  }

  @Get('properties/:id')
  @Roles(UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get property details for facilitator' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Property retrieved successfully' })
  async getFacilitatorPropertyById(@Param('id') id: string, @Req() req: any) {
    const property = await this.facilitatorsService.getFacilitatorPropertyById(id, req.user.id);
    return {
      success: true,
      data: property,
    };
  }

  @Get('properties/:id/units')
  @Roles(UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get units for facilitator property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Units retrieved successfully' })
  async getFacilitatorPropertyUnits(@Param('id') id: string, @Req() req: any) {
    const units = await this.facilitatorsService.getFacilitatorPropertyUnits(id, req.user.id);
    return {
      success: true,
      data: units,
    };
  }

  @Get('properties/:id/tenants')
  @Roles(UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get tenants for facilitator property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tenants retrieved successfully' })
  async getFacilitatorPropertyTenants(@Param('id') id: string, @Req() req: any) {
    const tenants = await this.facilitatorsService.getFacilitatorPropertyTenants(id, req.user.id);
    return {
      success: true,
      data: tenants,
    };
  }

  @Get('properties/:id/maintenance')
  @Roles(UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get maintenance requests for facilitator property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Maintenance requests retrieved successfully' })
  async getFacilitatorPropertyMaintenance(@Param('id') id: string, @Req() req: any) {
    const maintenance = await this.facilitatorsService.getFacilitatorPropertyMaintenance(id, req.user.id);
    return {
      success: true,
      data: maintenance,
    };
  }

  @Get('properties/:id/payments')
  @Roles(UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get payments for facilitator property' })
  @ApiParam({ name: 'id', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payments retrieved successfully' })
  async getFacilitatorPropertyPayments(@Param('id') id: string, @Req() req: any) {
    const payments = await this.facilitatorsService.getFacilitatorPropertyPayments(id, req.user.id);
    return {
      success: true,
      data: payments,
    };
  }

  @Get('maintenance-requests')
  @Roles(UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get all maintenance requests for facilitator\'s assigned properties' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Maintenance requests retrieved successfully' })
  async getFacilitatorMaintenanceRequests(@Req() req: any) {
    const maintenanceRequests = await this.facilitatorsService.getFacilitatorMaintenanceRequests(req.user.id);
    return {
      success: true,
      data: maintenanceRequests,
    };
  }

  @Get('property/:propertyId/facilitator')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT, UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get facilitator for a specific property' })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Facilitator retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Property not found' })
  async getPropertyFacilitator(@Param('propertyId') propertyId: string) {
    const facilitator = await this.facilitatorsService.getPropertyFacilitator(propertyId);
    return {
      success: true,
      data: facilitator,
    };
  }

  @Post('maintenance/:id/comment')
  @Roles(UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Add a comment to a maintenance request' })
  @ApiParam({ name: 'id', description: 'Maintenance request ID' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Comment added successfully' })
  async addMaintenanceComment(
    @Param('id') id: string,
    @Body() commentData: { comment: string },
    @Req() req: any
  ) {
    const result = await this.facilitatorsService.addMaintenanceComment(req.user.id, id, commentData.comment);
    return {
      success: true,
      data: result,
      message: 'Comment added successfully',
    };
  }

  @Get('maintenance/:id')
  @Roles(UserRole.FACILITATOR)
  @ApiOperation({ summary: 'Get maintenance request details' })
  @ApiParam({ name: 'id', description: 'Maintenance request ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Maintenance request retrieved successfully' })
  async getMaintenanceRequestDetails(
    @Param('id') id: string,
    @Req() req: any
  ) {
    const request = await this.facilitatorsService.getMaintenanceRequestDetails(req.user.id, id);
    return {
      success: true,
      data: request,
    };
  }
}


