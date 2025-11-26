import {
  Controller,
  Post,
  Body,
  Headers,
  HttpStatus,
  HttpException,
  Logger,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiExcludeEndpoint, ApiParam } from '@nestjs/swagger';
import { PaystackService } from './paystack.service';
import { PaymentProcessorService } from './payment-processor.service';

/**
 * WEBHOOKS CONTROLLER
 * 
 * Handles Paystack webhooks for:
 * 1. Payment confirmations (charge.success)
 * 2. Payment failures (charge.failed)
 * 3. Transfer completions (transfer.success)
 * 4. Transfer failures (transfer.failed)
 */
@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly paystackService: PaystackService,
    private readonly paymentProcessor: PaymentProcessorService,
  ) {}

  /**
   * PAYSTACK WEBHOOK HANDLER
   * 
   * Receives and processes webhooks from Paystack.
   * MUST verify signature for security.
   */
  @Post('paystack')
  @ApiExcludeEndpoint() // Hide from Swagger (internal endpoint)
  @ApiOperation({ summary: 'Paystack webhook handler' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Webhook processed' })
  async handlePaystackWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() body: any,
  ) {
    this.logger.log('📨 Received Paystack webhook');

    // Verify webhook signature (CRITICAL for security)
    const rawBody = JSON.stringify(body);
    const isValid = this.paystackService.verifyWebhookSignature(signature, rawBody);

    if (!isValid) {
      this.logger.error('❌ Invalid webhook signature - possible fraud attempt!');
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    this.logger.log('✅ Webhook signature verified');

    // Handle different event types
    const event = body.event;
    const data = body.data;

    try {
      switch (event) {
        case 'charge.success':
          this.logger.log(`💰 Payment successful: ${data.reference}`);
          
          // Process payment asynchronously (don't block webhook response)
          this.processPaymentAsync(data.reference);
          
          break;

        case 'charge.failed':
          this.logger.warn(`⚠️ Payment failed: ${data.reference}`);
          // TODO: Update payment record, notify tenant
          break;

        case 'transfer.success':
          this.logger.log(`💸 Transfer successful: ${data.reference}`);
          // TODO: Update landlord payout record
          break;

        case 'transfer.failed':
        case 'transfer.reversed':
          this.logger.error(`❌ Transfer failed/reversed: ${data.reference}`);
          // TODO: Update landlord payout record, notify admin
          break;

        default:
          this.logger.log(`ℹ️ Unhandled event type: ${event}`);
      }

      // Return 200 OK quickly (Paystack expects fast response)
      return { status: 'success', message: 'Webhook received' };
    } catch (error) {
      this.logger.error(`❌ Webhook processing error: ${error.message}`);
      // Still return 200 to prevent Paystack retries
      return { status: 'error', message: error.message };
    }
  }

  /**
   * PAYMENT CALLBACK (for mobile redirect)
   * 
   * GET endpoint for payment confirmation redirect from Paystack.
   * Mobile app can use this or just verify with backend directly.
   */
  @Get('payment/callback')
  @ApiOperation({ summary: 'Payment callback redirect from Paystack' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment status' })
  async paymentCallback(
    @Param('reference') reference: string,
  ) {
    try {
      const verification = await this.paystackService.verifyTransaction(reference);
      
      return {
        success: verification.status && verification.data?.status === 'success',
        reference: reference,
        status: verification.data?.status,
        message: verification.data?.gateway_response || 'Payment processed',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Process payment asynchronously (non-blocking)
   */
  private async processPaymentAsync(reference: string) {
    try {
      await this.paymentProcessor.completePayment(reference);
      this.logger.log(`✅ Payment processed successfully: ${reference}`);
    } catch (error) {
      this.logger.error(`❌ Failed to process payment ${reference}: ${error.message}`);
      // TODO: Queue for retry or manual review
      // Could use Bull Queue or similar for retry logic
    }
  }
}



