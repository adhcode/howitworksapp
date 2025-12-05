"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ValidationPipe", {
    enumerable: true,
    get: function() {
        return ValidationPipe;
    }
});
const _common = require("@nestjs/common");
const _classvalidator = require("class-validator");
const _classtransformer = require("class-transformer");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ValidationPipe = class ValidationPipe {
    async transform(value, { metatype }) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = (0, _classtransformer.plainToInstance)(metatype, value);
        const errors = await (0, _classvalidator.validate)(object);
        if (errors.length > 0) {
            const errorMessages = errors.map((error)=>{
                return Object.values(error.constraints || {}).join(', ');
            });
            throw new _common.BadRequestException({
                message: 'Validation failed',
                errors: errorMessages
            });
        }
        return object;
    }
    toValidate(metatype) {
        const types = [
            String,
            Boolean,
            Number,
            Array,
            Object
        ];
        return !types.includes(metatype);
    }
};
ValidationPipe = _ts_decorate([
    (0, _common.Injectable)()
], ValidationPipe);

//# sourceMappingURL=validation.pipe.js.map