"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "MessagesController", {
    enumerable: true,
    get: function() {
        return MessagesController;
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
let MessagesController = class MessagesController {
    async create(req, createMessageDto) {
        // Use enhanced service for facilitator routing
        return this.enhancedMessagesService.createWithFacilitatorRouting(req.user.id, createMessageDto);
    }
    async getConversations(req) {
        return this.messagesService.getConversations(req.user.id);
    }
    async getConversation(req, otherUserId, paginationDto) {
        return this.messagesService.getConversation(req.user.id, otherUserId, paginationDto);
    }
    async markAsRead(req, id) {
        return this.messagesService.markAsRead(id, req.user.id);
    }
    async getUnreadCount(req) {
        return this.messagesService.getUnreadCount(req.user.id);
    }
    // Facilitator-specific endpoints
    async getFacilitatorConversations(req) {
        return this.enhancedMessagesService.getFacilitatorConversations(req.user.id);
    }
    async getTenantPropertyFacilitator(req) {
        const facilitator = await this.enhancedMessagesService.getTenantPropertyFacilitator(req.user.id);
        return {
            success: true,
            data: facilitator
        };
    }
    constructor(messagesService, enhancedMessagesService){
        this.messagesService = messagesService;
        this.enhancedMessagesService = enhancedMessagesService;
    }
};
_ts_decorate([
    (0, _common.Post)(),
    (0, _swagger.ApiOperation)({
        summary: 'Send a message (with facilitator routing for tenants)'
    }),
    (0, _swagger.ApiResponse)({
        status: 201,
        description: 'Message sent successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        typeof _messagedto.CreateMessageDto === "undefined" ? Object : _messagedto.CreateMessageDto
    ]),
    _ts_metadata("design:returntype", Promise)
], MessagesController.prototype, "create", null);
_ts_decorate([
    (0, _common.Get)('conversations'),
    (0, _swagger.ApiOperation)({
        summary: 'Get user conversations'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Conversations retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversations", null);
_ts_decorate([
    (0, _common.Get)('conversation/:otherUserId'),
    (0, _swagger.ApiOperation)({
        summary: 'Get messages in a conversation'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Messages retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('otherUserId')),
    _ts_param(2, (0, _common.Query)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String,
        typeof _paginationdto.PaginationDto === "undefined" ? Object : _paginationdto.PaginationDto
    ]),
    _ts_metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversation", null);
_ts_decorate([
    (0, _common.Patch)(':id/read'),
    (0, _swagger.ApiOperation)({
        summary: 'Mark message as read'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Message marked as read'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], MessagesController.prototype, "markAsRead", null);
_ts_decorate([
    (0, _common.Get)('unread-count'),
    (0, _swagger.ApiOperation)({
        summary: 'Get unread message count'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Unread count retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], MessagesController.prototype, "getUnreadCount", null);
_ts_decorate([
    (0, _common.Get)('facilitator/conversations'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.FACILITATOR),
    (0, _swagger.ApiOperation)({
        summary: 'Get facilitator conversations (includes tenant-landlord conversations)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Facilitator conversations retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], MessagesController.prototype, "getFacilitatorConversations", null);
_ts_decorate([
    (0, _common.Get)('tenant/facilitator'),
    (0, _rolesdecorator.Roles)(_authdto.UserRole.TENANT),
    (0, _swagger.ApiOperation)({
        summary: 'Get tenant property facilitator contact'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Facilitator contact retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        void 0
    ]),
    _ts_metadata("design:returntype", Promise)
], MessagesController.prototype, "getTenantPropertyFacilitator", null);
MessagesController = _ts_decorate([
    (0, _swagger.ApiTags)('Messages'),
    (0, _common.Controller)('messages'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard, _rolesguard.RolesGuard),
    (0, _swagger.ApiBearerAuth)('JWT-auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _messagesservice.MessagesService === "undefined" ? Object : _messagesservice.MessagesService,
        typeof _enhancedmessagesservice.EnhancedMessagesService === "undefined" ? Object : _enhancedmessagesservice.EnhancedMessagesService
    ])
], MessagesController);

//# sourceMappingURL=messages.controller.js.map