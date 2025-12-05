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
    get CreateMaintenanceRequestDto () {
        return CreateMaintenanceRequestDto;
    },
    get CreateMessageDto () {
        return CreateMessageDto;
    },
    get UpdateMessageDto () {
        return UpdateMessageDto;
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
let CreateMessageDto = class CreateMessageDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    }),
    (0, _classvalidator.IsUUID)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateMessageDto.prototype, "receiverId", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Maintenance Request'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateMessageDto.prototype, "subject", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Hello, I need help with the air conditioning unit.'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateMessageDto.prototype, "content", void 0);
let UpdateMessageDto = class UpdateMessageDto {
};
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Updated message content'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateMessageDto.prototype, "content", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'Updated subject'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], UpdateMessageDto.prototype, "subject", void 0);
let CreateMaintenanceRequestDto = class CreateMaintenanceRequestDto {
};
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'Air conditioning not working'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateMaintenanceRequestDto.prototype, "title", void 0);
_ts_decorate([
    (0, _swagger.ApiProperty)({
        example: 'The AC unit in the bedroom is not cooling properly. It makes strange noises and barely produces cold air.'
    }),
    (0, _classvalidator.IsString)(),
    (0, _classvalidator.IsNotEmpty)(),
    _ts_metadata("design:type", String)
], CreateMaintenanceRequestDto.prototype, "description", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: 'high'
    }),
    (0, _classvalidator.IsOptional)(),
    (0, _classvalidator.IsString)(),
    _ts_metadata("design:type", String)
], CreateMaintenanceRequestDto.prototype, "priority", void 0);
_ts_decorate([
    (0, _swagger.ApiPropertyOptional)({
        example: [
            'image1.jpg',
            'image2.jpg'
        ]
    }),
    (0, _classvalidator.IsOptional)(),
    _ts_metadata("design:type", Array)
], CreateMaintenanceRequestDto.prototype, "images", void 0);

//# sourceMappingURL=message.dto.js.map