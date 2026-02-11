"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ArtisansModule", {
    enumerable: true,
    get: function() {
        return ArtisansModule;
    }
});
const _common = require("@nestjs/common");
const _artisanscontroller = require("./artisans.controller");
const _artisansservice = require("./artisans.service");
const _databasemodule = require("../database/database.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ArtisansModule = class ArtisansModule {
};
ArtisansModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _databasemodule.DatabaseModule
        ],
        controllers: [
            _artisanscontroller.ArtisansController
        ],
        providers: [
            _artisansservice.ArtisansService
        ],
        exports: [
            _artisansservice.ArtisansService
        ]
    })
], ArtisansModule);

//# sourceMappingURL=artisans.module.js.map