"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "TenantRentContractsModule", {
    enumerable: true,
    get: function() {
        return TenantRentContractsModule;
    }
});
const _common = require("@nestjs/common");
const _core = require("@nestjs/core");
const _tenantpaymentservice = require("./tenant-payment.service");
const _landlordpayoutservice = require("./landlord-payout.service");
const _schedulerservice = require("./scheduler.service");
const _tenantrentcontractscontroller = require("./tenant-rent-contracts.controller");
const _databasemodule = require("../database/database.module");
const _emailmodule = require("../email/email.module");
const _businessvalidationservice = require("./validators/business-validation.service");
const _rentcontractexceptionfilter = require("./exceptions/rent-contract-exception.filter");
const _rentcontractvalidationpipe = require("./pipes/rent-contract-validation.pipe");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let TenantRentContractsModule = class TenantRentContractsModule {
};
TenantRentContractsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _databasemodule.DatabaseModule,
            _emailmodule.EmailModule
        ],
        controllers: [
            _tenantrentcontractscontroller.TenantRentContractsController
        ],
        providers: [
            _tenantpaymentservice.TenantPaymentService,
            _landlordpayoutservice.LandlordPayoutService,
            _schedulerservice.SchedulerService,
            _businessvalidationservice.BusinessValidationService,
            {
                provide: _core.APP_FILTER,
                useClass: _rentcontractexceptionfilter.RentContractExceptionFilter
            },
            {
                provide: _core.APP_PIPE,
                useClass: _rentcontractvalidationpipe.RentContractValidationPipe
            }
        ],
        exports: [
            _tenantpaymentservice.TenantPaymentService,
            _landlordpayoutservice.LandlordPayoutService,
            _schedulerservice.SchedulerService,
            _businessvalidationservice.BusinessValidationService
        ]
    })
], TenantRentContractsModule);

//# sourceMappingURL=tenant-rent-contracts.module.js.map