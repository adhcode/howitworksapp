"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaystackService", {
    enumerable: true,
    get: function() {
        return PaystackService;
    }
});
const _common = require("@nestjs/common");
const _config = require("@nestjs/config");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);
let PaystackService = class PaystackService {
    async initializeTransaction(data) {
        try {
            const response = await this.paystack.transaction.initialize({
                email: data.email,
                amount: Math.round(data.amount * 100),
                currency: data.currency || 'NGN',
                reference: data.reference,
                callback_url: data.callback_url,
                metadata: data.metadata
            });
            return {
                status: true,
                data: {
                    authorization_url: response.data.authorization_url,
                    access_code: response.data.access_code,
                    reference: response.data.reference
                }
            };
        } catch (error) {
            console.error('Paystack initialization error:', error);
            return {
                status: false,
                message: error.message || 'Failed to initialize payment'
            };
        }
    }
    async verifyTransaction(reference) {
        try {
            const response = await this.paystack.transaction.verify(reference);
            return {
                status: response.status,
                data: {
                    id: response.data.id,
                    domain: response.data.domain,
                    status: response.data.status,
                    reference: response.data.reference,
                    amount: response.data.amount / 100,
                    gateway_response: response.data.gateway_response,
                    paid_at: response.data.paid_at,
                    created_at: response.data.created_at,
                    channel: response.data.channel,
                    currency: response.data.currency,
                    customer: response.data.customer,
                    metadata: response.data.metadata
                }
            };
        } catch (error) {
            console.error('Paystack verification error:', error);
            return {
                status: false,
                message: error.message || 'Failed to verify payment'
            };
        }
    }
    async createCustomer(data) {
        try {
            const response = await this.paystack.customer.create({
                email: data.email,
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone,
                metadata: data.metadata
            });
            return {
                status: true,
                data: {
                    id: response.data.id,
                    customer_code: response.data.customer_code,
                    email: response.data.email
                }
            };
        } catch (error) {
            console.error('Paystack customer creation error:', error);
            return {
                status: false,
                message: error.message || 'Failed to create customer'
            };
        }
    }
    async listTransactions(params) {
        try {
            const response = await this.paystack.transaction.list(params);
            return {
                status: true,
                data: response.data.map((transaction)=>({
                        id: transaction.id,
                        reference: transaction.reference,
                        amount: transaction.amount / 100,
                        status: transaction.status,
                        gateway_response: transaction.gateway_response,
                        paid_at: transaction.paid_at,
                        created_at: transaction.created_at,
                        customer: transaction.customer,
                        metadata: transaction.metadata
                    })),
                meta: response.meta
            };
        } catch (error) {
            console.error('Paystack list transactions error:', error);
            return {
                status: false,
                message: error.message || 'Failed to fetch transactions'
            };
        }
    }
    generateReference() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        return `homezy_${timestamp}_${random}`;
    }
    constructor(configService){
        this.configService = configService;
        const secretKey = this.configService.get('PAYSTACK_SECRET_KEY');
        if (secretKey) {
            this.paystack = require('paystack')(secretKey);
        }
    }
};
PaystackService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _config.ConfigService === "undefined" ? Object : _config.ConfigService
    ])
], PaystackService);

//# sourceMappingURL=paystack.service.js.map