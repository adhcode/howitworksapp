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
    get CreatePropertyDto () {
        return CreatePropertyDto;
    },
    get PropertyStatus () {
        return PropertyStatus;
    },
    get PropertyType () {
        return PropertyType;
    },
    get UpdatePropertyDto () {
        return UpdatePropertyDto;
    }
});
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
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
var PropertyType = /*#__PURE__*/ function(PropertyType) {
    PropertyType["APARTMENT"] = "apartment";
    PropertyType["HOUSE"] = "house";
    PropertyType["CONDO"] = "condo";
    PropertyType["STUDIO"] = "studio";
    PropertyType["DUPLEX"] = "duplex";
    return PropertyType;
}({});
var PropertyStatus = /*#__PURE__*/ function(PropertyStatus) {
    PropertyStatus["ACTIVE"] = "active";
    PropertyStatus["INACTIVE"] = "inactive";
    PropertyStatus["MAINTENANCE"] = "maintenance";
    return PropertyStatus;
}({});
let CreatePropertyDto = class CreatePropertyDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Harmony Apartments'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreatePropertyDto.prototype, "name", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '5B, Ikoyi Crescent'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreatePropertyDto.prototype, "address", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Lagos'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreatePropertyDto.prototype, "city", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Lagos State'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreatePropertyDto.prototype, "state", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '100001'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePropertyDto.prototype, "zipCode", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Nigeria'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreatePropertyDto.prototype, "country", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        enum: PropertyType,
        example: "apartment"
    }),
    (0, _classvalidator.IsEnum)(PropertyType),
    _ts_metadata("design:type", String)
], CreatePropertyDto.prototype, "propertyType", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Modern apartment complex with great amenities'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreatePropertyDto.prototype, "description", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 6
    }),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], CreatePropertyDto.prototype, "totalUnits", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'image1.jpg',
            'image2.jpg'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    _ts_metadata("design:type", Array)
], CreatePropertyDto.prototype, "images", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'Swimming Pool',
            'Gym',
            'Parking'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    _ts_metadata("design:type", Array)
], CreatePropertyDto.prototype, "amenities", void 0);
let UpdatePropertyDto = class UpdatePropertyDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Harmony Apartments Updated'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdatePropertyDto.prototype, "name", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '5B, Ikoyi Crescent, Updated'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdatePropertyDto.prototype, "address", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Lagos'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdatePropertyDto.prototype, "city", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Lagos State'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdatePropertyDto.prototype, "state", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '100001'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdatePropertyDto.prototype, "zipCode", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Nigeria'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdatePropertyDto.prototype, "country", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: PropertyType
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(PropertyType),
    _ts_metadata("design:type", String)
], UpdatePropertyDto.prototype, "propertyType", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Updated description'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdatePropertyDto.prototype, "description", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 8
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(1),
    _ts_metadata("design:type", Number)
], UpdatePropertyDto.prototype, "totalUnits", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'image1.jpg',
            'image2.jpg'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    _ts_metadata("design:type", Array)
], UpdatePropertyDto.prototype, "images", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'Swimming Pool',
            'Gym',
            'Parking'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    _ts_metadata("design:type", Array)
], UpdatePropertyDto.prototype, "amenities", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        enum: PropertyStatus
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsEnum)(PropertyStatus),
    _ts_metadata("design:type", String)
], UpdatePropertyDto.prototype, "status", void 0);

//# sourceMappingURL=property.dto.js.map