"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PropertiesController", {
    enumerable: true,
    get: function() {
        return PropertiesController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _propertiesservice = require("./properties.service");
const _propertydto = require("./dto/property.dto");
const _paginationdto = require("../common/dto/pagination.dto");
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
let PropertiesController = class PropertiesController {
    async create(req, createPropertyDto) {
        return this.propertiesService.create(req.user.id, createPropertyDto);
    }
    async findAll(req, pagination) {
        const result = await this.propertiesService.findAll(req.user.id, pagination);
        return {
            data: result.data,
            meta: {
                total: result.total,
                page: pagination.page || 1,
                limit: pagination.limit || 10,
                totalPages: Math.ceil(result.total / (pagination.limit || 10)),
                hasNextPage: (pagination.page || 1) * (pagination.limit || 10) < result.total,
                hasPrevPage: (pagination.page || 1) > 1
            }
        };
    }
    async getStats(req) {
        return this.propertiesService.getStats(req.user.id);
    }
    async findOne(req, id) {
        return this.propertiesService.findOne(id, req.user.id);
    }
    async findWithUnits(req, id) {
        return this.propertiesService.findWithUnits(id, req.user.id);
    }
    async update(req, id, updatePropertyDto) {
        return this.propertiesService.update(id, req.user.id, updatePropertyDto);
    }
    async remove(req, id) {
        await this.propertiesService.remove(id, req.user.id);
        return {
            message: 'Property deleted successfully'
        };
    }
    constructor(propertiesService){
        this.propertiesService = propertiesService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new property'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Property created successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        typeof _propertydto.CreatePropertyDto === "undefined" ? Object : _propertydto.CreatePropertyDto
    ]),
    _ts_metadata("design:returntype", Promise)
], PropertiesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get all properties for the authenticated landlord'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Properties retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        typeof _paginationdto.PaginationDto === "undefined" ? Object : _paginationdto.PaginationDto
    ]),
    _ts_metadata("design:returntype", Promise)
], PropertiesController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('stats'),
    (0, _swagger.ApiOperation)({
        summary: 'Get property statistics for the authenticated landlord'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Statistics retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], PropertiesController.prototype, "getStats", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get a specific property'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Property retrieved successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Property not found'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PropertiesController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Get)(':id/with-units'),
    (0, _swagger.ApiOperation)({
        summary: 'Get a property with its units'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Property with units retrieved successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Property not found'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PropertiesController.prototype, "findWithUnits", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Update a property'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Property updated successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Property not found'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String,
        typeof _propertydto.UpdatePropertyDto === "undefined" ? Object : _propertydto.UpdatePropertyDto
    ]),
    _ts_metadata("design:returntype", Promise)
], PropertiesController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Delete a property'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Property deleted successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Property not found'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], PropertiesController.prototype, "remove", null);
PropertiesController = _ts_decorate([
    (0, _swagger.ApiTags)('Properties'),
    (0, _common.Controller)('properties'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)('JWT-auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _propertiesservice.PropertiesService === "undefined" ? Object : _propertiesservice.PropertiesService
    ])
], PropertiesController);

//# sourceMappingURL=properties.controller.js.map