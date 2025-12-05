"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ContractsController", {
    enumerable: true,
    get: function() {
        return ContractsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _contractsservice = require("./contracts.service");
const _jwtauthguard = require("../../auth/guards/jwt-auth.guard");
const _rolesguard = require("../../auth/guards/roles.guard");
const _rolesdecorator = require("../../auth/decorators/roles.decorator");
const _createcontractdto = require("./dto/create-contract.dto");
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
var UserRole = /*#__PURE__*/ function(UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["LANDLORD"] = "landlord";
    UserRole["TENANT"] = "tenant";
    UserRole["FACILITATOR"] = "facilitator";
    return UserRole;
}(UserRole || {});
let ContractsController = class ContractsController {
    /**
   * CREATE CONTRACT FOR NEW TENANT
   * 
   * Endpoint: POST /contracts/new
   * 
   * Creates a fresh lease contract for a tenant just moving in.
   * Payment starts on lease start date.
   * 
   * Access: Landlords and Admins only
   */ async createNewTenantContract(dto, req) {
        try {
            // Verify landlord ID matches authenticated user (unless admin)
            if (req.user.role !== "admin" && dto.landlordId !== req.user.id) {
                throw new _common.HttpException('You can only create contracts for your own properties', _common.HttpStatus.FORBIDDEN);
            }
            const contract = await this.contractsService.createNewTenantContract(dto);
            return {
                success: true,
                message: 'Contract created successfully for new tenant',
                data: contract
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to create contract', error.status || _common.HttpStatus.BAD_REQUEST);
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
   */ async createExistingTenantContract(dto, req) {
        try {
            // Verify landlord ID matches authenticated user (unless admin)
            if (req.user.role !== "admin" && dto.landlordId !== req.user.id) {
                throw new _common.HttpException('You can only create contracts for your own properties', _common.HttpStatus.FORBIDDEN);
            }
            const contract = await this.contractsService.createExistingTenantContract(dto);
            return {
                success: true,
                message: 'Contract created successfully for existing tenant',
                data: contract
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to create contract', error.status || _common.HttpStatus.BAD_REQUEST);
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
   */ async getContracts(query, req) {
        try {
            // Enforce access control based on role
            if (req.user.role === "tenant") {
                query.tenantId = req.user.id; // Tenants can only see their own contracts
            } else if (req.user.role === "landlord") {
                query.landlordId = req.user.id; // Landlords can only see their properties' contracts
            }
            // Admins can see all contracts (no restriction)
            const contracts = await this.contractsService.getContracts(query);
            return {
                success: true,
                data: contracts,
                count: contracts.length
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch contracts', error.status || _common.HttpStatus.BAD_REQUEST);
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
   */ async getContractById(id, req) {
        try {
            const contract = await this.contractsService.getContractById(id);
            // Check access permissions
            const hasAccess = req.user.role === "admin" || contract.tenantId === req.user.id || contract.landlordId === req.user.id;
            if (!hasAccess) {
                throw new _common.HttpException('You do not have permission to view this contract', _common.HttpStatus.FORBIDDEN);
            }
            return {
                success: true,
                data: contract
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch contract', error.status || _common.HttpStatus.BAD_REQUEST);
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
   */ async updateContract(id, dto, req) {
        try {
            const contract = await this.contractsService.getContractById(id);
            // Check access permissions
            if (req.user.role !== "admin" && contract.landlordId !== req.user.id) {
                throw new _common.HttpException('You can only update contracts for your own properties', _common.HttpStatus.FORBIDDEN);
            }
            const updated = await this.contractsService.updateContract(id, dto);
            return {
                success: true,
                message: 'Contract updated successfully',
                data: updated
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to update contract', error.status || _common.HttpStatus.BAD_REQUEST);
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
   */ async terminateContract(id, req) {
        try {
            const contract = await this.contractsService.getContractById(id);
            // Check access permissions
            if (req.user.role !== "admin" && contract.landlordId !== req.user.id) {
                throw new _common.HttpException('You can only terminate contracts for your own properties', _common.HttpStatus.FORBIDDEN);
            }
            const terminated = await this.contractsService.terminateContract(id);
            return {
                success: true,
                message: 'Contract terminated successfully',
                data: terminated
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to terminate contract', error.status || _common.HttpStatus.BAD_REQUEST);
        }
    }
    constructor(contractsService){
        this.contractsService = contractsService;
    }
};
_ts_decorate([
    (0, _common.Post)('new'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Create contract for new tenant',
        description: 'Creates a rental contract for a tenant starting a fresh lease. Payment starts on move-in date.'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.CREATED,
        description: 'Contract created successfully',
        type: _createcontractdto.ContractResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.BAD_REQUEST,
        description: 'Invalid data or duplicate contract'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.FORBIDDEN,
        description: 'Only landlords and admins can create contracts'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcontractdto.CreateNewTenantContractDto === "undefined" ? Object : _createcontractdto.CreateNewTenantContractDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ContractsController.prototype, "createNewTenantContract", null);
_ts_decorate([
    (0, _common.Post)('existing'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Create contract for existing tenant',
        description: 'Creates a contract for tenant with active lease elsewhere. Payment transition calculated automatically.'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.CREATED,
        description: 'Contract created successfully',
        type: _createcontractdto.ContractResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.BAD_REQUEST,
        description: 'Invalid data or duplicate contract'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.FORBIDDEN,
        description: 'Only landlords and admins can create contracts'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcontractdto.CreateExistingTenantContractDto === "undefined" ? Object : _createcontractdto.CreateExistingTenantContractDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ContractsController.prototype, "createExistingTenantContract", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _rolesdecorator.Roles)("admin", "landlord", "tenant", "facilitator"),
    (0, _swagger.ApiOperation)({
        summary: 'Query contracts',
        description: 'Get contracts with optional filters. Users see only their own contracts.'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Contracts retrieved successfully',
        type: [
            _createcontractdto.ContractResponseDto
        ]
    }),
    _ts_param(0, (0, _common.Query)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _createcontractdto.ContractQueryDto === "undefined" ? Object : _createcontractdto.ContractQueryDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ContractsController.prototype, "getContracts", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _rolesdecorator.Roles)("admin", "landlord", "tenant", "facilitator"),
    (0, _swagger.ApiOperation)({
        summary: 'Get contract by ID',
        description: 'Retrieve specific contract details'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Contract ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Contract retrieved successfully',
        type: _createcontractdto.ContractResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.NOT_FOUND,
        description: 'Contract not found'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.FORBIDDEN,
        description: 'Access denied'
    }),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ContractsController.prototype, "getContractById", null);
_ts_decorate([
    (0, _common.Put)(':id'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Update contract',
        description: 'Update contract details like rent amount, end date, or payout type'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Contract ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Contract updated successfully',
        type: _createcontractdto.ContractResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.NOT_FOUND,
        description: 'Contract not found'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.FORBIDDEN,
        description: 'Access denied'
    }),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _createcontractdto.UpdateContractDto === "undefined" ? Object : _createcontractdto.UpdateContractDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ContractsController.prototype, "updateContract", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _rolesdecorator.Roles)("landlord", "admin"),
    (0, _swagger.ApiOperation)({
        summary: 'Terminate contract',
        description: 'Terminate a contract early'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Contract ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Contract terminated successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.NOT_FOUND,
        description: 'Contract not found'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.FORBIDDEN,
        description: 'Access denied'
    }),
    _ts_param(0, (0, _common.Param)('id', _common.ParseUUIDPipe)),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], ContractsController.prototype, "terminateContract", null);
ContractsController = _ts_decorate([
    (0, _swagger.ApiTags)('contracts'),
    (0, _common.Controller)('contracts'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _contractsservice.ContractsService === "undefined" ? Object : _contractsservice.ContractsService
    ])
], ContractsController);

//# sourceMappingURL=contracts.controller.js.map