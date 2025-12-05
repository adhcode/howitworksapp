"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LandlordController", {
    enumerable: true,
    get: function() {
        return LandlordController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _landlordservice = require("./landlord.service");
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
let LandlordController = class LandlordController {
    async getDashboard(req) {
        const dashboardData = await this.landlordService.getDashboardData(req.user.id);
        return {
            success: true,
            data: dashboardData
        };
    }
    async generatePaymentSchedules(req) {
        try {
            console.log('🚀 Starting payment schedule generation for landlord:', req.user.id);
            const result = await this.landlordService.generatePaymentSchedulesForExistingTenants(req.user.id);
            console.log('✅ Payment schedule generation completed:', result);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('❌ Error generating payment schedules:', error);
            console.error('Error stack:', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async refreshDashboard(req) {
        try {
            console.log('🔄 Refreshing dashboard for landlord:', req.user.id);
            const dashboardData = await this.landlordService.getDashboardData(req.user.id);
            console.log('✅ Dashboard refreshed with data:', dashboardData);
            return {
                success: true,
                data: dashboardData
            };
        } catch (error) {
            console.error('❌ Error refreshing dashboard:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getRentContracts(req, status, payoutType) {
        try {
            const contracts = await this.landlordService.getRentContracts(req.user.id, {
                status,
                payoutType
            });
            return {
                success: true,
                data: contracts
            };
        } catch (error) {
            console.error('❌ Error fetching rent contracts:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getEscrowBalances(req) {
        try {
            const balances = await this.landlordService.getEscrowBalances(req.user.id);
            return {
                success: true,
                data: balances
            };
        } catch (error) {
            console.error('❌ Error fetching escrow balances:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getPaymentHistory(req, contractId, page = 1, limit = 20) {
        try {
            const history = await this.landlordService.getPaymentHistory(req.user.id, {
                contractId,
                page,
                limit
            });
            return {
                success: true,
                data: history
            };
        } catch (error) {
            console.error('❌ Error fetching payment history:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getContractStats(req) {
        try {
            const stats = await this.landlordService.getContractStats(req.user.id);
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('❌ Error fetching contract stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    // Maintenance endpoints
    async getMaintenanceRequests(req, status, propertyId) {
        try {
            const requests = await this.landlordService.getMaintenanceRequests(req.user.id, {
                status,
                propertyId
            });
            return {
                success: true,
                data: requests
            };
        } catch (error) {
            console.error('❌ Error fetching maintenance requests:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getMaintenanceStats(req) {
        try {
            const stats = await this.landlordService.getMaintenanceStats(req.user.id);
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            console.error('❌ Error fetching maintenance stats:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getMaintenanceRequest(req, id) {
        try {
            const request = await this.landlordService.getMaintenanceRequest(req.user.id, id);
            return {
                success: true,
                data: request
            };
        } catch (error) {
            console.error('❌ Error fetching maintenance request:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async reportMaintenance(req, maintenanceData) {
        try {
            const request = await this.landlordService.reportMaintenance(req.user.id, maintenanceData);
            return {
                success: true,
                data: request,
                message: 'Maintenance request submitted successfully'
            };
        } catch (error) {
            console.error('❌ Error reporting maintenance:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    async addMaintenanceComment(req, id, commentData) {
        try {
            const result = await this.landlordService.addMaintenanceComment(req.user.id, id, commentData.comment);
            return {
                success: true,
                data: result,
                message: 'Comment added successfully'
            };
        } catch (error) {
            console.error('❌ Error adding comment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    constructor(landlordService){
        this.landlordService = landlordService;
    }
};
_ts_decorate([
    (0, _common.Get)('dashboard'),
    (0, _swagger.ApiOperation)({
        summary: 'Get landlord dashboard data'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Dashboard data retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "getDashboard", null);
_ts_decorate([
    (0, _common.Post)('generate-payment-schedules'),
    (0, _swagger.ApiOperation)({
        summary: 'Generate payment schedules for existing tenants'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment schedules generated successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "generatePaymentSchedules", null);
_ts_decorate([
    (0, _common.Get)('dashboard/refresh'),
    (0, _swagger.ApiOperation)({
        summary: 'Refresh dashboard data with real calculations'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Dashboard refreshed successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "refreshDashboard", null);
_ts_decorate([
    (0, _common.Get)('rent-contracts'),
    (0, _swagger.ApiOperation)({
        summary: 'Get landlord rent contracts'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Rent contracts retrieved successfully'
    }),
    (0, _swagger.ApiQuery)({
        name: 'status',
        required: false,
        enum: [
            'active',
            'expired',
            'terminated'
        ]
    }),
    (0, _swagger.ApiQuery)({
        name: 'payoutType',
        required: false,
        enum: [
            'monthly',
            'yearly'
        ]
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Query)('status')),
    _ts_param(2, (0, _common.Query)('payoutType')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "getRentContracts", null);
_ts_decorate([
    (0, _common.Get)('escrow-balances'),
    (0, _swagger.ApiOperation)({
        summary: 'Get landlord escrow balances'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Escrow balances retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "getEscrowBalances", null);
_ts_decorate([
    (0, _common.Get)('payment-history'),
    (0, _swagger.ApiOperation)({
        summary: 'Get landlord payment history with contract filtering'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment history retrieved successfully'
    }),
    (0, _swagger.ApiQuery)({
        name: 'contractId',
        required: false
    }),
    (0, _swagger.ApiQuery)({
        name: 'page',
        required: false,
        type: Number
    }),
    (0, _swagger.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Query)('contractId')),
    _ts_param(2, (0, _common.Query)('page')),
    _ts_param(3, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        Number,
        Number
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "getPaymentHistory", null);
_ts_decorate([
    (0, _common.Get)('contract-stats'),
    (0, _swagger.ApiOperation)({
        summary: 'Get contract-based payment statistics'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Contract statistics retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "getContractStats", null);
_ts_decorate([
    (0, _common.Get)('maintenance'),
    (0, _swagger.ApiOperation)({
        summary: 'Get all maintenance requests for landlord properties'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Maintenance requests retrieved successfully'
    }),
    (0, _swagger.ApiQuery)({
        name: 'status',
        required: false,
        enum: [
            'pending',
            'in_progress',
            'completed',
            'cancelled'
        ]
    }),
    (0, _swagger.ApiQuery)({
        name: 'propertyId',
        required: false
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Query)('status')),
    _ts_param(2, (0, _common.Query)('propertyId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "getMaintenanceRequests", null);
_ts_decorate([
    (0, _common.Get)('maintenance/stats'),
    (0, _swagger.ApiOperation)({
        summary: 'Get maintenance statistics for landlord'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Maintenance statistics retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "getMaintenanceStats", null);
_ts_decorate([
    (0, _common.Get)('maintenance/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get maintenance request details'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Maintenance request retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "getMaintenanceRequest", null);
_ts_decorate([
    (0, _common.Post)('maintenance'),
    (0, _swagger.ApiOperation)({
        summary: 'Report a maintenance issue'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Maintenance request created successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "reportMaintenance", null);
_ts_decorate([
    (0, _common.Post)('maintenance/:id/comment'),
    (0, _swagger.ApiOperation)({
        summary: 'Add a comment to a maintenance request'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Comment added successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], LandlordController.prototype, "addMaintenanceComment", null);
LandlordController = _ts_decorate([
    (0, _swagger.ApiTags)('landlord'),
    (0, _common.Controller)('landlord'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _landlordservice.LandlordService === "undefined" ? Object : _landlordservice.LandlordService
    ])
], LandlordController);

//# sourceMappingURL=landlord.controller.js.map