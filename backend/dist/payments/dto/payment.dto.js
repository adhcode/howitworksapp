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
    get InitializePaymentDto () {
        return InitializePaymentDto;
    },
    get PaymentWebhookDto () {
        return PaymentWebhookDto;
    },
    get VerifyPaymentDto () {
        return VerifyPaymentDto;
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
let InitializePaymentDto = class InitializePaymentDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'tenant@example.com'
    }),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], InitializePaymentDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 25000,
        description: 'Amount in Naira'
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(100),
    _ts_metadata("design:type", Number)
], InitializePaymentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'NGN'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], InitializePaymentDto.prototype, "currency", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Monthly rent payment for Unit 1A'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], InitializePaymentDto.prototype, "description", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsObject)(),
    _ts_metadata("design:type", Object)
], InitializePaymentDto.prototype, "metadata", void 0);
let VerifyPaymentDto = class VerifyPaymentDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'homezy_1640995200000_abc123'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], VerifyPaymentDto.prototype, "reference", void 0);
let PaymentWebhookDto = class PaymentWebhookDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'charge.success'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], PaymentWebhookDto.prototype, "event", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    (0, _classvalidator.IsObject)(),
    _ts_metadata("design:type", Object)
], PaymentWebhookDto.prototype, "data", void 0);

//# sourceMappingURL=payment.dto.js.map