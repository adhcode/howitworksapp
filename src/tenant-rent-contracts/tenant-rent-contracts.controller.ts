import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  Query,
  UseGuards, 
  Request,
  HttpStatus,
  HttpException,
  ParseUUIDPipe
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/auth.dto';
import { TenantPaymentService } from './tenant-payment.service';
import { LandlordPayoutService } from './landlord-payout.service';
import {
  CreateRentContractDto,
  ProcessPaymentDto,
  ContractQueryDto,
  EscrowBalanceQueryDto,
  RentContractResponseDto,
  EscrowBalanceResponseDto,
  PaymentResultDto,
  TransitionDateCalculationDto,
  TransitionDateResponseDto
} from './dto/tenant-rent-contract.dto';

@ApiTags('tenant-rent-contracts')
@Controller('rent-contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TenantRentContractsController {
  constructor(
    private readonly tenantPaymentService: TenantPaymentService,
    private readonly landlordPayoutService: LandlordPayoutService,
  ) {}

  @Post()
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Create a new rent contract',
    description: 'Creates a new tenant rent contract with specified terms and payout preferences'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Contract created successfully',
    type: RentContractResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid contract data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createRentContract(
    @Body() createContractDto: CreateRentContractDto,
    @Request() req: any
  ) {
    try {
      // Verify the landlord is creating a contract for themselves (unless admin)
      if (req.user.role !== UserRole.ADMIN && req.user.id !== createContractDto.landlordId) {
        throw new HttpException(
          'You can only create contracts for yourself',
          HttpStatus.FORBIDDEN
        );
      }

      const result = await this.tenantPaymentService.createRentContract(createContractDto);

      return {
        success: true,
        message: result.arrears 
          ? `Rent contract created. ${result.arrears.message}`
          : 'Rent contract created successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to create rent contract: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get rent contract by ID',
    description: 'Retrieves a specific rent contract by its ID with arrears info if applicable'
  })
  @ApiParam({ name: 'id', description: 'Contract ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contract retrieved successfully',
    type: RentContractResponseDto
  })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  @ApiResponse({ status: 403, description: 'Access denied to this contract' })
  async getRentContract(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Request() req: any
  ) {
    try {
      const contract = await this.tenantPaymentService.getContractById(contractId);

      // Check if user has access to this contract
      const hasAccess = req.user.role === UserRole.ADMIN ||
                       req.user.id === contract.tenantId ||
                       req.user.id === contract.landlordId;

      if (!hasAccess) {
        throw new HttpException(
          'You do not have access to this contract',
          HttpStatus.FORBIDDEN
        );
      }

      // Calculate arrears if existing tenant
      let arrearsInfo: {
        monthsOverdue: number;
        totalArrears: number;
        message: string;
      } | undefined = undefined;
      if (contract.isExistingTenant) {
        const arrears = this.tenantPaymentService.calculateArrears(
          contract.transitionStartDate,
          parseFloat(contract.monthlyAmount)
        );
        
        if (arrears.monthsOverdue > 0) {
          arrearsInfo = {
            monthsOverdue: arrears.monthsOverdue,
            totalArrears: arrears.totalArrears,
            message: `You owe ${arrears.monthsOverdue} month${arrears.monthsOverdue > 1 ? 's' : ''} rent (₦${arrears.totalArrears.toLocaleString()}). Please pay arrears to continue.`
          };
        }
      }

      return {
        success: true,
        data: {
          contract,
          arrears: arrearsInfo
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve contract: ${error.message}`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get rent contracts with filters',
    description: 'Retrieves rent contracts based on query parameters'
  })
  @ApiQuery({ name: 'tenantId', required: false, description: 'Filter by tenant ID' })
  @ApiQuery({ name: 'landlordId', required: false, description: 'Filter by landlord ID' })
  @ApiQuery({ name: 'propertyId', required: false, description: 'Filter by property ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by contract status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Contracts retrieved successfully',
    type: [RentContractResponseDto]
  })
  async getRentContracts(
    @Query() queryDto: ContractQueryDto,
    @Request() req: any
  ) {
    try {
      // Apply user-based filtering for non-admin users
      if (req.user.role !== UserRole.ADMIN) {
        if (req.user.role === UserRole.LANDLORD) {
          queryDto.landlordId = req.user.id;
        } else if (req.user.role === UserRole.TENANT) {
          queryDto.tenantId = req.user.id;
        }
      }

      const contracts = await this.tenantPaymentService.getActiveContracts(
        queryDto.tenantId,
        queryDto.landlordId
      );

      return {
        success: true,
        data: contracts,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve contracts: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post(':id/payments')
  @Roles(UserRole.TENANT, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Process a rent payment',
    description: 'Processes a monthly rent payment for the specified contract'
  })
  @ApiParam({ name: 'id', description: 'Contract ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Payment processed successfully',
    type: PaymentResultDto
  })
  @ApiResponse({ status: 400, description: 'Invalid payment data' })
  @ApiResponse({ status: 403, description: 'Not authorized to make payment for this contract' })
  @ApiResponse({ status: 404, description: 'Contract not found' })
  async processPayment(
    @Param('id', ParseUUIDPipe) contractId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
    @Request() req: any
  ) {
    try {
      // Verify the contract exists and user has access
      const contract = await this.tenantPaymentService.getContractById(contractId);

      // Check if user is authorized to make payment (tenant or admin)
      const canMakePayment = req.user.role === UserRole.ADMIN ||
                            req.user.id === contract.tenantId;

      if (!canMakePayment) {
        throw new HttpException(
          'You are not authorized to make payments for this contract',
          HttpStatus.FORBIDDEN
        );
      }

      // Ensure the contractId in the DTO matches the URL parameter
      processPaymentDto.contractId = contractId;

      const result = await this.tenantPaymentService.processMonthlyPayment(
        contractId,
        processPaymentDto.amount
      );

      return {
        success: true,
        message: 'Payment processed successfully',
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to process payment: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('landlords/:landlordId/escrow-balances')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get landlord escrow balances',
    description: 'Retrieves escrow balances for a specific landlord'
  })
  @ApiParam({ name: 'landlordId', description: 'Landlord user ID', type: 'string' })
  @ApiQuery({ name: 'unreleasedOnly', required: false, description: 'Show only unreleased balances' })
  @ApiResponse({ 
    status: 200, 
    description: 'Escrow balances retrieved successfully',
    type: [EscrowBalanceResponseDto]
  })
  @ApiResponse({ status: 403, description: 'Access denied to escrow balances' })
  async getLandlordEscrowBalances(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Query() queryDto: EscrowBalanceQueryDto,
    @Request() req: any
  ) {
    try {
      // Verify the landlord is accessing their own escrow (unless admin)
      if (req.user.role !== UserRole.ADMIN && req.user.id !== landlordId) {
        throw new HttpException(
          'You can only access your own escrow balances',
          HttpStatus.FORBIDDEN
        );
      }

      const escrowBalances = await this.landlordPayoutService.getLandlordEscrowBalances(landlordId);

      // Filter for unreleased only if requested
      const filteredBalances = queryDto.unreleasedOnly 
        ? escrowBalances.filter(balance => !balance.isReleased)
        : escrowBalances;

      return {
        success: true,
        data: filteredBalances,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve escrow balances: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('calculate-transition-date')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Calculate transition start date',
    description: 'Calculates when a tenant should start paying through the system'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Transition date calculated successfully',
    type: TransitionDateResponseDto
  })
  async calculateTransitionDate(
    @Body() calculationDto: TransitionDateCalculationDto
  ) {
    try {
      const expiryDate = new Date(calculationDto.expiryDate);
      const originalExpiryDate = calculationDto.originalExpiryDate 
        ? new Date(calculationDto.originalExpiryDate) 
        : null;
      const isExistingTenant = calculationDto.isExistingTenant || false;
      
      const transitionStartDate = this.tenantPaymentService.calculateTransitionStartDate(
        isExistingTenant,
        originalExpiryDate,
        expiryDate
      );

      // Calculate first payment due (same as transition start)
      const firstPaymentDue = new Date(transitionStartDate);

      // Calculate months until transition
      const today = new Date();
      const monthsUntilTransition = Math.max(0, Math.floor(
        (transitionStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
      ));

      return {
        success: true,
        data: {
          transitionStartDate,
          firstPaymentDue,
          monthsUntilTransition,
        },
      };
    } catch (error) {
      throw new HttpException(
        `Failed to calculate transition date: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('landlords/:landlordId/total-escrow')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Get total escrow amount for landlord',
    description: 'Retrieves the total amount held in escrow for a landlord'
  })
  @ApiParam({ name: 'landlordId', description: 'Landlord user ID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Total escrow amount retrieved successfully'
  })
  async getTotalEscrowAmount(
    @Param('landlordId', ParseUUIDPipe) landlordId: string,
    @Request() req: any
  ) {
    try {
      // Verify the landlord is accessing their own escrow (unless admin)
      if (req.user.role !== UserRole.ADMIN && req.user.id !== landlordId) {
        throw new HttpException(
          'You can only access your own escrow information',
          HttpStatus.FORBIDDEN
        );
      }

      const totalAmount = await this.landlordPayoutService.getTotalEscrowedAmount(landlordId);

      return {
        success: true,
        data: {
          landlordId,
          totalEscrowedAmount: totalAmount,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `Failed to retrieve total escrow amount: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}