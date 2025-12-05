"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "EscrowModule", {
    enumerable: true,
    get: function() {
        return EscrowModule;
    }
});
const _common = require("@nestjs/common");
const _databasemodule = require("../../database/database.module");
const _escrowservice = require("./escrow.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let EscrowModule = class EscrowModule {
};
EscrowModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _databasemodule.DatabaseModule
        ],
        providers: [
            _escrowservice.EscrowService
        ],
        exports: [
            _escrowservice.EscrowService
        ]
    })
], EscrowModule);

//# sourceMappingURL=escrow.module.js.map