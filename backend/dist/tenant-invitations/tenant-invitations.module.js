"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantInvitationsModule", {
    enumerable: true,
    get: function() {
        return TenantInvitationsModule;
    }
});
const _common = require("@nestjs/common");
const _jwt = require("@nestjs/jwt");
const _config = require("@nestjs/config");
const _tenantinvitationscontroller = require("./tenant-invitations.controller");
const _tenantinvitationsservice = require("./tenant-invitations.service");
const _usersmodule = require("../users/users.module");
const _databasemodule = require("../database/database.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let TenantInvitationsModule = class TenantInvitationsModule {
};
TenantInvitationsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _databasemodule.DatabaseModule,
            _usersmodule.UsersModule,
            _jwt.JwtModule.registerAsync({
                imports: [
                    _config.ConfigModule
                ],
                useFactory: async (configService)=>({
                        secret: configService.get('JWT_SECRET'),
                        signOptions: {
                            expiresIn: configService.get('JWT_EXPIRES_IN') || '7d'
                        }
                    }),
                inject: [
                    _config.ConfigService
                ]
            })
        ],
        controllers: [
            _tenantinvitationscontroller.TenantInvitationsController
        ],
        providers: [
            _tenantinvitationsservice.TenantInvitationsService
        ],
        exports: [
            _tenantinvitationsservice.TenantInvitationsService
        ]
    })
], TenantInvitationsModule);

//# sourceMappingURL=tenant-invitations.module.js.map