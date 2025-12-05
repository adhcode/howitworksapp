"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PropertiesModule", {
    enumerable: true,
    get: function() {
        return PropertiesModule;
    }
});
const _common = require("@nestjs/common");
const _propertiescontroller = require("./properties.controller");
const _propertiesservice = require("./properties.service");
const _unitscontroller = require("./units.controller");
const _unitsservice = require("./units.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PropertiesModule = class PropertiesModule {
};
PropertiesModule = _ts_decorate([
    (0, _common.Module)({
        controllers: [
            _propertiescontroller.PropertiesController,
            _unitscontroller.UnitsController
        ],
        providers: [
            _propertiesservice.PropertiesService,
            _unitsservice.UnitsService
        ],
        exports: [
            _propertiesservice.PropertiesService,
            _unitsservice.UnitsService
        ]
    })
], PropertiesModule);

//# sourceMappingURL=properties.module.js.map