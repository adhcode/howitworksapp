"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "FacilitatorsController", {
    enumerable: true,
    get: function() {
        return FacilitatorsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _facilitatorsservice = require("./facilitators.service");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _authdto = require("../auth/dto/auth.dto");
const _facilitatordto = require("./dto/facilitator.dto");
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
let FacilitatorsController = class FacilitatorsController {
    async createFacilitator(createFacilitatorDto) {
        const facilitator = await this.facilitatorsService.createFacilitator(createFacilitatorDto);
        return {
            success: true,
            message: 'Facilitator created successfully',
            data: facilitator
        };
    }
    async getAllFacilitators() {
        const facilitators = await this.facilitatorsService.getAllFacilitators();
        return {
            success: true,
            data: facilitators
        };
    }
    async getFacilitatorById(id) {
        const facilitator = await this.facilitatorsService.getFacilitatorById(id);
        return {
            success: true,
            data: facilitator
        };
    }
    async assignFacilitatorToProperty(assignDto, req) {
        const result = await this.facilitatorsService.assignFacilitatorToProperty(assignDto, req.user.id);
        return result;
    }
    async removeFacilitatorFromProperty(propertyId, req) {
        const result = await this.facilitatorsService.removeFacilitatorFromProperty(propertyId, req.user.id);
        return result;
    }
    async getFacilitatorProperties(id) {
        const properties = await this.facilitatorsService.getFacilitatorProperties(id);
        return {
            success: true,
            data: properties
        };
    }
    async getFacilitatorStats(id) {
        const stats = await this.facilitatorsService.getFacilitatorStats(id);
        return {
            success: true,
            data: stats
        };
    }
    async updateFacilitatorStatus(id, updateStatusDto, req) {
        const facilitator = await this.facilitatorsService.updateFacilitatorStatus(id, updateStatusDto.isActive, req.user.id);
        return {
            success: true,
            message: `Facilitator ${updateStatusDto.isActive ? 'activated' : 'deactivated'} successfully`,
            data: facilitator
        };
    }
    async getFacilitatorTenants(id) {
        const tenants = await this.facilitatorsService.getFacilitatorTenants(id);
        return {
            success: true,
            data: tenants
        };
    }
    async getFacilitatorPropertyById(id, req) {
        const property = await this.facilitatorsService.getFacilitatorPropertyById(id, req.user.id);
        return {
            success: true,
            data: property
        };
    }
    async getFacilitatorPropertyUnits(id, req) {
        const units = await this.facilitatorsService.getFacilitatorPropertyUnits(id, req.user.id);
        return {
            success: true,
            data: units
        };
    }
    async getFacilitatorPropertyTenants(id, req) {
        const tenants = await this.facilitatorsService.getFacilitatorPropertyTenants(id, req.user.id);
        return {
            success: true,
            data: tenants
        };
    }
    async getFacilitatorPropertyMaintenance(id, req) {
        const maintenance = await this.facilitatorsService.getFacilitatorPropertyMaintenance(id, req.user.id);
        return {
            success: true,
            data: maintenance
        };
    }
    async getFacilitatorPropertyPayments(id, req) {
        const payments = await this.facilitatorsService.getFacilitatorPropertyPayments(id, req.user.id);
        return {
            success: true,
            data: payments
        };
    }
    async getFacilitatorMaintenanceRequests(req) {
        const maintenanceRequests = await this.facilitatorsService.getFacilitatorMaintenanceRequests(req.user.id);
        return {
            success: true,
            data: maintenanceRequests
        };
    }
    async getPropertyFacilitator(propertyId) {
        const facilitator = await this.facilitatorsService.getPropertyFacilitator(propertyId);
        return {
            success: true,
            data: facilitator
        };
    }
    async addMaintenanceComment(id, commentData, req) {
        const result = await this.facilitatorsService.addMaintenanceComment(req.user.id, id, commentData.comment);
        return {
            success: true,
            data: result,
            message: 'Comment added successfully'
        };
    }
    async getMaintenanceRequestDetails(id, req) {
        const request = await this.facilitatorsService.getMaintenanceRequestDetails(req.user.id, id);
        return {
            success: true,
            data: request
        };
    }
    constructor(facilitatorsService){
        this.facilitatorsService = facilitatorsService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new facilitator (Admin only)'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.CREATED,
        description: 'Facilitator created successfully',
        type: _facilitatordto.FacilitatorResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.BAD_REQUEST,
        description: 'Invalid input data'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.FORBIDDEN,
        description: 'Only admins can create facilitators'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _facilitatordto.CreateFacilitatorDto === "undefined" ? Object : _facilitatordto.CreateFacilitatorDto
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "createFacilitator", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Get all facilitators (Admin only)'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitators retrieved successfully',
        type: [
            _facilitatordto.FacilitatorResponseDto
        ]
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getAllFacilitators", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN, _authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get facilitator by ID'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Facilitator ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator retrieved successfully',
        type: _facilitatordto.FacilitatorResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.NOT_FOUND,
        description: 'Facilitator not found'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorById", null);
_ts_decorate([
    (0, _common.Post)('assign'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Assign facilitator to property (Admin only)'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator assigned successfully',
        type: _facilitatordto.PropertyAssignmentResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.NOT_FOUND,
        description: 'Facilitator or property not found'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.FORBIDDEN,
        description: 'Only admins can assign facilitators'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _facilitatordto.AssignFacilitatorDto === "undefined" ? Object : _facilitatordto.AssignFacilitatorDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "assignFacilitatorToProperty", null);
_ts_decorate([
    (0, _common.Delete)('property/:propertyId/facilitator'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Remove facilitator from property (Admin only)'
    }),
    (0, _swagger.ApiParam)({
        name: 'propertyId',
        description: 'Property ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator removed successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.NOT_FOUND,
        description: 'Property not found'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.FORBIDDEN,
        description: 'Only admins can remove facilitators'
    }),
    _ts_param(0, (0, _common.Param)('propertyId')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "removeFacilitatorFromProperty", null);
_ts_decorate([
    (0, _common.Get)(':id/properties'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN, _authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get properties assigned to facilitator'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Facilitator ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Properties retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorProperties", null);
_ts_decorate([
    (0, _common.Get)(':id/stats'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN, _authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get facilitator dashboard statistics'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Facilitator ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Statistics retrieved successfully',
        type: _facilitatordto.FacilitatorStatsDto
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorStats", null);
_ts_decorate([
    (0, _common.Put)(':id/status'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    (0, _swagger.ApiOperation)({
        summary: 'Update facilitator status (Admin only)'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Facilitator ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator status updated successfully',
        type: _facilitatordto.FacilitatorResponseDto
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.NOT_FOUND,
        description: 'Facilitator not found'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.FORBIDDEN,
        description: 'Only admins can update facilitator status'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _facilitatordto.UpdateFacilitatorStatusDto === "undefined" ? Object : _facilitatordto.UpdateFacilitatorStatusDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "updateFacilitatorStatus", null);
_ts_decorate([
    (0, _common.Get)(':id/tenants'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN, _authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get tenants for facilitator\'s assigned properties'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Facilitator ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Tenants retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorTenants", null);
_ts_decorate([
    (0, _common.Get)('properties/:id'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get property details for facilitator'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Property ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Property retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorPropertyById", null);
_ts_decorate([
    (0, _common.Get)('properties/:id/units'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get units for facilitator property'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Property ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Units retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorPropertyUnits", null);
_ts_decorate([
    (0, _common.Get)('properties/:id/tenants'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get tenants for facilitator property'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Property ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Tenants retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorPropertyTenants", null);
_ts_decorate([
    (0, _common.Get)('properties/:id/maintenance'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get maintenance requests for facilitator property'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Property ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Maintenance requests retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorPropertyMaintenance", null);
_ts_decorate([
    (0, _common.Get)('properties/:id/payments'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get payments for facilitator property'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Property ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payments retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorPropertyPayments", null);
_ts_decorate([
    (0, _common.Get)('maintenance-requests'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get all maintenance requests for facilitator\'s assigned properties'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Maintenance requests retrieved successfully'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getFacilitatorMaintenanceRequests", null);
_ts_decorate([
    (0, _common.Get)('property/:propertyId/facilitator'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN, _authdto.UserRole.LANDLORD, _authdto.UserRole.TENANT, _authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get facilitator for a specific property'
    }),
    (0, _swagger.ApiParam)({
        name: 'propertyId',
        description: 'Property ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator retrieved successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.NOT_FOUND,
        description: 'Property not found'
    }),
    _ts_param(0, (0, _common.Param)('propertyId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getPropertyFacilitator", null);
_ts_decorate([
    (0, _common.Post)('maintenance/:id/comment'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Add a comment to a maintenance request'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Maintenance request ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.CREATED,
        description: 'Comment added successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "addMaintenanceComment", null);
_ts_decorate([
    (0, _common.Get)('maintenance/:id'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get maintenance request details'
    }),
    (0, _swagger.ApiParam)({
        name: 'id',
        description: 'Maintenance request ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Maintenance request retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], FacilitatorsController.prototype, "getMaintenanceRequestDetails", null);
FacilitatorsController = _ts_decorate([
    (0, _swagger.ApiTags)('facilitators'),
    (0, _common.Controller)('facilitators'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _facilitatorsservice.FacilitatorsService === "undefined" ? Object : _facilitatorsservice.FacilitatorsService
    ])
], FacilitatorsController);

//# sourceMappingURL=facilitators.controller.js.map