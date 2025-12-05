"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "NotificationsController", {
    enumerable: true,
    get: function() {
        return NotificationsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _notificationsservice = require("./notifications.service");
const _notificationdto = require("./dto/notification.dto");
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
let NotificationsController = class NotificationsController {
    async registerToken(req, dto) {
        return this.notificationsService.registerPushToken(req.user.id, dto.token, dto.deviceInfo);
    }
    async getNotifications(req, limit, offset) {
        return this.notificationsService.getUserNotifications(req.user.id, limit ? Number(limit) : 50, offset ? Number(offset) : 0);
    }
    async getUnreadCount(req) {
        const count = await this.notificationsService.getUnreadCount(req.user.id);
        return {
            count
        };
    }
    async markAsRead(req, id) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }
    async markAllAsRead(req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }
    // Admin/System endpoints
    async sendNotification(dto) {
        return this.notificationsService.sendNotification(dto.userId, dto.title, dto.body, dto.data, dto.type);
    }
    async sendBulkNotification(dto) {
        return this.notificationsService.sendBulkNotifications(dto.userIds, dto.title, dto.body, dto.data, dto.type);
    }
    constructor(notificationsService){
        this.notificationsService = notificationsService;
    }
};
_ts_decorate([
    (0, _common.Post)('register-token'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Register or update push notification token'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Token registered successfully'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Invalid token format'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        typeof _notificationdto.RegisterPushTokenDto === "undefined" ? Object : _notificationdto.RegisterPushTokenDto
    ]),
    _ts_metadata("design:returntype", Promise)
], NotificationsController.prototype, "registerToken", null);
_ts_decorate([
    (0, _common.Get)(),
    (0, _swagger.ApiOperation)({
        summary: 'Get user notifications'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Notifications retrieved successfully'
    }),
    (0, _swagger.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number
    }),
    (0, _swagger.ApiQuery)({
        name: 'offset',
        required: false,
        type: Number
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Query)('limit')),
    _ts_param(2, (0, _common.Query)('offset')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        Number,
        Number
    ]),
    _ts_metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
_ts_decorate([
    (0, _common.Get)('unread-count'),
    (0, _swagger.ApiOperation)({
        summary: 'Get unread notification count'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Unread count retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
_ts_decorate([
    (0, _common.Patch)(':id/read'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Mark notification as read'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Notification marked as read'
    }),
    (0, _swagger.ApiResponse)({
        status: 400,
        description: 'Notification not found'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_param(1, (0, _common.Param)('id')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object,
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
_ts_decorate([
    (0, _common.Patch)('mark-all-read'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Mark all notifications as read'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'All notifications marked as read'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
_ts_decorate([
    (0, _common.Post)('send'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Send notification to a user (admin/system)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Notification sent successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _notificationdto.SendNotificationDto === "undefined" ? Object : _notificationdto.SendNotificationDto
    ]),
    _ts_metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendNotification", null);
_ts_decorate([
    (0, _common.Post)('send-bulk'),
    (0, _common.HttpCode)(_common.HttpStatus.OK),
    (0, _swagger.ApiOperation)({
        summary: 'Send notification to multiple users (admin/system)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Bulk notifications sent successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _notificationdto.SendBulkNotificationDto === "undefined" ? Object : _notificationdto.SendBulkNotificationDto
    ]),
    _ts_metadata("design:returntype", Promise)
], NotificationsController.prototype, "sendBulkNotification", null);
NotificationsController = _ts_decorate([
    (0, _swagger.ApiTags)('Notifications'),
    (0, _common.Controller)('notifications'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)('JWT-auth'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _notificationsservice.NotificationsService === "undefined" ? Object : _notificationsservice.NotificationsService
    ])
], NotificationsController);

//# sourceMappingURL=notifications.controller.js.map