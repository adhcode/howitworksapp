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
    get PaymentHistoryDto () {
        return PaymentHistoryDto;
    },
    get PaymentResultDto () {
        return PaymentResultDto;
    },
    get PaymentScheduleItemDto () {
        return PaymentScheduleItemDto;
    },
    get ProcessPaymentDto () {
        return ProcessPaymentDto;
    }
});
const _swagger = require("@nestjs/swagger");
const _classvalidator = require("class-validator");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let ProcessPaymentDto = class ProcessPaymentDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Contract ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], ProcessPaymentDto.prototype, "contractId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Payment amount',
        example: 1500.00
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], ProcessPaymentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Payment method',
        example: 'card'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], ProcessPaymentDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Payment reference/transaction ID'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], ProcessPaymentDto.prototype, "reference", void 0);
let PaymentResultDto = class PaymentResultDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Whether payment was successful'
    }),
    _ts_metadata("design:type", Boolean)
], PaymentResultDto.prototype, "success", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Payout type (monthly/yearly)'
    }),
    _ts_metadata("design:type", String)
], PaymentResultDto.prototype, "payoutType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Result message'
    }),
    _ts_metadata("design:type", String)
], PaymentResultDto.prototype, "message", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Next payment due date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], PaymentResultDto.prototype, "nextPaymentDue", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Transaction ID if applicable'
    }),
    _ts_metadata("design:type", String)
], PaymentResultDto.prototype, "transactionId", void 0);
let PaymentScheduleItemDto = class PaymentScheduleItemDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], PaymentScheduleItemDto.prototype, "dueDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], PaymentScheduleItemDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], PaymentScheduleItemDto.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], PaymentScheduleItemDto.prototype, "paidDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Boolean)
], PaymentScheduleItemDto.prototype, "isPastDue", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Number)
], PaymentScheduleItemDto.prototype, "daysUntilDue", void 0);
let PaymentHistoryDto = class PaymentHistoryDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], PaymentHistoryDto.prototype, "id", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], PaymentHistoryDto.prototype, "contractId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], PaymentHistoryDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], PaymentHistoryDto.prototype, "paidDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], PaymentHistoryDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)(),
    _ts_metadata("design:type", String)
], PaymentHistoryDto.prototype, "reference", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], PaymentHistoryDto.prototype, "payoutType", void 0);

//# sourceMappingURL=payment.dto.js.map