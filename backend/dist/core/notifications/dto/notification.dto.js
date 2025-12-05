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
    get NotificationDto () {
        return NotificationDto;
    },
    get NotificationStatus () {
        return NotificationStatus;
    },
    get NotificationType () {
        return NotificationType;
    }
});
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
var NotificationType = /*#__PURE__*/ function(NotificationType) {
    NotificationType["PAYMENT_REMINDER"] = "reminder";
    NotificationType["PAYMENT_OVERDUE"] = "overdue";
    NotificationType["PAYMENT_SUCCESS"] = "success";
    NotificationType["ESCROW_RELEASE"] = "escrow_release";
    NotificationType["CONTRACT_EXPIRING"] = "contract_expiring";
    return NotificationType;
}({});
var NotificationStatus = /*#__PURE__*/ function(NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["FAILED"] = "failed";
    return NotificationStatus;
}({});
let NotificationDto = class NotificationDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], NotificationDto.prototype, "id", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], NotificationDto.prototype, "contractId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], NotificationDto.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: NotificationType
    }),
    _ts_metadata("design:type", String)
], NotificationDto.prototype, "notificationType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], NotificationDto.prototype, "scheduledFor", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], NotificationDto.prototype, "title", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], NotificationDto.prototype, "message", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: NotificationStatus
    }),
    _ts_metadata("design:type", String)
], NotificationDto.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        required: false
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], NotificationDto.prototype, "sentAt", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], NotificationDto.prototype, "createdAt", void 0);

//# sourceMappingURL=notification.dto.js.map