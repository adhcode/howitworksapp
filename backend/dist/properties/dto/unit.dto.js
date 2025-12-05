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
    get CreateUnitDto () {
        return CreateUnitDto;
    },
    get UpdateUnitDto () {
        return UpdateUnitDto;
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
let CreateUnitDto = class CreateUnitDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: '1A'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateUnitDto.prototype, "unitNumber", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 2
    }),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateUnitDto.prototype, "bedrooms", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 2.5
    }),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], CreateUnitDto.prototype, "bathrooms", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 1200.50
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], CreateUnitDto.prototype, "squareFootage", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 250000
    }),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsNotEmpty)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], CreateUnitDto.prototype, "rent", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 500000
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], CreateUnitDto.prototype, "deposit", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Spacious unit with great view'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateUnitDto.prototype, "description", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'unit1.jpg',
            'unit2.jpg'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    _ts_metadata("design:type", Array)
], CreateUnitDto.prototype, "images", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'Balcony',
            'Air Conditioning'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    _ts_metadata("design:type", Array)
], CreateUnitDto.prototype, "amenities", void 0);
let UpdateUnitDto = class UpdateUnitDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: '1A-Updated'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateUnitDto.prototype, "unitNumber", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 3
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    _ts_metadata("design:type", Number)
], UpdateUnitDto.prototype, "bedrooms", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 3.0
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], UpdateUnitDto.prototype, "bathrooms", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 1400.75
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], UpdateUnitDto.prototype, "squareFootage", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 300000
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], UpdateUnitDto.prototype, "rent", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 600000
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classtransformer.Type)(()=>Number),
    _ts_metadata("design:type", Number)
], UpdateUnitDto.prototype, "deposit", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Updated unit description'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateUnitDto.prototype, "description", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'unit1.jpg',
            'unit2.jpg'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    _ts_metadata("design:type", Array)
], UpdateUnitDto.prototype, "images", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'Balcony',
            'Air Conditioning'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsArray)(),
    (0, _classvalidator.IsString)({
        each: true
    }),
    _ts_metadata("design:type", Array)
], UpdateUnitDto.prototype, "amenities", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: true
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsBoolean)(),
    _ts_metadata("design:type", Boolean)
], UpdateUnitDto.prototype, "isAvailable", void 0);

//# sourceMappingURL=unit.dto.js.map