"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantsModule", {
    enumerable: true,
    get: function() {
        return TenantsModule;
    }
});
const _common = require("@nestjs/common");
const _tenantscontroller = require("./tenants.controller");
const _tenantsservice = require("./tenants.service");
const _databasemodule = require("../database/database.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let TenantsModule = class TenantsModule {
};
TenantsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _databasemodule.DatabaseModule
        ],
        controllers: [
            _tenantscontroller.TenantsController
        ],
        providers: [
            _tenantsservice.TenantsService
        ],
        exports: [
            _tenantsservice.TenantsService
        ]
    })
], TenantsModule);

//# sourceMappingURL=tenants.module.js.map