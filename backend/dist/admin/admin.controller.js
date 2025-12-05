"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AdminController", {
    enumerable: true,
    get: function() {
        return AdminController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _rolesguard = require("../auth/guards/roles.guard");
const _rolesdecorator = require("../auth/decorators/roles.decorator");
const _authdto = require("../auth/dto/auth.dto");
const _adminservice = require("./admin.service");
const _facilitatorsservice = require("../facilitators/facilitators.service");
const _admindto = require("./dto/admin.dto");
const _facilitatordto = require("../facilitators/dto/facilitator.dto");
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
let AdminController = class AdminController {
    async getDashboardStats() {
        try {
            return await this.adminService.getDashboardStats();
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch dashboard stats', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getRevenueAnalytics(timeframe = '6m') {
        try {
            return await this.adminService.getRevenueAnalytics(timeframe);
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch revenue analytics', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMaintenanceAnalytics(timeframe = '6m') {
        try {
            return await this.adminService.getMaintenanceAnalytics(timeframe);
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch maintenance analytics', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUsers(page = '1', limit = '10', role, search) {
        return this.adminService.getUsers({
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            role,
            search
        });
    }
    async createUser(createUserDto) {
        return this.adminService.createUser(createUserDto);
    }
    async getUserById(id) {
        return this.adminService.getUserById(id);
    }
    async updateUser(id, updateUserDto) {
        return this.adminService.updateUser(id, updateUserDto);
    }
    async deleteUser(id) {
        return this.adminService.deleteUser(id);
    }
    async toggleUserStatus(id) {
        return this.adminService.toggleUserStatus(id);
    }
    async getProperties(page = '1', limit = '10', search) {
        return this.adminService.getProperties({
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            search
        });
    }
    async assignFacilitatorToProperty(propertyId, assignFacilitatorDto) {
        return this.adminService.assignFacilitatorToProperty(propertyId, assignFacilitatorDto.facilitatorId);
    }
    async removeFacilitatorFromProperty(propertyId) {
        return this.adminService.removeFacilitatorFromProperty(propertyId);
    }
    async getPropertyAnalytics(timeframe = '30d') {
        return this.adminService.getPropertyAnalytics(timeframe);
    }
    // Facilitator Management Endpoints
    async getAllFacilitators() {
        try {
            const facilitators = await this.facilitatorsService.getAllFacilitators();
            return {
                success: true,
                data: facilitators
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch facilitators', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createFacilitator(createFacilitatorDto) {
        try {
            const facilitator = await this.facilitatorsService.createFacilitator(createFacilitatorDto);
            return {
                success: true,
                message: 'Facilitator created successfully',
                data: facilitator
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to create facilitator', _common.HttpStatus.BAD_REQUEST);
        }
    }
    async getFacilitatorById(id) {
        try {
            const facilitator = await this.facilitatorsService.getFacilitatorById(id);
            return {
                success: true,
                data: facilitator
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Facilitator not found', _common.HttpStatus.NOT_FOUND);
        }
    }
    async getFacilitatorProperties(id) {
        try {
            const properties = await this.facilitatorsService.getFacilitatorProperties(id);
            return {
                success: true,
                data: properties
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch facilitator properties', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFacilitatorStats(id) {
        try {
            const stats = await this.facilitatorsService.getFacilitatorStats(id);
            return {
                success: true,
                data: stats
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch facilitator stats', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateFacilitatorStatus(id, updateDto, req) {
        try {
            const facilitator = await this.facilitatorsService.updateFacilitatorStatus(id, updateDto.isActive, req.user.id);
            return {
                success: true,
                message: `Facilitator ${updateDto.isActive ? 'activated' : 'deactivated'} successfully`,
                data: facilitator
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to update facilitator status', _common.HttpStatus.BAD_REQUEST);
        }
    }
    async resetFacilitatorPassword(id) {
        try {
            const result = await this.facilitatorsService.resetPassword(id);
            return {
                success: true,
                message: 'Password reset successfully',
                data: result
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to reset password', _common.HttpStatus.BAD_REQUEST);
        }
    }
    async updateFacilitator(id, updateDto) {
        try {
            const facilitator = await this.facilitatorsService.updateFacilitator(id, updateDto);
            return {
                success: true,
                message: 'Facilitator updated successfully',
                data: facilitator
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to update facilitator', _common.HttpStatus.BAD_REQUEST);
        }
    }
    async assignFacilitatorToPropertyNew(assignDto, req) {
        try {
            const result = await this.facilitatorsService.assignFacilitatorToProperty(assignDto, req.user.id);
            return result;
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to assign facilitator', _common.HttpStatus.BAD_REQUEST);
        }
    }
    async removeFacilitatorFromPropertyNew(propertyId, req) {
        try {
            const result = await this.facilitatorsService.removeFacilitatorFromProperty(propertyId, req.user.id);
            return result;
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to remove facilitator', _common.HttpStatus.BAD_REQUEST);
        }
    }
    // Property Detail Endpoints
    async getPropertyById(id) {
        try {
            const property = await this.adminService.getPropertyById(id);
            return {
                success: true,
                data: property
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Property not found', _common.HttpStatus.NOT_FOUND);
        }
    }
    async getPropertyUnits(id) {
        try {
            const units = await this.adminService.getPropertyUnits(id);
            return {
                success: true,
                data: units
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch property units', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPropertyTenants(id) {
        try {
            const tenants = await this.adminService.getPropertyTenants(id);
            return {
                success: true,
                data: tenants
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch property tenants', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPropertyMaintenance(id) {
        try {
            const maintenance = await this.adminService.getPropertyMaintenance(id);
            return {
                success: true,
                data: maintenance
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch property maintenance', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPropertyPayments(id) {
        try {
            const payments = await this.adminService.getPropertyPayments(id);
            return {
                success: true,
                data: payments
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch property payments', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllMaintenanceRequests(status, priority, page = '1', limit = '50') {
        try {
            const maintenance = await this.adminService.getAllMaintenanceRequests({
                status,
                priority,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10)
            });
            return {
                success: true,
                data: maintenance
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch maintenance requests', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAdminConversations(req) {
        try {
            const conversations = await this.adminService.getAdminConversations(req.user.id);
            return {
                success: true,
                data: conversations
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch conversations', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAdminConversation(req, otherUserId, page = '1', limit = '20') {
        try {
            const messages = await this.adminService.getAdminConversation(req.user.id, otherUserId, {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10)
            });
            return {
                success: true,
                data: messages
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch conversation', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async sendAdminMessage(req, messageDto) {
        try {
            const message = await this.adminService.sendAdminMessage(req.user.id, messageDto);
            return {
                success: true,
                data: message
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to send message', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAdminUnreadCount(req) {
        try {
            const count = await this.adminService.getAdminUnreadCount(req.user.id);
            return {
                success: true,
                data: count
            };
        } catch (error) {
            throw new _common.HttpException(error.message || 'Failed to fetch unread count', _common.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    constructor(adminService, facilitatorsService){
        this.adminService = adminService;
        this.facilitatorsService = facilitatorsService;
    }
};
_ts_decorate([
    (0, _common.Get)('dashboard/stats'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
_ts_decorate([
    (0, _common.Get)('analytics/revenue'),
    _ts_param(0, (0, _common.Query)('timeframe')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getRevenueAnalytics", null);
_ts_decorate([
    (0, _common.Get)('analytics/maintenance'),
    _ts_param(0, (0, _common.Query)('timeframe')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getMaintenanceAnalytics", null);
_ts_decorate([
    (0, _common.Get)('users'),
    (0, _swagger.ApiOperation)({
        summary: 'Get all users with pagination and filtering'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Users retrieved successfully'
    }),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('role')),
    _ts_param(3, (0, _common.Query)('search')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getUsers", null);
_ts_decorate([
    (0, _common.Post)('users'),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new user (facilitator)'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.CREATED,
        description: 'User created successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _admindto.CreateUserDto === "undefined" ? Object : _admindto.CreateUserDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "createUser", null);
_ts_decorate([
    (0, _common.Get)('users/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get user by ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'User retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getUserById", null);
_ts_decorate([
    (0, _common.Patch)('users/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Update user'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'User updated successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _admindto.UpdateUserDto === "undefined" ? Object : _admindto.UpdateUserDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "updateUser", null);
_ts_decorate([
    (0, _common.Delete)('users/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Delete user'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'User deleted successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUser", null);
_ts_decorate([
    (0, _common.Patch)('users/:id/toggle-status'),
    (0, _swagger.ApiOperation)({
        summary: 'Toggle user active status'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'User status updated successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "toggleUserStatus", null);
_ts_decorate([
    (0, _common.Get)('properties'),
    (0, _swagger.ApiOperation)({
        summary: 'Get all properties with pagination'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Properties retrieved successfully'
    }),
    _ts_param(0, (0, _common.Query)('page')),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('search')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getProperties", null);
_ts_decorate([
    (0, _common.Patch)('properties/:id/assign-facilitator'),
    (0, _swagger.ApiOperation)({
        summary: 'Assign facilitator to property'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator assigned successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        typeof _admindto.AdminAssignFacilitatorDto === "undefined" ? Object : _admindto.AdminAssignFacilitatorDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "assignFacilitatorToProperty", null);
_ts_decorate([
    (0, _common.Patch)('properties/:id/remove-facilitator'),
    (0, _swagger.ApiOperation)({
        summary: 'Remove facilitator from property'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator removed successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "removeFacilitatorFromProperty", null);
_ts_decorate([
    (0, _common.Get)('analytics/properties'),
    (0, _swagger.ApiOperation)({
        summary: 'Get property analytics'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Property analytics retrieved successfully'
    }),
    _ts_param(0, (0, _common.Query)('timeframe')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getPropertyAnalytics", null);
_ts_decorate([
    (0, _common.Get)('facilitators'),
    (0, _swagger.ApiOperation)({
        summary: 'Get all facilitators'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitators retrieved successfully'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getAllFacilitators", null);
_ts_decorate([
    (0, _common.Post)('facilitators'),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new facilitator'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.CREATED,
        description: 'Facilitator created successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _facilitatordto.CreateFacilitatorDto === "undefined" ? Object : _facilitatordto.CreateFacilitatorDto
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "createFacilitator", null);
_ts_decorate([
    (0, _common.Get)('facilitators/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get facilitator by ID'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getFacilitatorById", null);
_ts_decorate([
    (0, _common.Get)('facilitators/:id/properties'),
    (0, _swagger.ApiOperation)({
        summary: 'Get properties assigned to facilitator'
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
], AdminController.prototype, "getFacilitatorProperties", null);
_ts_decorate([
    (0, _common.Get)('facilitators/:id/stats'),
    (0, _swagger.ApiOperation)({
        summary: 'Get facilitator dashboard statistics'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Statistics retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getFacilitatorStats", null);
_ts_decorate([
    (0, _common.Patch)('facilitators/:id/status'),
    (0, _swagger.ApiOperation)({
        summary: 'Update facilitator status'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator status updated successfully'
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
], AdminController.prototype, "updateFacilitatorStatus", null);
_ts_decorate([
    (0, _common.Post)('facilitators/:id/reset-password'),
    (0, _swagger.ApiOperation)({
        summary: 'Reset facilitator password'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Password reset successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "resetFacilitatorPassword", null);
_ts_decorate([
    (0, _common.Patch)('facilitators/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Update facilitator details'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator updated successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "updateFacilitator", null);
_ts_decorate([
    (0, _common.Post)('facilitators/assign-property'),
    (0, _swagger.ApiOperation)({
        summary: 'Assign facilitator to property'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator assigned successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "assignFacilitatorToPropertyNew", null);
_ts_decorate([
    (0, _common.Delete)('properties/:propertyId/facilitator'),
    (0, _swagger.ApiOperation)({
        summary: 'Remove facilitator from property'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Facilitator removed successfully'
    }),
    _ts_param(0, (0, _common.Param)('propertyId')),
    _ts_param(1, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "removeFacilitatorFromPropertyNew", null);
_ts_decorate([
    (0, _common.Get)('properties/:id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get property by ID with details'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Property retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getPropertyById", null);
_ts_decorate([
    (0, _common.Get)('properties/:id/units'),
    (0, _swagger.ApiOperation)({
        summary: 'Get units for a property'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Units retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getPropertyUnits", null);
_ts_decorate([
    (0, _common.Get)('properties/:id/tenants'),
    (0, _swagger.ApiOperation)({
        summary: 'Get tenants for a property'
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
], AdminController.prototype, "getPropertyTenants", null);
_ts_decorate([
    (0, _common.Get)('properties/:id/maintenance'),
    (0, _swagger.ApiOperation)({
        summary: 'Get maintenance requests for a property'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Maintenance requests retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getPropertyMaintenance", null);
_ts_decorate([
    (0, _common.Get)('properties/:id/payments'),
    (0, _swagger.ApiOperation)({
        summary: 'Get payments for a property'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payments retrieved successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getPropertyPayments", null);
_ts_decorate([
    (0, _common.Get)('maintenance'),
    (0, _swagger.ApiOperation)({
        summary: 'Get all maintenance requests across all properties'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Maintenance requests retrieved successfully'
    }),
    _ts_param(0, (0, _common.Query)('status')),
    _ts_param(1, (0, _common.Query)('priority')),
    _ts_param(2, (0, _common.Query)('page')),
    _ts_param(3, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getAllMaintenanceRequests", null);
_ts_decorate([
    (0, _common.Get)('messages/conversations'),
    (0, _swagger.ApiOperation)({
        summary: 'Get all conversations for admin'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Conversations retrieved successfully'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminConversations", null);
_ts_decorate([
    (0, _common.Get)('messages/conversation/:otherUserId'),
    (0, _swagger.ApiOperation)({
        summary: 'Get messages in a conversation'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Messages retrieved successfully'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Param)('otherUserId')),
    _ts_param(2, (0, _common.Query)('page')),
    _ts_param(3, (0, _common.Query)('limit')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String,
        String,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminConversation", null);
_ts_decorate([
    (0, _common.Post)('messages'),
    (0, _swagger.ApiOperation)({
        summary: 'Send a message as admin'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.CREATED,
        description: 'Message sent successfully'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "sendAdminMessage", null);
_ts_decorate([
    (0, _common.Get)('messages/unread-count'),
    (0, _swagger.ApiOperation)({
        summary: 'Get unread message count for admin'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Unread count retrieved successfully'
    }),
    _ts_param(0, (0, _common.Req)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], AdminController.prototype, "getAdminUnreadCount", null);
AdminController = _ts_decorate([
    (0, _swagger.ApiTags)('Admin'),
    (0, _common.Controller)('admin'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.ADMIN),
    (0, _swagger.ApiBearerAuth)('JWT-auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _adminservice.AdminService === "undefined" ? Object : _adminservice.AdminService,
        typeof _facilitatorsservice.FacilitatorsService === "undefined" ? Object : _facilitatorsservice.FacilitatorsService
    ])
], AdminController);

//# sourceMappingURL=admin.controller.js.map