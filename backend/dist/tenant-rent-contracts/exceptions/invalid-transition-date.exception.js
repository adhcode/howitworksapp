"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "InvalidTransitionDateError", {
    enumerable: true,
    get: function() {
        return InvalidTransitionDateError;
    }
});
const _common = require("@nestjs/common");
let InvalidTransitionDateError = class InvalidTransitionDateError extends _common.HttpException {
    constructor(message, details){
        super({
            statusCode: _common.HttpStatus.BAD_REQUEST,
            error: 'Invalid Transition Date',
            message: `Invalid transition date: ${message}`,
            details
        }, _common.HttpStatus.BAD_REQUEST);
        this.name = 'InvalidTransitionDateError';
    }
};

//# sourceMappingURL=invalid-transition-date.exception.js.map