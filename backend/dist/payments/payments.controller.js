"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PaymentsController", {
    enumerable: true,
    get: function() {
        return PaymentsController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _jwtauthguard = require("../auth/guards/jwt-auth.guard");
const _paymentsservice = require("./payments.service");
const _paystackservice = require("./paystack.service");
const _paymentdto = require("./dto/payment.dto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
let PaymentsController = class PaymentsController {
    async getMyPayments(req) {
        const payments = await this.paymentsService.getTenantPayments(req.user.id);
        return {
            success: true,
            data: payments
        };
    }
    async getLandlordPayments(req) {
        const payments = await this.paymentsService.getLandlordPayments(req.user.id);
        return {
            success: true,
            data: payments
        };
    }
    async getUpcomingPayments(req) {
        const payments = await this.paymentsService.getUpcomingPayments(req.user.id);
        return {
            success: true,
            data: payments
        };
    }
    async getOverduePayments(req) {
        const payments = await this.paymentsService.getOverduePayments(req.user.id);
        return {
            success: true,
            data: payments
        };
    }
    async processPayment(paymentId, paymentData, req) {
        const result = await this.paymentsService.processPayment(paymentId, paymentData.amount, paymentData.paymentMethod, paymentData.notes);
        return {
            success: true,
            data: result
        };
    }
    async updateOverduePayments() {
        const result = await this.paymentsService.updateOverduePayments();
        return {
            success: true,
            data: result
        };
    }
    // Paystack Integration Endpoints
    async initializePayment(initializePaymentDto, req) {
        const reference = this.paystackService.generateReference();
        const result = await this.paystackService.initializeTransaction({
            email: initializePaymentDto.email,
            amount: initializePaymentDto.amount,
            currency: initializePaymentDto.currency,
            reference: reference,
            metadata: {
                userId: req.user.id,
                userRole: req.user.role,
                description: initializePaymentDto.description,
                ...initializePaymentDto.metadata
            }
        });
        return result;
    }
    async verifyPayment(verifyPaymentDto, req) {
        const result = await this.paystackService.verifyTransaction(verifyPaymentDto.reference);
        if (result.status && result.data && result.data.status === 'success') {
            // Save payment to database
            try {
                await this.paymentsService.recordPayment({
                    tenantId: req.user.id,
                    amount: result.data.amount,
                    reference: result.data.reference,
                    paymentMethod: 'paystack',
                    status: 'paid',
                    paidAt: new Date(result.data.paid_at),
                    metadata: result.data
                });
            } catch (error) {
                console.error('Error recording payment:', error);
            }
        }
        return result;
    }
    async handleWebhook(webhookData) {
        console.log('Paystack webhook received:', webhookData.event);
        if (webhookData.event === 'charge.success' && webhookData.data) {
            const paymentData = webhookData.data;
            try {
                // Record successful payment
                if (paymentData.metadata?.userId && paymentData.reference) {
                    await this.paymentsService.recordPayment({
                        tenantId: paymentData.metadata.userId,
                        amount: paymentData.amount / 100,
                        reference: paymentData.reference,
                        paymentMethod: 'paystack',
                        status: 'paid',
                        paidAt: new Date(paymentData.paid_at),
                        metadata: paymentData
                    });
                    console.log('Payment recorded successfully:', paymentData.reference);
                } else {
                    console.error('Invalid webhook data: missing userId or reference');
                }
            } catch (error) {
                console.error('Error processing webhook:', error);
            }
        }
        return {
            status: 'success'
        };
    }
    constructor(paymentsService, paystackService){
        this.paymentsService = paymentsService;
        this.paystackService = paystackService;
    }
};
_ts_decorate([
    (0, _common.Get)('my-payments'),
    (0, _swagger.ApiOperation)({
        summary: 'Get current user payments (tenant)'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payments retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getMyPayments", null);
_ts_decorate([
    (0, _common.Get)('landlord-payments'),
    (0, _swagger.ApiOperation)({
        summary: 'Get all payments for landlord'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payments retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getLandlordPayments", null);
_ts_decorate([
    (0, _common.Get)('upcoming'),
    (0, _swagger.ApiOperation)({
        summary: 'Get upcoming payments for landlord'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Upcoming payments retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getUpcomingPayments", null);
_ts_decorate([
    (0, _common.Get)('overdue'),
    (0, _swagger.ApiOperation)({
        summary: 'Get overdue payments for landlord'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Overdue payments retrieved successfully'
    }),
    _ts_param(0, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "getOverduePayments", null);
_ts_decorate([
    (0, _common.Post)(':id/process'),
    (0, _swagger.ApiOperation)({
        summary: 'Process a payment'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment processed successfully'
    }),
    _ts_param(0, (0, _common.Param)('id')),
    _ts_param(1, (0, _common.Body)()),
    _ts_param(2, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "processPayment", null);
_ts_decorate([
    (0, _common.Post)('update-overdue'),
    (0, _swagger.ApiOperation)({
        summary: 'Update overdue payments status'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Overdue payments updated successfully'
    }),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", []),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "updateOverduePayments", null);
_ts_decorate([
    (0, _common.Post)('paystack/initialize'),
    (0, _swagger.ApiOperation)({
        summary: 'Initialize Paystack payment'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment initialized successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentdto.InitializePaymentDto === "undefined" ? Object : _paymentdto.InitializePaymentDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "initializePayment", null);
_ts_decorate([
    (0, _common.Post)('paystack/verify'),
    (0, _swagger.ApiOperation)({
        summary: 'Verify Paystack payment'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Payment verified successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_param(1, (0, _common.Request)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentdto.VerifyPaymentDto === "undefined" ? Object : _paymentdto.VerifyPaymentDto,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
_ts_decorate([
    (0, _common.Post)('paystack/webhook'),
    (0, _swagger.ApiOperation)({
        summary: 'Paystack webhook endpoint'
    }),
    (0, _swagger.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully'
    }),
    _ts_param(0, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentdto.PaymentWebhookDto === "undefined" ? Object : _paymentdto.PaymentWebhookDto
    ]),
    _ts_metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
PaymentsController = _ts_decorate([
    (0, _swagger.ApiTags)('payments'),
    (0, _common.Controller)('payments'),
    (0, _common.UseGuards)(_jwtauthguard.JwtAuthGuard),
    (0, _swagger.ApiBearerAuth)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paymentsservice.PaymentsService === "undefined" ? Object : _paymentsservice.PaymentsService,
        typeof _paystackservice.PaystackService === "undefined" ? Object : _paystackservice.PaystackService
    ])
], PaymentsController);

//# sourceMappingURL=payments.controller.js.map