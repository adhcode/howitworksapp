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
    get ArtisanAvailability () {
        return ArtisanAvailability;
    },
    get ArtisanFiltersDto () {
        return ArtisanFiltersDto;
    },
    get ArtisanResponseDto () {
        return ArtisanResponseDto;
    },
    get ArtisanSpecialty () {
        return ArtisanSpecialty;
    },
    get ArtisanStatus () {
        return ArtisanStatus;
    },
    get RegisterArtisanDto () {
        return RegisterArtisanDto;
    },
    get UpdateArtisanStatusDto () {
        return UpdateArtisanStatusDto;
    }
});
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
var ArtisanSpecialty = /*#__PURE__*/ function(ArtisanSpecialty) {
    ArtisanSpecialty["PLUMBER"] = "Plumber";
    ArtisanSpecialty["ELECTRICIAN"] = "Electrician";
    ArtisanSpecialty["CARPENTER"] = "Carpenter";
    ArtisanSpecialty["PAINTER"] = "Painter";
    ArtisanSpecialty["MASON"] = "Mason/Bricklayer";
    ArtisanSpecialty["TILER"] = "Tiler";
    ArtisanSpecialty["WELDER"] = "Welder";
    ArtisanSpecialty["HVAC"] = "HVAC Technician";
    ArtisanSpecialty["ROOFER"] = "Roofer";
    ArtisanSpecialty["LANDSCAPER"] = "Landscaper";
    ArtisanSpecialty["HANDYMAN"] = "General Handyman";
    ArtisanSpecialty["OTHER"] = "Other";
    return ArtisanSpecialty;
}({});
var ArtisanAvailability = /*#__PURE__*/ function(ArtisanAvailability) {
    ArtisanAvailability["FULL_TIME"] = "Full-time";
    ArtisanAvailability["PART_TIME"] = "Part-time";
    ArtisanAvailability["WEEKENDS"] = "Weekends";
    ArtisanAvailability["ON_CALL"] = "On-call";
    return ArtisanAvailability;
}({});
var ArtisanStatus = /*#__PURE__*/ function(ArtisanStatus) {
    ArtisanStatus["PENDING"] = "pending";
    ArtisanStatus["APPROVED"] = "approved";
    ArtisanStatus["REJECTED"] = "rejected";
    ArtisanStatus["INACTIVE"] = "inactive";
    return ArtisanStatus;
}({});
let RegisterArtisanDto = class RegisterArtisanDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "fullName", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "phoneNumber", void 0);
_ts_decorate([
    (0, _classvalidator.IsEmail)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "email", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "address", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "city", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "state", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(ArtisanSpecialty),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "specialty", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    (0, _classvalidator.Max)(50),
    _ts_metadata("design:type", Number)
], RegisterArtisanDto.prototype, "yearsOfExperience", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "refereeName", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "refereePhone", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "additionalSkills", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(ArtisanAvailability),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "availability", void 0);
_ts_decorate([
    (0, _classvalidator.IsUUID)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], RegisterArtisanDto.prototype, "referredByFacilitatorId", void 0);
let UpdateArtisanStatusDto = class UpdateArtisanStatusDto {
};
_ts_decorate([
    (0, _classvalidator.IsEnum)(ArtisanStatus),
    _ts_metadata("design:type", String)
], UpdateArtisanStatusDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], UpdateArtisanStatusDto.prototype, "adminNotes", void 0);
let ArtisanFiltersDto = class ArtisanFiltersDto {
};
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ArtisanFiltersDto.prototype, "city", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ArtisanFiltersDto.prototype, "state", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(ArtisanSpecialty),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ArtisanFiltersDto.prototype, "specialty", void 0);
_ts_decorate([
    (0, _classvalidator.IsEnum)(ArtisanStatus),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ArtisanFiltersDto.prototype, "status", void 0);
_ts_decorate([
    (0, _classvalidator.IsUUID)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ArtisanFiltersDto.prototype, "referredByFacilitatorId", void 0);
_ts_decorate([
    (0, _classvalidator.IsInt)(),
    (0, _classvalidator.Min)(0),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Number)
], ArtisanFiltersDto.prototype, "minExperience", void 0);
_ts_decorate([
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", String)
], ArtisanFiltersDto.prototype, "search", void 0);
let ArtisanResponseDto = class ArtisanResponseDto {
};

//# sourceMappingURL=artisan.dto.js.map