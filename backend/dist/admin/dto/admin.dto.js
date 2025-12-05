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
    get AdminAssignFacilitatorDto () {
        return AdminAssignFacilitatorDto;
    },
    get CreateUserDto () {
        return CreateUserDto;
    },
    get UpdateUserDto () {
        return UpdateUserDto;
    }
});
const _classvalidator = require("class-validator");
const _swagger = require("@nestjs/swagger");
const _authdto = require("../../auth/dto/auth.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let CreateUserDto = class CreateUserDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'John'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Doe'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'facilitator@example.com'
    }),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'password123'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.MinLength)(6),
    _ts_metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '+2348012345678'
    }),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateUserDto.prototype, "phoneNumber", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: _authdto.UserRole,
        example: _authdto.UserRole.FACILITATOR
    }),
    (0, _classvalidator.IsEnum)(_authdto.UserRole),
    _ts_metadata("design:type", typeof _authdto.UserRole === "undefined" ? Object : _authdto.UserRole)
], CreateUserDto.prototype, "role", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Jane Doe'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateUserDto.prototype, "nextOfKinName", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '+2348087654321'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateUserDto.prototype, "nextOfKinPhone", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Sister'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateUserDto.prototype, "nextOfKinRelationship", void 0);
let UpdateUserDto = class UpdateUserDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'John'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateUserDto.prototype, "firstName", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Doe'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateUserDto.prototype, "lastName", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'user@example.com'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEmail)(),
    _ts_metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '+2348012345678'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateUserDto.prototype, "phoneNumber", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: true
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], UpdateUserDto.prototype, "isActive", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Jane Doe'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateUserDto.prototype, "nextOfKinName", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '+2348087654321'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateUserDto.prototype, "nextOfKinPhone", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Sister'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateUserDto.prototype, "nextOfKinRelationship", void 0);
let AdminAssignFacilitatorDto = class AdminAssignFacilitatorDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'uuid-string'
    }),
    (0, _classvalidator.IsUUID)(),
    _ts_metadata("design:type", String)
], AdminAssignFacilitatorDto.prototype, "facilitatorId", void 0);

//# sourceMappingURL=admin.dto.js.map