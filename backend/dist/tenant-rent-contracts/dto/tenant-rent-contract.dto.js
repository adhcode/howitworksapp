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
    get ContractQueryDto () {
        return ContractQueryDto;
    },
    get ContractStatus () {
        return ContractStatus;
    },
    get CreateRentContractDto () {
        return CreateRentContractDto;
    },
    get EscrowBalanceQueryDto () {
        return EscrowBalanceQueryDto;
    },
    get EscrowBalanceResponseDto () {
        return EscrowBalanceResponseDto;
    },
    get LandlordPayoutType () {
        return LandlordPayoutType;
    },
    get PaymentNotificationResponseDto () {
        return PaymentNotificationResponseDto;
    },
    get PaymentResultDto () {
        return PaymentResultDto;
    },
    get ProcessPaymentDto () {
        return ProcessPaymentDto;
    },
    get RentContractResponseDto () {
        return RentContractResponseDto;
    },
    get ScheduleNotificationDto () {
        return ScheduleNotificationDto;
    },
    get TransitionDateCalculationDto () {
        return TransitionDateCalculationDto;
    },
    get TransitionDateResponseDto () {
        return TransitionDateResponseDto;
    },
    get UpdateContractStatusDto () {
        return UpdateContractStatusDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
const _customvalidators = require("../validators/custom-validators");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
var LandlordPayoutType = /*#__PURE__*/ function(LandlordPayoutType) {
    LandlordPayoutType["MONTHLY"] = "monthly";
    LandlordPayoutType["YEARLY"] = "yearly";
    return LandlordPayoutType;
}({});
var ContractStatus = /*#__PURE__*/ function(ContractStatus) {
    ContractStatus["ACTIVE"] = "active";
    ContractStatus["EXPIRED"] = "expired";
    ContractStatus["TERMINATED"] = "terminated";
    return ContractStatus;
}({});
let CreateRentContractDto = class CreateRentContractDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tenant user ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateRentContractDto.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Landlord user ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateRentContractDto.prototype, "landlordId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Property ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateRentContractDto.prototype, "propertyId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Unit ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateRentContractDto.prototype, "unitId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Monthly rent amount',
        example: 25000
    }),
    (0, _classvalidator.IsNumber)({}, {
        message: 'Monthly amount must be a valid number'
    }),
    (0, _classvalidator.Min)(1000, {
        message: 'Monthly amount must be at least ₦1,000'
    }),
    (0, _classvalidator.Max)(10000000, {
        message: 'Monthly amount cannot exceed ₦10,000,000'
    }),
    (0, _customvalidators.IsReasonableRentAmount)(),
    _ts_metadata("design:type", Number)
], CreateRentContractDto.prototype, "monthlyAmount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Contract expiry date',
        example: '2024-12-31T23:59:59.000Z'
    }),
    (0, _classvalidator.IsDateString)({}, {
        message: 'Expiry date must be a valid ISO date string'
    }),
    (0, _customvalidators.IsFutureDate)({
        message: 'Contract expiry date must be in the future'
    }),
    (0, _customvalidators.IsValidContractDuration)(),
    (0, _customvalidators.IsAfterOriginalExpiry)(),
    _ts_metadata("design:type", String)
], CreateRentContractDto.prototype, "expiryDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: LandlordPayoutType,
        description: 'Landlord payout preference',
        example: "monthly"
    }),
    (0, _classvalidator.IsEnum)(LandlordPayoutType),
    _ts_metadata("design:type", String)
], CreateRentContractDto.prototype, "landlordPayoutType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Whether this is an existing tenant being transitioned'
    }),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], CreateRentContractDto.prototype, "isExistingTenant", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Original expiry date for existing tenants',
        example: '2024-06-30T23:59:59.000Z'
    }),
    (0, _classvalidator.ValidateIf)((o)=>o.isExistingTenant === true),
    (0, _classvalidator.IsNotEmpty)({
        message: 'Original expiry date is required for existing tenants'
    }),
    (0, _classvalidator.IsDateString)({}, {
        message: 'Original expiry date must be a valid ISO date string'
    }),
    (0, _customvalidators.IsValidOriginalExpiry)(),
    _ts_metadata("design:type", String)
], CreateRentContractDto.prototype, "originalExpiryDate", void 0);
let ProcessPaymentDto = class ProcessPaymentDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Rent contract ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], ProcessPaymentDto.prototype, "contractId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Payment amount',
        example: 25000
    }),
    (0, _classvalidator.IsNumber)({}, {
        message: 'Payment amount must be a valid number'
    }),
    (0, _classvalidator.Min)(1, {
        message: 'Payment amount must be greater than 0'
    }),
    (0, _classvalidator.Max)(10000000, {
        message: 'Payment amount cannot exceed ₦10,000,000'
    }),
    _ts_metadata("design:type", Number)
], ProcessPaymentDto.prototype, "amount", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Payment method used'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)({
        message: 'Payment method must be a string'
    }),
    (0, _classvalidator.Length)(1, 50, {
        message: 'Payment method must be between 1 and 50 characters'
    }),
    _ts_metadata("design:type", String)
], ProcessPaymentDto.prototype, "paymentMethod", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Payment reference from payment gateway'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)({
        message: 'Payment reference must be a string'
    }),
    (0, _classvalidator.Length)(1, 100, {
        message: 'Payment reference must be between 1 and 100 characters'
    }),
    _ts_metadata("design:type", String)
], ProcessPaymentDto.prototype, "reference", void 0);
let UpdateContractStatusDto = class UpdateContractStatusDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: ContractStatus,
        description: 'New contract status',
        example: "terminated"
    }),
    (0, _classvalidator.IsEnum)(ContractStatus),
    _ts_metadata("design:type", String)
], UpdateContractStatusDto.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Reason for status change'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)({
        message: 'Reason must be a string'
    }),
    (0, _classvalidator.Length)(1, 500, {
        message: 'Reason must be between 1 and 500 characters'
    }),
    _ts_metadata("design:type", String)
], UpdateContractStatusDto.prototype, "reason", void 0);
let ContractQueryDto = class ContractQueryDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Filter by tenant ID'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], ContractQueryDto.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Filter by landlord ID'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], ContractQueryDto.prototype, "landlordId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Filter by property ID'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], ContractQueryDto.prototype, "propertyId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: ContractStatus,
        description: 'Filter by contract status'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(ContractStatus),
    _ts_metadata("design:type", String)
], ContractQueryDto.prototype, "status", void 0);
let EscrowBalanceQueryDto = class EscrowBalanceQueryDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Landlord user ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], EscrowBalanceQueryDto.prototype, "landlordId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Include only unreleased balances'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], EscrowBalanceQueryDto.prototype, "unreleasedOnly", void 0);
let ScheduleNotificationDto = class ScheduleNotificationDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Rent contract ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], ScheduleNotificationDto.prototype, "contractId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification type',
        enum: [
            'reminder',
            'overdue',
            'success'
        ]
    }),
    (0, _classvalidator.IsEnum)([
        'reminder',
        'overdue',
        'success'
    ]),
    _ts_metadata("design:type", String)
], ScheduleNotificationDto.prototype, "notificationType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'When to send the notification'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], ScheduleNotificationDto.prototype, "scheduledFor", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification title'
    }),
    (0, _classvalidator.IsString)({
        message: 'Notification title must be a string'
    }),
    (0, _classvalidator.Length)(1, 100, {
        message: 'Notification title must be between 1 and 100 characters'
    }),
    _ts_metadata("design:type", String)
], ScheduleNotificationDto.prototype, "title", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification message'
    }),
    (0, _classvalidator.IsString)({
        message: 'Notification message must be a string'
    }),
    (0, _classvalidator.Length)(1, 500, {
        message: 'Notification message must be between 1 and 500 characters'
    }),
    _ts_metadata("design:type", String)
], ScheduleNotificationDto.prototype, "message", void 0);
let RentContractResponseDto = class RentContractResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Contract ID'
    }),
    _ts_metadata("design:type", String)
], RentContractResponseDto.prototype, "id", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tenant user ID'
    }),
    _ts_metadata("design:type", String)
], RentContractResponseDto.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Landlord user ID'
    }),
    _ts_metadata("design:type", String)
], RentContractResponseDto.prototype, "landlordId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Property ID'
    }),
    _ts_metadata("design:type", String)
], RentContractResponseDto.prototype, "propertyId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Unit ID'
    }),
    _ts_metadata("design:type", String)
], RentContractResponseDto.prototype, "unitId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Monthly rent amount'
    }),
    _ts_metadata("design:type", String)
], RentContractResponseDto.prototype, "monthlyAmount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Contract expiry date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], RentContractResponseDto.prototype, "expiryDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: LandlordPayoutType,
        description: 'Landlord payout preference'
    }),
    _ts_metadata("design:type", String)
], RentContractResponseDto.prototype, "landlordPayoutType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Next payment due date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], RentContractResponseDto.prototype, "nextPaymentDue", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Transition start date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], RentContractResponseDto.prototype, "transitionStartDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: ContractStatus,
        description: 'Contract status'
    }),
    _ts_metadata("design:type", String)
], RentContractResponseDto.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Whether this is an existing tenant'
    }),
    _ts_metadata("design:type", Boolean)
], RentContractResponseDto.prototype, "isExistingTenant", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Original expiry date for existing tenants',
        required: false
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], RentContractResponseDto.prototype, "originalExpiryDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Contract creation date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], RentContractResponseDto.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Contract last update date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], RentContractResponseDto.prototype, "updatedAt", void 0);
let EscrowBalanceResponseDto = class EscrowBalanceResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Escrow balance ID'
    }),
    _ts_metadata("design:type", String)
], EscrowBalanceResponseDto.prototype, "id", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Landlord user ID'
    }),
    _ts_metadata("design:type", String)
], EscrowBalanceResponseDto.prototype, "landlordId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Associated contract ID'
    }),
    _ts_metadata("design:type", String)
], EscrowBalanceResponseDto.prototype, "contractId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Total amount in escrow'
    }),
    _ts_metadata("design:type", String)
], EscrowBalanceResponseDto.prototype, "totalEscrowed", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Number of months accumulated'
    }),
    _ts_metadata("design:type", Number)
], EscrowBalanceResponseDto.prototype, "monthsAccumulated", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Expected release date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], EscrowBalanceResponseDto.prototype, "expectedReleaseDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Whether the escrow has been released'
    }),
    _ts_metadata("design:type", Boolean)
], EscrowBalanceResponseDto.prototype, "isReleased", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Release date',
        required: false
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], EscrowBalanceResponseDto.prototype, "releasedAt", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Released amount',
        required: false
    }),
    _ts_metadata("design:type", String)
], EscrowBalanceResponseDto.prototype, "releasedAmount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Escrow creation date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], EscrowBalanceResponseDto.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Escrow last update date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], EscrowBalanceResponseDto.prototype, "updatedAt", void 0);
let PaymentNotificationResponseDto = class PaymentNotificationResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification ID'
    }),
    _ts_metadata("design:type", String)
], PaymentNotificationResponseDto.prototype, "id", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Associated contract ID'
    }),
    _ts_metadata("design:type", String)
], PaymentNotificationResponseDto.prototype, "contractId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tenant user ID'
    }),
    _ts_metadata("design:type", String)
], PaymentNotificationResponseDto.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification type',
        enum: [
            'reminder',
            'overdue',
            'success'
        ]
    }),
    _ts_metadata("design:type", String)
], PaymentNotificationResponseDto.prototype, "notificationType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Scheduled send time'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], PaymentNotificationResponseDto.prototype, "scheduledFor", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Actual send time',
        required: false
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], PaymentNotificationResponseDto.prototype, "sentAt", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification title'
    }),
    _ts_metadata("design:type", String)
], PaymentNotificationResponseDto.prototype, "title", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification message'
    }),
    _ts_metadata("design:type", String)
], PaymentNotificationResponseDto.prototype, "message", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification status',
        enum: [
            'pending',
            'sent',
            'failed'
        ]
    }),
    _ts_metadata("design:type", String)
], PaymentNotificationResponseDto.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Expo receipt ID',
        required: false
    }),
    _ts_metadata("design:type", String)
], PaymentNotificationResponseDto.prototype, "expoReceiptId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Notification creation date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], PaymentNotificationResponseDto.prototype, "createdAt", void 0);
let PaymentResultDto = class PaymentResultDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Whether the payment was successful'
    }),
    _ts_metadata("design:type", Boolean)
], PaymentResultDto.prototype, "success", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: LandlordPayoutType,
        description: 'How the payment was processed'
    }),
    _ts_metadata("design:type", String)
], PaymentResultDto.prototype, "payoutType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Payment processing message'
    }),
    _ts_metadata("design:type", String)
], PaymentResultDto.prototype, "message", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Next payment due date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], PaymentResultDto.prototype, "nextPaymentDue", void 0);
let TransitionDateCalculationDto = class TransitionDateCalculationDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Contract expiry date'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], TransitionDateCalculationDto.prototype, "expiryDate", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Original expiry date for existing tenants'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], TransitionDateCalculationDto.prototype, "originalExpiryDate", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Whether this is an existing tenant'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], TransitionDateCalculationDto.prototype, "isExistingTenant", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: LandlordPayoutType,
        description: 'Landlord payout preference'
    }),
    (0, _classvalidator.IsEnum)(LandlordPayoutType),
    _ts_metadata("design:type", String)
], TransitionDateCalculationDto.prototype, "payoutType", void 0);
let TransitionDateResponseDto = class TransitionDateResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Calculated transition start date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], TransitionDateResponseDto.prototype, "transitionStartDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'First payment due date'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], TransitionDateResponseDto.prototype, "firstPaymentDue", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Months until transition'
    }),
    _ts_metadata("design:type", Number)
], TransitionDateResponseDto.prototype, "monthsUntilTransition", void 0);

//# sourceMappingURL=tenant-rent-contract.dto.js.map