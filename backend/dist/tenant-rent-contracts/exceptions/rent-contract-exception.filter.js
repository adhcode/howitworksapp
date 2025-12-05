"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "RentContractExceptionFilter", {
    enumerable: true,
    get: function() {
        return RentContractExceptionFilter;
    }
});
const _common = require("@nestjs/common");
const _contractnotfoundexception = require("./contract-not-found.exception");
const _invalidtransitiondateexception = require("./invalid-transition-date.exception");
const _escrowreleaseexception = require("./escrow-release.exception");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let RentContractExceptionFilter = class RentContractExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = _common.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method
        };
        // Handle specific rent contract exceptions
        if (exception instanceof _contractnotfoundexception.ContractNotFoundError) {
            status = _common.HttpStatus.NOT_FOUND;
            errorResponse = {
                ...errorResponse,
                statusCode: status,
                error: 'Contract Not Found',
                message: exception.message,
                contractId: exception.getResponse()['contractId']
            };
        } else if (exception instanceof _invalidtransitiondateexception.InvalidTransitionDateError) {
            status = _common.HttpStatus.BAD_REQUEST;
            errorResponse = {
                ...errorResponse,
                statusCode: status,
                error: 'Invalid Transition Date',
                message: exception.message,
                details: exception.getResponse()['details']
            };
        } else if (exception instanceof _escrowreleaseexception.EscrowReleaseError) {
            status = _common.HttpStatus.INTERNAL_SERVER_ERROR;
            errorResponse = {
                ...errorResponse,
                statusCode: status,
                error: 'Escrow Release Failed',
                message: exception.message,
                escrowId: exception.getResponse()['escrowId'],
                details: exception.getResponse()['details']
            };
        } else if (exception instanceof _common.HttpException) {
            // Handle other HTTP exceptions
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            errorResponse = {
                ...errorResponse,
                statusCode: status,
                error: typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse['error'],
                message: typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse['message']
            };
        } else {
            // Handle unexpected errors
            errorResponse = {
                ...errorResponse,
                error: 'Internal Server Error',
                message: 'An unexpected error occurred while processing the rent contract request'
            };
            // Log the full error for debugging
            this.logger.error(`Unexpected error in rent contract operation: ${exception.message}`, exception.stack);
        }
        // Log the error with context
        this.logger.error(`Rent Contract Error - ${request.method} ${request.url} - Status: ${status} - ${errorResponse.message}`, {
            exception: exception.name,
            statusCode: status,
            path: request.url,
            method: request.method,
            timestamp: errorResponse.timestamp
        });
        response.status(status).json(errorResponse);
    }
    constructor(){
        this.logger = new _common.Logger(RentContractExceptionFilter.name);
    }
};
RentContractExceptionFilter = _ts_decorate([
    (0, _common.Catch)()
], RentContractExceptionFilter);

//# sourceMappingURL=rent-contract-exception.filter.js.map