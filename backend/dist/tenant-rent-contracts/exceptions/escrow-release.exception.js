"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EscrowReleaseError", {
    enumerable: true,
    get: function() {
        return EscrowReleaseError;
    }
});
const _common = require("@nestjs/common");
let EscrowReleaseError = class EscrowReleaseError extends _common.HttpException {
    constructor(message, escrowId, details){
        super({
            statusCode: _common.HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Escrow Release Failed',
            message: `Escrow release failed: ${message}`,
            escrowId,
            details
        }, _common.HttpStatus.INTERNAL_SERVER_ERROR);
        this.name = 'EscrowReleaseError';
    }
};

//# sourceMappingURL=escrow-release.exception.js.map