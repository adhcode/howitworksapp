"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SetupController", {
    enumerable: true,
    get: function() {
        return SetupController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _setupservice = require("./setup.service");
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
let SetupController = class SetupController {
    async quickSetup() {
        return this.setupService.quickSetup();
    }
    async createAccount(accountData) {
        return this.setupService.createAccount(accountData);
    }
    constructor(setupService){
        this.setupService = setupService;
    }
};
_ts_decorate([
    (0, _common.Post)('quick'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    (0, _swagger.ApiOperation)({
        summary: 'Quick setup - Create default admin and facilitator accounts',
        description: 'Creates default accounts for development. Should be disabled in production.'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Accounts created successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Accounts already exist or setup disabled'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], SetupController.prototype, "quickSetup", null);
_ts_decorate([
    (0, _common.Post)('account'),
    (0, _common.HttpCode)(_common.HttpStatus.CREATED),
    (0, _swagger.ApiOperation)({
        summary: 'Create custom admin or facilitator account',
        description: 'Creates a custom account with provided credentials'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Account created successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid data or account exists'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], SetupController.prototype, "createAccount", null);
SetupController = _ts_decorate([
    (0, _swagger.ApiTags)('Setup'),
    (0, _common.Controller)('setup'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _setupservice.SetupService === "undefined" ? Object : _setupservice.SetupService
    ])
], SetupController);

//# sourceMappingURL=setup.controller.js.map