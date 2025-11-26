import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CreateNewTenantContractDto,
  CreateExistingTenantContractDto,
  UpdateContractDto,
  ContractQueryDto,
  ContractResponseDto,
} from './dto/create-contract.dto';

enum UserRole {
  ADMIN = 'admin',
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  FACILITATOR = 'facilitator',
}

/**
 * CONTRACTS CONTROLLER
 * 
 * RESTful API endpoints for contract management.
 * 
 * Endpoints:
 * - POST /contracts/new - Create contract for new tenant
 * - POST /contracts/existing - Create contract for existing tenant
 * - GET /contracts - Query contracts
 * - GET /contracts/:id - Get specific contract
 * - PUT /contracts/:id - Update contract
 * - DELETE /contracts/:id - Terminate contract
 */
@ApiTags('contracts')
@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  /**
   * CREATE CONTRACT FOR NEW TENANT
   * 
   * Endpoint: POST /contracts/new
   * 
   * Creates a fresh lease contract for a tenant just moving in.
   * Payment starts on lease start date.
   * 
   * Access: Landlords and Admins only
   */
  @Post('new')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create contract for new tenant',
    description: 'Creates a rental contract for a tenant starting a fresh lease. Payment starts on move-in date.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contract created successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data or duplicate contract',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only landlords and admins can create contracts',
  })
  async createNewTenantContract(
    @Body() dto: CreateNewTenantContractDto,
    @Request() req: any
  ) {
    try {
      // Verify landlord ID matches authenticated user (unless admin)
      if (req.user.role !== UserRole.ADMIN && dto.landlordId !== req.user.id) {
        throw new HttpException(
          'You can only create contracts for your own properties',
          HttpStatus.FORBIDDEN
        );
      }

      const contract = await this.contractsService.createNewTenantContract(dto);

      return {
        success: true,
        message: 'Contract created successfully for new tenant',
        data: contract,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create contract',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * CREATE CONTRACT FOR EXISTING TENANT
   * 
   * Endpoint: POST /contracts/existing
   * 
   * Creates a contract for a tenant who already has an active lease elsewhere.
   * System calculates when they should start paying based on:
   * - Monthly payout: 3 months before current lease expires
   * - Yearly payout: 6 months before current lease expires
   * 
   * Access: Landlords and Admins only
   */
  @Post('existing')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create contract for existing tenant',
    description: 'Creates a contract for tenant with active lease elsewhere. Payment transition calculated automatically.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contract created successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data or duplicate contract',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only landlords and admins can create contracts',
  })
  async createExistingTenantContract(
    @Body() dto: CreateExistingTenantContractDto,
    @Request() req: any
  ) {
    try {
      // Verify landlord ID matches authenticated user (unless admin)
      if (req.user.role !== UserRole.ADMIN && dto.landlordId !== req.user.id) {
        throw new HttpException(
          'You can only create contracts for your own properties',
          HttpStatus.FORBIDDEN
        );
      }

      const contract = await this.contractsService.createExistingTenantContract(dto);

      return {
        success: true,
        message: 'Contract created successfully for existing tenant',
        data: contract,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create contract',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET CONTRACTS
   * 
   * Endpoint: GET /contracts?tenantId=xxx&landlordId=xxx&status=active
   * 
   * Query contracts with filters.
   * Users can only see their own contracts (unless admin).
   * 
   * Access: All authenticated users
   */
  @Get()
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT, UserRole.FACILITATOR)
  @ApiOperation({
    summary: 'Query contracts',
    description: 'Get contracts with optional filters. Users see only their own contracts.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contracts retrieved successfully',
    type: [ContractResponseDto],
  })
  async getContracts(
    @Query() query: ContractQueryDto,
    @Request() req: any
  ) {
    try {
      // Enforce access control based on role
      if (req.user.role === UserRole.TENANT) {
        query.tenantId = req.user.id; // Tenants can only see their own contracts
      } else if (req.user.role === UserRole.LANDLORD) {
        query.landlordId = req.user.id; // Landlords can only see their properties' contracts
      }
      // Admins can see all contracts (no restriction)

      const contracts = await this.contractsService.getContracts(query);

      return {
        success: true,
        data: contracts,
        count: contracts.length,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch contracts',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET CONTRACT BY ID
   * 
   * Endpoint: GET /contracts/:id
   * 
   * Get specific contract details.
   * Users can only access their own contracts (unless admin).
   * 
   * Access: All authenticated users
   */
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.LANDLORD, UserRole.TENANT, UserRole.FACILITATOR)
  @ApiOperation({
    summary: 'Get contract by ID',
    description: 'Retrieve specific contract details',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract retrieved successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async getContractById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any
  ) {
    try {
      const contract = await this.contractsService.getContractById(id);

      // Check access permissions
      const hasAccess =
        req.user.role === UserRole.ADMIN ||
        contract.tenantId === req.user.id ||
        contract.landlordId === req.user.id;

      if (!hasAccess) {
        throw new HttpException(
          'You do not have permission to view this contract',
          HttpStatus.FORBIDDEN
        );
      }

      return {
        success: true,
        data: contract,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch contract',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * UPDATE CONTRACT
   * 
   * Endpoint: PUT /contracts/:id
   * 
   * Update contract details (rent amount, end date, payout type).
   * 
   * Access: Landlords (own properties) and Admins only
   */
  @Put(':id')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update contract',
    description: 'Update contract details like rent amount, end date, or payout type',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract updated successfully',
    type: ContractResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async updateContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContractDto,
    @Request() req: any
  ) {
    try {
      const contract = await this.contractsService.getContractById(id);

      // Check access permissions
      if (req.user.role !== UserRole.ADMIN && contract.landlordId !== req.user.id) {
        throw new HttpException(
          'You can only update contracts for your own properties',
          HttpStatus.FORBIDDEN
        );
      }

      const updated = await this.contractsService.updateContract(id, dto);

      return {
        success: true,
        message: 'Contract updated successfully',
        data: updated,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update contract',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * TERMINATE CONTRACT
   * 
   * Endpoint: DELETE /contracts/:id
   * 
   * Terminate a contract early.
   * Sets status to 'terminated'.
   * 
   * Access: Landlords (own properties) and Admins only
   */
  @Delete(':id')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Terminate contract',
    description: 'Terminate a contract early',
  })
  @ApiParam({ name: 'id', description: 'Contract ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contract terminated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Contract not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied',
  })
  async terminateContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: any
  ) {
    try {
      const contract = await this.contractsService.getContractById(id);

      // Check access permissions
      if (req.user.role !== UserRole.ADMIN && contract.landlordId !== req.user.id) {
        throw new HttpException(
          'You can only terminate contracts for your own properties',
          HttpStatus.FORBIDDEN
        );
      }

      const terminated = await this.contractsService.terminateContract(id);

      return {
        success: true,
        message: 'Contract terminated successfully',
        data: terminated,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to terminate contract',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }
}



