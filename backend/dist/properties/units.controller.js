"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "UnitsController", {
    enumerable: true,
    get: function() {
        return UnitsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _unitsservice = require("./units.service");
const _unitdto = require("./dto/unit.dto");
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
let UnitsController = class UnitsController {
    async create(req, propertyId, createUnitDto) {
        console.log('🔍 Controller - Raw body from request:', req.body);
        console.log('🔍 Controller - Processed DTO:', createUnitDto);
        console.log('🔍 Controller - DTO rent type:', typeof createUnitDto.rent, 'value:', createUnitDto.rent);
        return this.unitsService.create(propertyId, req.user.id, createUnitDto);
    }
    async findAll(req, propertyId) {
        return this.unitsService.findAll(propertyId, req.user.id);
    }
    async getAvailable(req, propertyId) {
        return this.unitsService.getAvailableUnits(propertyId, req.user.id);
    }
    async findOne(req, id) {
        return this.unitsService.findOne(id, req.user.id);
    }
    async update(req, id, updateUnitDto) {
        return this.unitsService.update(id, req.user.id, updateUnitDto);
    }
    async remove(req, id) {
        await this.unitsService.remove(id, req.user.id);
        return {
            message: 'Unit deleted successfully'
        };
    }
    constructor(unitsService){
        this.unitsService = unitsService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Create a new unit for a property'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Unit created successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('propertyId')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String,
        typeof _unitdto.CreateUnitDto === "undefined" ? Object : _unitdto.CreateUnitDto
    ]),
    _ts_metadata("design:returntype", Promise)
], UnitsController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get all units for a property'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Units retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('propertyId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], UnitsController.prototype, "findAll", null);
_ts_decorate([
    (0, _common.Get)('available'),
    (0, _swagger.ApiOperation)({
        summary: 'Get available units for a property'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Available units retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('propertyId')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], UnitsController.prototype, "getAvailable", null);
_ts_decorate([
    (0, _common.Get)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Get a specific unit'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Unit retrieved successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Unit not found'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], UnitsController.prototype, "findOne", null);
_ts_decorate([
    (0, _common.Patch)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Update a unit'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Unit updated successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Unit not found'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_param(2, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String,
        typeof _unitdto.UpdateUnitDto === "undefined" ? Object : _unitdto.UpdateUnitDto
    ]),
    _ts_metadata("design:returntype", Promise)
], UnitsController.prototype, "update", null);
_ts_decorate([
    (0, _common.Delete)(':id'),
    (0, _swagger.ApiOperation)({
        summary: 'Delete a unit'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Unit deleted successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 404,
        description: 'Unit not found'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], UnitsController.prototype, "remove", null);
UnitsController = _ts_decorate([
    (0, _swagger.ApiTags)('Units'),
    (0, _common.Controller)('properties/:propertyId/units'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)('JWT-auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _unitsservice.UnitsService === "undefined" ? Object : _unitsservice.UnitsService
    ])
], UnitsController);

//# sourceMappingURL=units.controller.js.map