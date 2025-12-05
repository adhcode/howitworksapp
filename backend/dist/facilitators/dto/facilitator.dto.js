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
    get AssignFacilitatorDto () {
        return AssignFacilitatorDto;
    },
    get CreateFacilitatorDto () {
        return CreateFacilitatorDto;
    },
    get FacilitatorResponseDto () {
        return FacilitatorResponseDto;
    },
    get FacilitatorStatsDto () {
        return FacilitatorStatsDto;
    },
    get PropertyAssignmentResponseDto () {
        return PropertyAssignmentResponseDto;
    },
    get UpdateFacilitatorStatusDto () {
        return UpdateFacilitatorStatusDto;
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
let CreateFacilitatorDto = class CreateFacilitatorDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'First name of the facilitator'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateFacilitatorDto.prototype, "firstName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Last name of the facilitator'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateFacilitatorDto.prototype, "lastName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Email address of the facilitator'
    }),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], CreateFacilitatorDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Password for the facilitator account'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(6),
    _ts_metadata("design:type", String)
], CreateFacilitatorDto.prototype, "password", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Phone number of the facilitator'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateFacilitatorDto.prototype, "phoneNumber", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Next of kin name'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateFacilitatorDto.prototype, "nextOfKinName", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Next of kin phone number'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateFacilitatorDto.prototype, "nextOfKinPhone", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        description: 'Next of kin relationship'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateFacilitatorDto.prototype, "nextOfKinRelationship", void 0);
let AssignFacilitatorDto = class AssignFacilitatorDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'ID of the facilitator to assign'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], AssignFacilitatorDto.prototype, "facilitatorId", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'ID of the property to assign facilitator to'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], AssignFacilitatorDto.prototype, "propertyId", void 0);
let UpdateFacilitatorStatusDto = class UpdateFacilitatorStatusDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Active status of the facilitator'
    }),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], UpdateFacilitatorStatusDto.prototype, "isActive", void 0);
let FacilitatorStatsDto = class FacilitatorStatsDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Number of properties assigned to facilitator'
    }),
    _ts_metadata("design:type", Number)
], FacilitatorStatsDto.prototype, "assignedProperties", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Number of pending maintenance requests'
    }),
    _ts_metadata("design:type", Number)
], FacilitatorStatsDto.prototype, "pendingMaintenanceRequests", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Number of unread messages'
    }),
    _ts_metadata("design:type", Number)
], FacilitatorStatsDto.prototype, "unreadMessages", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        description: 'Total number of tenants managed'
    }),
    _ts_metadata("design:type", Number)
], FacilitatorStatsDto.prototype, "totalTenants", void 0);
let FacilitatorResponseDto = class FacilitatorResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], FacilitatorResponseDto.prototype, "id", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], FacilitatorResponseDto.prototype, "firstName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], FacilitatorResponseDto.prototype, "lastName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], FacilitatorResponseDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], FacilitatorResponseDto.prototype, "phoneNumber", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Boolean)
], FacilitatorResponseDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", typeof Date === "undefined" ? Object : Date)
], FacilitatorResponseDto.prototype, "createdAt", void 0);
let PropertyAssignmentResponseDto = class PropertyAssignmentResponseDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Boolean)
], PropertyAssignmentResponseDto.prototype, "success", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", String)
], PropertyAssignmentResponseDto.prototype, "message", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Object)
], PropertyAssignmentResponseDto.prototype, "property", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)(),
    _ts_metadata("design:type", Object)
], PropertyAssignmentResponseDto.prototype, "facilitator", void 0);

//# sourceMappingURL=facilitator.dto.js.map