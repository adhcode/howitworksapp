"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantsController", {
    enumerable: true,
    get: function() {
        return TenantsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _tenantsservice = require("./tenants.service");
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
let TenantsController = class TenantsController {
    async getMyData(req) {
        const tenantData = await this.tenantsService.getTenantData(req.user.id);
        return {
            success: true,
            data: tenantData
        };
    }
    async getRentContract(req) {
        const contract = await this.tenantsService.getTenantRentContract(req.user.id);
        return {
            success: true,
            data: contract
        };
    }
    async getPayments(req) {
        const paymentData = await this.tenantsService.getTenantPayments(req.user.id);
        return {
            success: true,
            data: paymentData
        };
    }
    async getReports(req) {
        const reports = await this.tenantsService.getTenantReports(req.user.id);
        return {
            success: true,
            data: reports
        };
    }
    async getComplaints(req) {
        const complaints = await this.tenantsService.getTenantComplaints(req.user.id);
        return {
            success: true,
            data: complaints
        };
    }
    async getComplaintDetail(id, req) {
        const complaint = await this.tenantsService.getComplaintDetail(id, req.user.id);
        return {
            success: true,
            data: complaint
        };
    }
    async submitComplaint(complaintData, req) {
        const complaint = await this.tenantsService.submitComplaint(complaintData, req.user.id);
        return {
            success: true,
            data: complaint
        };
    }
    constructor(tenantsService){
        this.tenantsService = tenantsService;
    }
};
_ts_decorate([
    (0, _common.Get)('my-data'),
    (0, _swagger.ApiOperation)({
        summary: 'Get current tenant data'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Tenant data retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "getMyData", null);
_ts_decorate([
    (0, _common.Get)('rent-contract'),
    (0, _swagger.ApiOperation)({
        summary: 'Get current tenant rent contract'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Rent contract retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "getRentContract", null);
_ts_decorate([
    (0, _common.Get)('payments'),
    (0, _swagger.ApiOperation)({
        summary: 'Get tenant payment information'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment data retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "getPayments", null);
_ts_decorate([
    (0, _common.Get)('reports'),
    (0, _swagger.ApiOperation)({
        summary: 'Get tenant reports'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Reports retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "getReports", null);
_ts_decorate([
    (0, _common.Get)('complaints'),
    (0, _swagger.ApiOperation)({
        summary: 'Get tenant complaints'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Complaints retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "getComplaints", null);
_ts_decorate([
    (0, _common.Get)('complaints/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get complaint detail'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Complaint detail retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "getComplaintDetail", null);
_ts_decorate([
    (0, _common.Post)('complaints'),
    (0, _swagger.ApiOperation)({
        summary: 'Submit new complaint'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Complaint submitted successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], TenantsController.prototype, "submitComplaint", null);
TenantsController = _ts_decorate([
    (0, _swagger.ApiTags)('tenants'),
    (0, _common.Controller)('tenants'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _tenantsservice.TenantsService === "undefined" ? Object : _tenantsservice.TenantsService
    ])
], TenantsController);

//# sourceMappingURL=tenants.controller.js.map