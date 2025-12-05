"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ResponseInterceptor", {
    enumerable: true,
    get: function() {
        return ResponseInterceptor;
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
let ResponseInterceptor = class ResponseInterceptor {
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();
        return next.handle().pipe((0, _operators.tap)(()=>{
            const duration = Date.now() - startTime;
            this.logger.log(`${request.method} ${request.url} - ${context.switchToHttp().getResponse().statusCode} - ${duration}ms`);
        }), (0, _operators.map)((data)=>({
                statusCode: context.switchToHttp().getResponse().statusCode || 200,
                message: this.getSuccessMessage(request.method),
                data,
                timestamp: new Date().toISOString(),
                path: request.url
            })));
    }
    getSuccessMessage(method) {
        switch(method){
            case 'POST':
                return 'Resource created successfully';
            case 'PUT':
            case 'PATCH':
                return 'Resource updated successfully';
            case 'DELETE':
                return 'Resource deleted successfully';
            case 'GET':
            default:
                return 'Request processed successfully';
        }
    }
    constructor(){
        this.logger = new _common.Logger(ResponseInterceptor.name);
    }
};
ResponseInterceptor = _ts_decorate([
    (0, _common.Injectable)()
], ResponseInterceptor);

//# sourceMappingURL=response.interceptor.js.map