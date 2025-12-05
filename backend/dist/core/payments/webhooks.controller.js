"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "WebhooksController", {
    enumerable: true,
    get: function() {
        return WebhooksController;
    }
});
const _common = require("@nestjs/common");
const _swagger = require("@nestjs/swagger");
const _paystackservice = require("./paystack.service");
const _paymentprocessorservice = require("./payment-processor.service");
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
let WebhooksController = class WebhooksController {
    /**
   * PAYSTACK WEBHOOK HANDLER
   * 
   * Receives and processes webhooks from Paystack.
   * MUST verify signature for security.
   */ async handlePaystackWebhook(signature, body) {
        this.logger.log('📨 Received Paystack webhook');
        // Verify webhook signature (CRITICAL for security)
        const rawBody = JSON.stringify(body);
        const isValid = this.paystackService.verifyWebhookSignature(signature, rawBody);
        if (!isValid) {
            this.logger.error('❌ Invalid webhook signature - possible fraud attempt!');
            throw new _common.HttpException('Invalid signature', _common.HttpStatus.UNAUTHORIZED);
        }
        this.logger.log('✅ Webhook signature verified');
        // Handle different event types
        const event = body.event;
        const data = body.data;
        try {
            switch(event){
                case 'charge.success':
                    this.logger.log(`💰 Payment successful: ${data.reference}`);
                    // Process payment asynchronously (don't block webhook response)
                    this.processPaymentAsync(data.reference);
                    break;
                case 'charge.failed':
                    this.logger.warn(`⚠️ Payment failed: ${data.reference}`);
                    break;
                case 'transfer.success':
                    this.logger.log(`💸 Transfer successful: ${data.reference}`);
                    break;
                case 'transfer.failed':
                case 'transfer.reversed':
                    this.logger.error(`❌ Transfer failed/reversed: ${data.reference}`);
                    break;
                default:
                    this.logger.log(`ℹ️ Unhandled event type: ${event}`);
            }
            // Return 200 OK quickly (Paystack expects fast response)
            return {
                status: 'success',
                message: 'Webhook received'
            };
        } catch (error) {
            this.logger.error(`❌ Webhook processing error: ${error.message}`);
            // Still return 200 to prevent Paystack retries
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    /**
   * PAYMENT CALLBACK (for mobile redirect)
   * 
   * GET endpoint for payment confirmation redirect from Paystack.
   * Mobile app can use this or just verify with backend directly.
   */ async paymentCallback(reference) {
        try {
            const verification = await this.paystackService.verifyTransaction(reference);
            return {
                success: verification.status && verification.data?.status === 'success',
                reference: reference,
                status: verification.data?.status,
                message: verification.data?.gateway_response || 'Payment processed'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
    /**
   * Process payment asynchronously (non-blocking)
   */ async processPaymentAsync(reference) {
        try {
            await this.paymentProcessor.completePayment(reference);
            this.logger.log(`✅ Payment processed successfully: ${reference}`);
        } catch (error) {
            this.logger.error(`❌ Failed to process payment ${reference}: ${error.message}`);
        // TODO: Queue for retry or manual review
        // Could use Bull Queue or similar for retry logic
        }
    }
    constructor(paystackService, paymentProcessor){
        this.paystackService = paystackService;
        this.paymentProcessor = paymentProcessor;
        this.logger = new _common.Logger(WebhooksController.name);
    }
};
_ts_decorate([
    (0, _common.Post)('paystack'),
    (0, _swagger.ApiExcludeEndpoint)(),
    (0, _swagger.ApiOperation)({
        summary: 'Paystack webhook handler'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Webhook processed'
    }),
    _ts_param(0, (0, _common.Headers)('x-paystack-signature')),
    _ts_param(1, (0, _common.Body)()),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String,
        Object
    ]),
    _ts_metadata("design:returntype", Promise)
], WebhooksController.prototype, "handlePaystackWebhook", null);
_ts_decorate([
    (0, _common.Get)('payment/callback'),
    (0, _swagger.ApiOperation)({
        summary: 'Payment callback redirect from Paystack'
    }),
    (0, _swagger.ApiResponse)({
        status: _common.HttpStatus.OK,
        description: 'Payment status'
    }),
    _ts_param(0, (0, _common.Param)('reference')),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        String
    ]),
    _ts_metadata("design:returntype", Promise)
], WebhooksController.prototype, "paymentCallback", null);
WebhooksController = _ts_decorate([
    (0, _swagger.ApiTags)('webhooks'),
    (0, _common.Controller)('webhooks'),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _paystackservice.PaystackService === "undefined" ? Object : _paystackservice.PaystackService,
        typeof _paymentprocessorservice.PaymentProcessorService === "undefined" ? Object : _paymentprocessorservice.PaymentProcessorService
    ])
], WebhooksController);

//# sourceMappingURL=webhooks.controller.js.map