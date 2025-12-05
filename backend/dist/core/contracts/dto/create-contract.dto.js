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
    get ContractResponseDto () {
        return ContractResponseDto;
    },
    get CreateExistingTenantContractDto () {
        return CreateExistingTenantContractDto;
    },
    get CreateNewTenantContractDto () {
        return CreateNewTenantContractDto;
    },
    get LandlordPayoutType () {
        return LandlordPayoutType;
    },
    get UpdateContractDto () {
        return UpdateContractDto;
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
var LandlordPayoutType = /*#__PURE__*/ function(LandlordPayoutType) {
    LandlordPayoutType["MONTHLY"] = "monthly";
    LandlordPayoutType["YEARLY"] = "yearly";
    return LandlordPayoutType;
}({});
let CreateNewTenantContractDto = class CreateNewTenantContractDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tenant user ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateNewTenantContractDto.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Landlord user ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateNewTenantContractDto.prototype, "landlordId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Property ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateNewTenantContractDto.prototype, "propertyId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Unit ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateNewTenantContractDto.prototype, "unitId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Monthly rent amount',
        example: 1500.00
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateNewTenantContractDto.prototype, "monthlyAmount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Lease start date (when tenant moves in)'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateNewTenantContractDto.prototype, "leaseStartDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Lease end date (when lease expires)'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateNewTenantContractDto.prototype, "leaseEndDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'How landlord wants to receive payment',
        enum: LandlordPayoutType,
        example: "monthly"
    }),
    (0, _classvalidator.IsEnum)(LandlordPayoutType),
    _ts_metadata("design:type", String)
], CreateNewTenantContractDto.prototype, "landlordPayoutType", void 0);
let CreateExistingTenantContractDto = class CreateExistingTenantContractDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Tenant user ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateExistingTenantContractDto.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Landlord user ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateExistingTenantContractDto.prototype, "landlordId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Property ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateExistingTenantContractDto.prototype, "propertyId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Unit ID'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], CreateExistingTenantContractDto.prototype, "unitId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Monthly rent amount (NEW amount for Homezy)',
        example: 1500.00
    }),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateExistingTenantContractDto.prototype, "monthlyAmount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'When the tenant\'s CURRENT lease expires (not on Homezy)',
        example: '2025-12-31'
    }),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateExistingTenantContractDto.prototype, "currentLeaseExpiryDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'How landlord wants to receive payment',
        enum: LandlordPayoutType,
        example: "monthly"
    }),
    (0, _classvalidator.IsEnum)(LandlordPayoutType),
    _ts_metadata("design:type", String)
], CreateExistingTenantContractDto.prototype, "landlordPayoutType", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Optional: When the new Homezy lease should end. If not provided, defaults to 1 year after current lease expiry.'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], CreateExistingTenantContractDto.prototype, "newLeaseEndDate", void 0);
let UpdateContractDto = class UpdateContractDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Update monthly rent amount'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsNumber)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], UpdateContractDto.prototype, "monthlyAmount", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Update lease end date'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsDateString)(),
    _ts_metadata("design:type", String)
], UpdateContractDto.prototype, "leaseEndDate", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Update payout type'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(LandlordPayoutType),
    _ts_metadata("design:type", String)
], UpdateContractDto.prototype, "landlordPayoutType", void 0);
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
        description: 'Filter by status',
        enum: [
            'active',
            'expired',
            'terminated',
            'pending'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ContractQueryDto.prototype, "status", void 0);
let ContractResponseDto = class ContractResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], ContractResponseDto.prototype, "id", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], ContractResponseDto.prototype, "tenantId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], ContractResponseDto.prototype, "landlordId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], ContractResponseDto.prototype, "propertyId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], ContractResponseDto.prototype, "unitId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], ContractResponseDto.prototype, "monthlyAmount", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], ContractResponseDto.prototype, "leaseStartDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], ContractResponseDto.prototype, "leaseEndDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: LandlordPayoutType
    }),
    _ts_metadata("design:type", String)
], ContractResponseDto.prototype, "landlordPayoutType", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], ContractResponseDto.prototype, "nextPaymentDue", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], ContractResponseDto.prototype, "status", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Boolean)
], ContractResponseDto.prototype, "isExistingTenant", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'For existing tenants only'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], ContractResponseDto.prototype, "currentLeaseExpiry", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'For existing tenants only'
    }),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], ContractResponseDto.prototype, "transitionStartDate", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], ContractResponseDto.prototype, "createdAt", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], ContractResponseDto.prototype, "updatedAt", void 0);

//# sourceMappingURL=create-contract.dto.js.map