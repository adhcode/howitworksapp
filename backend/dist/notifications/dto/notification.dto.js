"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get MarkAsReadDto () {
        return MarkAsReadDto;
    },
    get NotificationType () {
        return NotificationType;
    },
    get RegisterPushTokenDto () {
        return RegisterPushTokenDto;
    },
    get SendBulkNotificationDto () {
        return SendBulkNotificationDto;
    },
    get SendNotificationDto () {
        return SendNotificationDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let RegisterPushTokenDto = class RegisterPushTokenDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Expo push token'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterPushTokenDto.prototype, "token", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Device information'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsObject)(),
    _ts_metadata("design:type", Object)
], RegisterPushTokenDto.prototype, "deviceInfo", void 0);
var NotificationType = /*#__PURE__*/ function(NotificationType) {
    NotificationType["PAYMENT"] = "payment";
    NotificationType["MAINTENANCE"] = "maintenance";
    NotificationType["MESSAGE"] = "message";
    NotificationType["TENANT_INVITATION"] = "tenant_invitation";
    NotificationType["GENERAL"] = "general";
    return NotificationType;
}({});
let SendNotificationDto = class SendNotificationDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'User ID to send notification to'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], SendNotificationDto.prototype, "userId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification title'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SendNotificationDto.prototype, "title", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification body'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SendNotificationDto.prototype, "body", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Additional data for navigation'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsObject)(),
    _ts_metadata("design:type", Object)
], SendNotificationDto.prototype, "data", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Notification type',
        enum: NotificationType
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(NotificationType),
    _ts_metadata("design:type", String)
], SendNotificationDto.prototype, "type", void 0);
let SendBulkNotificationDto = class SendBulkNotificationDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Array of user IDs'
    }),
    (0, _classvalidator.IsUUID)('4', {
        each: true
    }),
    _ts_metadata("design:type", Array)
], SendBulkNotificationDto.prototype, "userIds", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification title'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SendBulkNotificationDto.prototype, "title", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification body'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], SendBulkNotificationDto.prototype, "body", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Additional data for navigation'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsObject)(),
    _ts_metadata("design:type", Object)
], SendBulkNotificationDto.prototype, "data", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Notification type',
        enum: NotificationType
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(NotificationType),
    _ts_metadata("design:type", String)
], SendBulkNotificationDto.prototype, "type", void 0);
let MarkAsReadDto = class MarkAsReadDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], MarkAsReadDto.prototype, "notificationId", void 0);

//# sourceMappingURL=notification.dto.js.map