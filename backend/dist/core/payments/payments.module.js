"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentsModule", {
    enumerable: true,
    get: function() {
        return PaymentsModule;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
const _databasemodule = require("../../database/database.module");
const _contractsmodule = require("../contracts/contracts.module");
const _escrowmodule = require("../escrow/escrow.module");
const _walletmodule = require("../wallet/wallet.module");
const _paymentprocessorservice = require("./payment-processor.service");
const _paystackservice = require("./paystack.service");
const _paymentscontroller = require("./payments.controller");
const _webhookscontroller = require("./webhooks.controller");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PaymentsModule = class PaymentsModule {
};
PaymentsModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _config.ConfigModule,
            _databasemodule.DatabaseModule,
            _contractsmodule.ContractsModule,
            _escrowmodule.EscrowModule,
            _walletmodule.WalletModule
        ],
        controllers: [
            _paymentscontroller.PaymentsController,
            _webhookscontroller.WebhooksController
        ],
        providers: [
            _paymentprocessorservice.PaymentProcessorService,
            _paystackservice.PaystackService
        ],
        exports: [
            _paymentprocessorservice.PaymentProcessorService,
            _paystackservice.PaystackService
        ]
    })
], PaymentsModule);

//# sourceMappingURL=payments.module.js.map