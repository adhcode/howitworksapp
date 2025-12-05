"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MaintenanceController", {
    enumerable: true,
    get: function() {
        return MaintenanceController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _authdto = require("../auth/dto/auth.dto");
const _messagesservice = require("./messages.service");
const _enhancedmessagesservice = require("./enhanced-messages.service");
const _messagedto = require("./dto/message.dto");
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
let MaintenanceController = class MaintenanceController {
    async createRequest(req, createMaintenanceRequestDto) {
        return this.enhancedMessagesService.createMaintenanceRequestWithRouting(req.user.id, createMaintenanceRequestDto);
    }
    async getRequests(req) {
        if (req.user.role === 'facilitator') {
            return this.enhancedMessagesService.getFacilitatorMaintenanceRequests(req.user.id);
        }
        return this.messagesService.getMaintenanceRequests(req.user.id, req.user.role);
    }
    async getRequest(req, id) {
        return this.enhancedMessagesService.getMaintenanceRequestById(id, req.user.id);
    }
    async updateStatus(req, id, updateDto) {
        return this.enhancedMessagesService.updateMaintenanceRequestStatus(id, updateDto.status, req.user.id, updateDto.notes);
    }
    async updatePriority(req, id, updateDto) {
        return this.enhancedMessagesService.updateMaintenanceRequestPriority(id, updateDto.priority, req.user.id, updateDto.notes);
    }
    async addComment(req, id, commentDto) {
        return this.enhancedMessagesService.addMaintenanceComment(id, req.user.id, commentDto.comment);
    }
    constructor(messagesService, enhancedMessagesService){
        this.messagesService = messagesService;
        this.enhancedMessagesService = enhancedMessagesService;
    }
};
_ts_decorate([
    (0, _common.Post)('requests'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.TENANT),
    (0, _swagger.ApiOperation)({
        summary: 'Create a maintenance request (routes to facilitator if assigned)'
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
        typeof _messagedto.CreateMaintenanceRequestDto === "undefined" ? Object : _messagedto.CreateMaintenanceRequestDto
    ]),
    _ts_metadata("design:returntype", Promise)
], MaintenanceController.prototype, "createRequest", null);
_ts_decorate([
    (0, _common.Get)('requests'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.TENANT, _authdto.UserRole.LANDLORD, _authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get maintenance requests'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Maintenance requests retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], MaintenanceController.prototype, "getRequests", null);
_ts_decorate([
    (0, _common.Get)('requests/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get a specific maintenance request'
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
], MaintenanceController.prototype, "getRequest", null);
_ts_decorate([
    (0, _common.Patch)('requests/:id/status'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.LANDLORD, _authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Update maintenance request status'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Status updated successfully'
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
], MaintenanceController.prototype, "updateStatus", null);
_ts_decorate([
    (0, _common.Patch)('requests/:id/priority'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.LANDLORD, _authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Update maintenance request priority'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Priority updated successfully'
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
], MaintenanceController.prototype, "updatePriority", null);
_ts_decorate([
    (0, _common.Post)('requests/:id/comments'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.TENANT, _authdto.UserRole.LANDLORD, _authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Add comment to maintenance request'
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
], MaintenanceController.prototype, "addComment", null);
MaintenanceController = _ts_decorate([
    (0, _swagger.ApiTags)('Maintenance'),
    (0, _common.Controller)('maintenance'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _swagger.ApiBearerAuth)('JWT-auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _messagesservice.MessagesService === "undefined" ? Object : _messagesservice.MessagesService,
        typeof _enhancedmessagesservice.EnhancedMessagesService === "undefined" ? Object : _enhancedmessagesservice.EnhancedMessagesService
    ])
], MaintenanceController);

//# sourceMappingURL=maintenance.controller.js.map