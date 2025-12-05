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
    get AcceptInvitationDto () {
        return AcceptInvitationDto;
    },
    get CreateTenantInvitationDto () {
        return CreateTenantInvitationDto;
    },
    get TenantSignupWithTokenDto () {
        return TenantSignupWithTokenDto;
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
let CreateTenantInvitationDto = class CreateTenantInvitationDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Property ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "propertyId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Unit ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "unitId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tenant first name'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "firstName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tenant last name'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "lastName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tenant email address'
    }),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tenant phone number'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "phone", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Emergency contact name'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "emergencyContact", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Emergency contact phone'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "emergencyPhone", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Lease start date'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "leaseStartDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Lease end date'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "leaseEndDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Monthly rent amount'
    }),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateTenantInvitationDto.prototype, "monthlyRent", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Security deposit amount'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    _ts_metadata("design:type", Number)
], CreateTenantInvitationDto.prototype, "securityDeposit", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Additional notes'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "notes", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Landlord payout preference',
        enum: [
            'monthly',
            'yearly'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "landlordPayoutType", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Whether this is an existing tenant being transitioned'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], CreateTenantInvitationDto.prototype, "isExistingTenant", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Original expiry date for existing tenants'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateTenantInvitationDto.prototype, "originalExpiryDate", void 0);
let AcceptInvitationDto = class AcceptInvitationDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Invitation token'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], AcceptInvitationDto.prototype, "token", void 0);
let TenantSignupWithTokenDto = class TenantSignupWithTokenDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Invitation token'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], TenantSignupWithTokenDto.prototype, "token", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Password for the new account'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], TenantSignupWithTokenDto.prototype, "password", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Email address for the new account'
    }),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], TenantSignupWithTokenDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Updated phone number'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], TenantSignupWithTokenDto.prototype, "phone", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Updated emergency contact'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], TenantSignupWithTokenDto.prototype, "emergencyContact", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Updated emergency phone'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], TenantSignupWithTokenDto.prototype, "emergencyPhone", void 0);

//# sourceMappingURL=tenant-invitation.dto.js.map