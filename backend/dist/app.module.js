"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppModule", {
    enumerable: true,
    get: function() {
        return AppModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _throttler = require("@nestjs/throttler");
const _schedule = require("@nestjs/schedule");
const _appcontroller = require("./app.controller");
const _appservice = require("./app.service");
const _databasemodule = require("./database/database.module");
const _authmodule = require("./auth/auth.module");
const _usersmodule = require("./users/users.module");
const _emailmodule = require("./email/email.module");
const _propertiesmodule = require("./properties/properties.module");
const _tenantinvitationsmodule = require("./tenant-invitations/tenant-invitations.module");
const _tenantsmodule = require("./tenants/tenants.module");
const _landlordmodule = require("./landlord/landlord.module");
const _messagesmodule = require("./messages/messages.module");
const _uploadmodule = require("./upload/upload.module");
const _adminmodule = require("./admin/admin.module");
const _facilitatorsmodule = require("./facilitators/facilitators.module");
const _setupmodule = require("./setup/setup.module");
const _artisansmodule = require("./artisans/artisans.module");
const _contractsmodule = require("./core/contracts/contracts.module");
const _paymentsmodule = require("./core/payments/payments.module");
const _escrowmodule = require("./core/escrow/escrow.module");
const _notificationsmodule = require("./core/notifications/notifications.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let AppModule = class AppModule {
};
AppModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _config.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
                cache: true
            }),
            _schedule.ScheduleModule.forRoot(),
            _throttler.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 3
                },
                {
                    name: 'medium',
                    ttl: 10000,
                    limit: 20
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100
                }
            ]),
            _databasemodule.DatabaseModule,
            _authmodule.AuthModule,
            _usersmodule.UsersModule,
            _emailmodule.EmailModule,
            _propertiesmodule.PropertiesModule,
            _tenantinvitationsmodule.TenantInvitationsModule,
            _tenantsmodule.TenantsModule,
            _landlordmodule.LandlordModule,
            _messagesmodule.MessagesModule,
            _uploadmodule.UploadModule,
            _adminmodule.AdminModule,
            _facilitatorsmodule.FacilitatorsModule,
            _setupmodule.SetupModule,
            _artisansmodule.ArtisansModule,
            // NEW CORE MODULES (Clean Architecture)
            _contractsmodule.ContractsModule,
            _paymentsmodule.PaymentsModule,
            _escrowmodule.EscrowModule,
            _notificationsmodule.NotificationsModule
        ],
        controllers: [
            _appcontroller.AppController
        ],
        providers: [
            _appservice.AppService
        ]
    })
], AppModule);

//# sourceMappingURL=app.module.js.map