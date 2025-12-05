"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LoggingInterceptor", {
    enumerable: true,
    get: function() {
        return LoggingInterceptor;
    }
});
const _common = require("@nestjs/common");
const _operators = require("rxjs/operators");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let LoggingInterceptor = class LoggingInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, headers, body } = request;
        const userAgent = headers['user-agent'] || '';
        const ip = request.ip;
        this.logger.log(`Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`);
        // Log request body for non-GET requests (excluding sensitive data)
        if (method !== 'GET' && body) {
            const sanitizedBody = this.sanitizeBody(body);
            this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
        }
        const startTime = Date.now();
        return next.handle().pipe((0, _operators.tap)({
            next: (data)=>{
                const duration = Date.now() - startTime;
                this.logger.log(`Outgoing Response: ${method} ${url} - ${duration}ms`);
            },
            error: (error)=>{
                const duration = Date.now() - startTime;
                this.logger.error(`Request Failed: ${method} ${url} - ${duration}ms - ${error.message}`);
            }
        }));
    }
    sanitizeBody(body) {
        if (!body || typeof body !== 'object') return body;
        const sensitiveFields = [
            'password',
            'token',
            'secret',
            'key',
            'auth'
        ];
        const sanitized = {
            ...body
        };
        for (const field of sensitiveFields){
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        }
        return sanitized;
    }
    constructor(){
        this.logger = new _common.Logger(LoggingInterceptor.name);
    }
};
LoggingInterceptor = _ts_decorate([
    (0, _common.Injectable)()
], LoggingInterceptor);

//# sourceMappingURL=logging.interceptor.js.map