"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ContractNotFoundError", {
    enumerable: true,
    get: function() {
        return ContractNotFoundError;
    }
});
const _common = require("@nestjs/common");
let ContractNotFoundError = class ContractNotFoundError extends _common.HttpException {
    constructor(contractId){
        super({
            statusCode: _common.HttpStatus.NOT_FOUND,
            error: 'Contract Not Found',
            message: `Rent contract not found: ${contractId}`,
            contractId
        }, _common.HttpStatus.NOT_FOUND);
        this.name = 'ContractNotFoundError';
    }
};

//# sourceMappingURL=contract-not-found.exception.js.map