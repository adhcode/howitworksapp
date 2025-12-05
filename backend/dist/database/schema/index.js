// Export all tables and types
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "schema", {
    enumerable: true,
    get: function() {
        return schema;
    }
});
const _users = _export_star(require("./users"), exports);
const _properties = _export_star(require("./properties"), exports);
const _leases = _export_star(require("./leases"), exports);
const _payments = _export_star(require("./payments"), exports);
const _messages = _export_star(require("./messages"), exports);
const _tenantinvitations = _export_star(require("./tenant-invitations"), exports);
const _tenantrentcontracts = _export_star(require("./tenant-rent-contracts"), exports);
const _wallet = _export_star(require("./wallet"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
const schema = {
    users: _users.users,
    properties: _properties.properties,
    units: _properties.units,
    leases: _leases.leases,
    payments: _payments.payments,
    paymentHistory: _payments.paymentHistory,
    messages: _messages.messages,
    maintenanceRequests: _messages.maintenanceRequests,
    tenantInvitations: _tenantinvitations.tenantInvitations,
    tenantRentContracts: _tenantrentcontracts.tenantRentContracts,
    landlordEscrowBalances: _tenantrentcontracts.landlordEscrowBalances,
    paymentNotifications: _tenantrentcontracts.paymentNotifications,
    landlordWalletBalances: _wallet.landlordWalletBalances,
    walletTransactions: _wallet.walletTransactions
};

//# sourceMappingURL=index.js.map