"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantRentContractsController", {
    enumerable: true,
    get: function() {
        return TenantRentContractsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _authdto = require("../auth/dto/auth.dto");
const _tenantpaymentservice = require("./tenant-payment.service");
const _landlordpayoutservice = require("./landlord-payout.service");
const _tenantrentcontractdto = require("./dto/tenant-rent-contract.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let TenantRentContractsController = class TenantRentContractsController {
    async createRentContract(createContractDto, req) {
        try {
            // Verify the landlord is creating a contract for themselves (unless admin)
            if (req.user.role !== _authdto.UserRole.ADMIN && req.user.id !== createContractDto.landlordId) {
                throw new _common.HttpException('You can only create contracts for yourself', _common.HttpStatus.FORBIDDEN);
            }
            const result = await this.tenantPaymentService.createRentContract(createContractDto);
            return {
                success: true,
                message: result.arrears ? `Rent contract created. ${result.arrears.message}` : 'Rent contract created successfully',
                data: result
            };
        } catch (error) {
            if (error instanceof _common.HttpException) {
                throw error;
            }
            throw new _common.HttpException(`Failed to create rent contract: ${error.message}`, _common.HttpStatus.BAD_REQUEST);
        }
    }
    async getRentContract(contractId, req) {
        try {
            const contract = await this.tenantPaymentService.getContractById(contractId);
            // Check if user has access to this contract
            const hasAccess = req.user.role === _authdto.UserRole.ADMIN || req.user.id === contract.tenantId || req.user.id === contract.landlordId;
            if (!hasAccess) {
                throw new _common.HttpException('You do not have access to this contract', _common.HttpStatus.FORBIDDEN);
            }
            // Calculate arrears if existing tenant
            let arrearsInfo = undefined;
            if (contract.isExistingTenant) {
                const arrears = this.tenantPaymentService.calculateArrears(contract.transitionStartDate, parseFloat(contract.monthlyAmount));
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
                }
            };
        } catch (error) {
            if (error instanceof _common.HttpException) {
                throw error;
            }
            throw new _common.HttpException(`Failed to retrieve contract: ${error.message}`, _common.HttpStatus.NOT_FOUND);
        }
    }
    async getRentContracts(queryDto, req) {
        try {
            // Apply user-based filtering for non-admin users
            if (req.user.role !== _authdto.UserRole.ADMIN) {
                if (req.user.role === _authdto.UserRole.LANDLORD) {
                    queryDto.landlordId = req.user.id;
                } else if (req.user.role === _authdto.UserRole.TENANT) {
                    queryDto.tenantId = req.user.id;
                }
            }
            const contracts = await this.tenantPaymentService.getActiveContracts(queryDto.tenantId, queryDto.landlordId);
            return {
                success: true,
                data: contracts
            };
        } catch (error) {
            throw new _common.HttpException(`Failed to retrieve contracts: ${error.message}`, _common.HttpStatus.BAD_REQUEST);
        }
    }
    async processPayment(contractId, processPaymentDto, req) {
        try {
            // Verify the contract exists and user has access
            const contract = await this.tenantPaymentService.getContractById(contractId);
            // Check if user is authorized to make payment (tenant or admin)
            const canMakePayment = req.user.role === _authdto.UserRole.ADMIN || req.user.id === contract.tenantId;
            if (!canMakePayment) {
                throw new _common.HttpException('You are not authorized to make payments for this contract', _common.HttpStatus.FORBIDDEN);
            }
            // Ensure the contractId in the DTO matches the URL parameter
            processPaymentDto.contractId = contractId;
            const result = await this.tenantPaymentService.processMonthlyPayment(contractId, processPaymentDto.amount);
            return {
                success: true,
                message: 'Payment processed successfully',
                data: result
            };
        } catch (error) {
            if (error instanceof _common.HttpException) {
                throw error;
            }
            throw new _common.HttpException(`Failed to process payment: ${error.message}`, _common.HttpStatus.BAD_REQUEST);
        }
    }
    async getLandlordEscrowBalances(landlordId, queryDto, req) {
        try {
            // Verify the landlord is accessing their own escrow (unless admin)
            if (req.user.role !== _authdto.UserRole.ADMIN && req.user.id !== landlordId) {
                throw new _common.HttpException('You can only access your own escrow balances', _common.HttpStatus.FORBIDDEN);
            }
            const escrowBalances = await this.landlordPayoutService.getLandlordEscrowBalances(landlordId);
            // Filter for unreleased only if requested
            const filteredBalances = queryDto.unreleasedOnly ? escrowBalances.filter((balance)=>!balance.isReleased) : escrowBalances;
            return {
                success: true,
                data: filteredBalances
            };
        } catch (error) {
            if (error instanceof _common.HttpException) {
                throw error;
            }
            throw new _common.HttpException(`Failed to retrieve escrow balances: ${error.message}`, _common.HttpStatus.BAD_REQUEST);
        }
    }
    async calculateTransitionDate(calculationDto) {
        try {
            const expiryDate = new Date(calculationDto.expiryDate);
            const originalExpiryDate = calculationDto.originalExpiryDate ? new Date(calculationDto.originalExpiryDate) : null;
            const isExistingTenant = calculationDto.isExistingTenant || false;
            const transitionStartDate = this.tenantPaymentService.calculateTransitionStartDate(isExistingTenant, originalExpiryDate, expiryDate);
            // Calculate first payment due (same as transition start)
            const firstPaymentDue = new Date(transitionStartDate);
            // Calculate months until transition
            const today = new Date();
            const monthsUntilTransition = Math.max(0, Math.floor((transitionStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
            return {
                success: true,
                data: {
                    transitionStartDate,
                    firstPaymentDue,
                    monthsUntilTransition
                }
            };
        } catch (error) {
            throw new _common.HttpException(`Failed to calculate transition date: ${error.message}`, _common.HttpStatus.BAD_REQUEST);
        }
    }
    async getTotalEscrowAmount(landlordId, req) {
        try {
            // Verify the landlord is accessing their own escrow (unless admin)
            if (req.user.role !== _authdto.UserRole.ADMIN && req.user.id !== landlordId) {
                throw new _common.HttpException('You can only access your own escrow information', _common.HttpStatus.FORBIDDEN);
            }
            const totalAmount = await this.landlordPayoutService.getTotalEscrowedAmount(landlordId);
            return {
                success: true,
                data: {
                    landlordId,
                    totalEscrowedAmount: totalAmount
                }
            };
        } catch (error) {
            if (error instanceof _common.HttpException) {
                throw error;
            }
            throw new _common.HttpException(`Failed to retrieve total escrow amount: ${error.message}`, _common.HttpStatus.BAD_REQUEST);
        }
    }
    constructor(tenantPaymentService, landlordPayoutService){
        this.tenantPaymentService = tenantPaymentService;
        this.landlordPayoutService = landlordPayoutService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.LANDLORD, _authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new rent contract',
        description: 'Creates a new tenant rent contract with specified terms and payout preferences'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Contract created successfully',
        type: _tenantrentcontractdto.RentContractResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid contract data'
    }),
    (0, _swagger.ApiResponse)({
        status: 403,
        description: 'Insufficient permissions'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantrentcontractdto.CreateRentContractDto === "undefined" ? Object : _tenantrentcontractdto.CreateRentContractDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantRentContractsController.prototype, "createRentContract", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get rent contract by ID',
        description: 'Retrieves a specific rent contract by its ID with arrears info if applicable'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Contract ID',
        type: 'string'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Contract retrieved successfully',
        type: _tenantrentcontractdto.RentContractResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Contract not found'
    }),
    (0, _swagger.ApiResponse)({
        status: 403,
        description: 'Access denied to this contract'
    }),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantRentContractsController.prototype, "getRentContract", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get rent contracts with filters',
        description: 'Retrieves rent contracts based on query parameters'
    }),
    (0, _swagger.ApiQuery)({
        name: 'tenantId',
        required: false,
        description: 'Filter by tenant ID'
    }),
    (0, _swagger.ApiQuery)({
        name: 'landlordId',
        required: false,
        description: 'Filter by landlord ID'
    }),
    (0, _swagger.ApiQuery)({
        name: 'propertyId',
        required: false,
        description: 'Filter by property ID'
    }),
    (0, _swagger.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filter by contract status'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Contracts retrieved successfully',
        type: [
            _tenantrentcontractdto.RentContractResponseDto
        ]
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantrentcontractdto.ContractQueryDto === "undefined" ? Object : _tenantrentcontractdto.ContractQueryDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantRentContractsController.prototype, "getRentContracts", null);
_ts_decorate([
    (0, _common.Post)(':id/payments'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.TENANT, _authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Process a rent payment',
        description: 'Processes a monthly rent payment for the specified contract'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Contract ID',
        type: 'string'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment processed successfully',
        type: _tenantrentcontractdto.PaymentResultDto
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid payment data'
    }),
    (0, _swagger.ApiResponse)({
        status: 403,
        description: 'Not authorized to make payment for this contract'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Contract not found'
    }),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _tenantrentcontractdto.ProcessPaymentDto === "undefined" ? Object : _tenantrentcontractdto.ProcessPaymentDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantRentContractsController.prototype, "processPayment", null);
_ts_decorate([
    (0, _common.Get)('landlords/:landlordId/escrow-balances'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.LANDLORD, _authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Get landlord escrow balances',
        description: 'Retrieves escrow balances for a specific landlord'
    }),
    (0, _swagger.ApiParam)({
        name: 'landlordId',
        description: 'Landlord user ID',
        type: 'string'
    }),
    (0, _swagger.ApiQuery)({
        name: 'unreleasedOnly',
        required: false,
        description: 'Show only unreleased balances'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Escrow balances retrieved successfully',
        type: [
            _tenantrentcontractdto.EscrowBalanceResponseDto
        ]
    }),
    (0, _swagger.ApiResponse)({
        status: 403,
        description: 'Access denied to escrow balances'
    }),
    _ts_param(0, (0, _common.Param)('landlordId', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Query)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _tenantrentcontractdto.EscrowBalanceQueryDto === "undefined" ? Object : _tenantrentcontractdto.EscrowBalanceQueryDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantRentContractsController.prototype, "getLandlordEscrowBalances", null);
_ts_decorate([
    (0, _common.Post)('calculate-transition-date'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.LANDLORD, _authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Calculate transition start date',
        description: 'Calculates when a tenant should start paying through the system'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Transition date calculated successfully',
        type: _tenantrentcontractdto.TransitionDateResponseDto
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantrentcontractdto.TransitionDateCalculationDto === "undefined" ? Object : _tenantrentcontractdto.TransitionDateCalculationDto
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantRentContractsController.prototype, "calculateTransitionDate", null);
_ts_decorate([
    (0, _common.Get)('landlords/:landlordId/total-escrow'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.LANDLORD, _authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Get total escrow amount for landlord',
        description: 'Retrieves the total amount held in escrow for a landlord'
    }),
    (0, _swagger.ApiParam)({
        name: 'landlordId',
        description: 'Landlord user ID',
        type: 'string'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Total escrow amount retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('landlordId', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantRentContractsController.prototype, "getTotalEscrowAmount", null);
TenantRentContractsController = _ts_decorate([
    (0, _swagger.ApiTags)('tenant-rent-contracts'),
    (0, _common.Controller)('rent-contracts'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantpaymentservice.TenantPaymentService === "undefined" ? Object : _tenantpaymentservice.TenantPaymentService,
        typeof _landlordpayoutservice.LandlordPayoutService === "undefined" ? Object : _landlordpayoutservice.LandlordPayoutService
    ])
], TenantRentContractsController);

//# sourceMappingURL=tenant-rent-contracts.controller.js.map