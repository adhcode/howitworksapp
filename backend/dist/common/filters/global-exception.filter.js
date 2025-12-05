"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "GlobalExceptionFilter", {
    enumerable: true,
    get: function() {
        return GlobalExceptionFilter;
    }
});
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let message;
        let error;
        if (exception instanceof _common.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = exception.name;
            } else {
                message = exceptionResponse.message || exceptionResponse;
                error = exceptionResponse.error || exception.name;
            }
        } else {
            status = _common.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'InternalServerError';
            // Log unexpected errors
            this.logger.error(`Unexpected error: ${exception}`, exception instanceof Error ? exception.stack : undefined);
        }
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error,
            message
        };
        // Log error details
        this.logger.error(`${request.method} ${request.url} - ${status} - ${JSON.stringify(message)}`);
        response.status(status).send(errorResponse);
    }
    constructor(){
        this.logger = new _common.Logger(GlobalExceptionFilter.name);
    }
};
GlobalExceptionFilter = _ts_decorate([
    (0, _common.Catch)()
], GlobalExceptionFilter);

//# sourceMappingURL=global-exception.filter.js.map