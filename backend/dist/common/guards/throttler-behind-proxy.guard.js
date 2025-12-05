"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ThrottlerBehindProxyGuard", {
    enumerable: true,
    get: function() {
        return ThrottlerBehindProxyGuard;
    }
});
const _throttler = require("@nestjs/throttler");
const _common = require("@nestjs/common");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let ThrottlerBehindProxyGuard = class ThrottlerBehindProxyGuard extends _throttler.ThrottlerGuard {
    async getTracker(req) {
        return req.ips.length ? req.ips[0] : req.ip; // individualize IP extraction to meet your own needs
    }
};
ThrottlerBehindProxyGuard = _ts_decorate([
    (0, _common.Injectable)()
], ThrottlerBehindProxyGuard);

//# sourceMappingURL=throttler-behind-proxy.guard.js.map