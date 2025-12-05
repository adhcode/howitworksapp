"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RentContractValidationPipe", {
    enumerable: true,
    get: function() {
        return RentContractValidationPipe;
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
let RentContractValidationPipe = class RentContractValidationPipe {
    async transform(value, { metatype }) {
        if (!metatype || !this.toValidate(metatype)) {
            return value;
        }
        const object = (0, _classtransformer.plainToClass)(metatype, value);
        const errors = await (0, _classvalidator.validate)(object, {
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            validateCustomDecorators: true
        });
        if (errors.length > 0) {
            const errorMessages = this.formatValidationErrors(errors);
            throw new _common.BadRequestException({
                statusCode: 400,
                error: 'Validation Failed',
                message: 'Input validation failed for rent contract operation',
                details: errorMessages
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
    formatValidationErrors(errors) {
        return errors.map((error)=>({
                property: error.property,
                value: error.value,
                constraints: error.constraints,
                children: error.children?.length > 0 ? this.formatValidationErrors(error.children) : undefined
            }));
    }
};
RentContractValidationPipe = _ts_decorate([
    (0, _common.Injectable)()
], RentContractValidationPipe);

//# sourceMappingURL=rent-contract-validation.pipe.js.map