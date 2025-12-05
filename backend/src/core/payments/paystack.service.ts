import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

/**
 * PAYSTACK SERVICE
 * 
 * Complete Paystack integration for:
 * 1. Tenant payments (one-time & recurring)
 * 2. Landlord cashouts/transfers
 * 3. Card management for recurring payments
 * 4. Webhook verification
 */
@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = 'https://api.paystack.co';
  private readonly axiosInstance: AxiosInstance;
  private readonly secretKey: string | undefined;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    
    if (!this.secretKey) {
      this.logger.warn('⚠️ PAYSTACK_SECRET_KEY not configured');
    }

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  // ==========================================
  // TENANT PAYMENT METHODS
  // ==========================================

  /**
   * Initialize one-time payment
   */
  async initializeTransaction(data: {
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    callback_url?: string;
    metadata?: any;
  }): Promise<{
    status: boolean;
    message?: string;
    data?: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }> {
    try {
      this.logger.log(`💳 Initializing payment: ${data.email} - ₦${data.amount}`);
      
      const amountInKobo = Math.round(data.amount * 100);
      this.logger.log(`💰 Sending to Paystack: ${amountInKobo} kobo (₦${data.amount})`);

      const payload = {
        email: data.email,
        amount: amountInKobo, // Convert to kobo
        currency: data.currency || 'NGN',
        reference: data.reference || this.generateReference(),
        callback_url: data.callback_url || this.configService.get('PAYSTACK_CALLBACK_URL'),
        metadata: data.metadata,
      };

      this.logger.log(`📤 Payload to Paystack: ${JSON.stringify(payload)}`);

      const response = await this.axiosInstance.post('/transaction/initialize', payload);

      this.logger.log(`✅ Payment initialized: ${response.data.data.reference}`);
      this.logger.log(`📥 Paystack response amount: ${response.data.data.amount}`);

      return {
        status: true,
        data: {
          authorization_url: response.data.data.authorization_url,
          access_code: response.data.data.access_code,
          reference: response.data.data.reference,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Payment initialization failed: ${error.message}`);
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Verify transaction status
   */
  async verifyTransaction(reference: string): Promise<{
    status: boolean;
    message?: string;
    data?: {
      id: number;
      status: string;
      reference: string;
      amount: number;
      gateway_response: string;
      paid_at: string;
      created_at: string;
      channel: string;
      currency: string;
      customer: any;
      authorization: any;
      metadata: any;
    };
  }> {
    try {
      this.logger.log(`🔍 Verifying transaction: ${reference}`);

      const response = await this.axiosInstance.get(`/transaction/verify/${reference}`);
      const data = response.data.data;

      this.logger.log(`✅ Transaction verified: ${reference} - ${data.status}`);

      return {
        status: true,
        data: {
          id: data.id,
          status: data.status,
          reference: data.reference,
          amount: data.amount / 100, // Convert from kobo
          gateway_response: data.gateway_response,
          paid_at: data.paid_at,
          created_at: data.created_at,
          channel: data.channel,
          currency: data.currency,
          customer: data.customer,
          authorization: data.authorization, // Card details for recurring
          metadata: data.metadata,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Verification failed: ${error.message}`);
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  // ==========================================
  // RECURRING PAYMENT METHODS (SAVED CARDS)
  // ==========================================

  /**
   * Charge saved card (for recurring payments)
   */
  async chargeAuthorization(data: {
    email: string;
    amount: number;
    authorization_code: string;
    reference?: string;
    metadata?: any;
  }): Promise<{
    status: boolean;
    message?: string;
    data?: {
      reference: string;
      status: string;
      amount: number;
    };
  }> {
    try {
      this.logger.log(`💳 Charging saved card: ${data.email} - ₦${data.amount}`);

      const response = await this.axiosInstance.post('/transaction/charge_authorization', {
        email: data.email,
        amount: Math.round(data.amount * 100),
        authorization_code: data.authorization_code,
        reference: data.reference || this.generateReference(),
        metadata: data.metadata,
      });

      this.logger.log(`✅ Card charged: ${response.data.data.reference}`);

      return {
        status: true,
        data: {
          reference: response.data.data.reference,
          status: response.data.data.status,
          amount: response.data.data.amount / 100,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Card charge failed: ${error.message}`);
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Check if authorization is reusable
   */
  async checkAuthorization(data: {
    email: string;
    authorization_code: string;
    amount: number;
  }): Promise<{
    status: boolean;
    message?: string;
    data?: {
      reusable: boolean;
      account_name: string;
      bank: string;
    };
  }> {
    try {
      const response = await this.axiosInstance.post('/transaction/check_authorization', {
        email: data.email,
        authorization_code: data.authorization_code,
        amount: Math.round(data.amount * 100),
      });

      return {
        status: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  // ==========================================
  // LANDLORD PAYOUT/TRANSFER METHODS
  // ==========================================

  /**
   * Create transfer recipient (landlord bank account)
   */
  async createTransferRecipient(data: {
    type: 'nuban' | 'mobile_money' | 'basa';
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
    metadata?: any;
  }): Promise<{
    status: boolean;
    message?: string;
    data?: {
      recipient_code: string;
      type: string;
      name: string;
      details: any;
    };
  }> {
    try {
      this.logger.log(`🏦 Creating transfer recipient: ${data.name}`);

      const response = await this.axiosInstance.post('/transferrecipient', {
        type: data.type,
        name: data.name,
        account_number: data.account_number,
        bank_code: data.bank_code,
        currency: data.currency || 'NGN',
        metadata: data.metadata,
      });

      this.logger.log(`✅ Recipient created: ${response.data.data.recipient_code}`);

      return {
        status: true,
        data: {
          recipient_code: response.data.data.recipient_code,
          type: response.data.data.type,
          name: response.data.data.name,
          details: response.data.data.details,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Recipient creation failed: ${error.message}`);
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Initiate transfer to landlord
   */
  async initiateTransfer(data: {
    amount: number;
    recipient: string; // recipient_code
    reason?: string;
    reference?: string;
    currency?: string;
    metadata?: any;
  }): Promise<{
    status: boolean;
    message?: string;
    data?: {
      transfer_code: string;
      reference: string;
      amount: number;
      status: string;
    };
  }> {
    try {
      this.logger.log(`💸 Initiating transfer: ₦${data.amount} to ${data.recipient}`);

      const response = await this.axiosInstance.post('/transfer', {
        source: 'balance',
        amount: Math.round(data.amount * 100),
        recipient: data.recipient,
        reason: data.reason || 'Rent payout',
        reference: data.reference || this.generateReference('transfer'),
        currency: data.currency || 'NGN',
        metadata: data.metadata,
      });

      this.logger.log(`✅ Transfer initiated: ${response.data.data.transfer_code}`);

      return {
        status: true,
        data: {
          transfer_code: response.data.data.transfer_code,
          reference: response.data.data.reference,
          amount: response.data.data.amount / 100,
          status: response.data.data.status,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Transfer failed: ${error.message}`);
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Verify transfer status
   */
  async verifyTransfer(reference: string): Promise<{
    status: boolean;
    message?: string;
    data?: {
      reference: string;
      status: string;
      amount: number;
      recipient: any;
    };
  }> {
    try {
      const response = await this.axiosInstance.get(`/transfer/verify/${reference}`);
      const data = response.data.data;

      return {
        status: true,
        data: {
          reference: data.reference,
          status: data.status,
          amount: data.amount / 100,
          recipient: data.recipient,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Finalize transfer (for OTP-enabled transfers)
   */
  async finalizeTransfer(data: {
    transfer_code: string;
    otp: string;
  }): Promise<{
    status: boolean;
    message?: string;
  }> {
    try {
      await this.axiosInstance.post('/transfer/finalize_transfer', {
        transfer_code: data.transfer_code,
        otp: data.otp,
      });

      return { status: true };
    } catch (error) {
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  // ==========================================
  // BANK & CUSTOMER METHODS
  // ==========================================

  /**
   * Get list of banks
   */
  async listBanks(country: string = 'nigeria'): Promise<{
    status: boolean;
    data?: Array<{
      id: number;
      name: string;
      code: string;
      active: boolean;
    }>;
    message?: string;
  }> {
    try {
      this.logger.log(`🏦 Fetching banks list from Paystack (country: ${country})`);
      
      const response = await this.axiosInstance.get('/bank', {
        params: { country, perPage: 100 },
      });

      this.logger.log(`✅ Paystack returned ${response.data.data?.length || 0} banks`);

      return {
        status: true,
        data: response.data.data,
      };
    } catch (error: any) {
      this.logger.error(`❌ Paystack banks API error: ${error.message}`);
      if (error.response) {
        this.logger.error(`   Status: ${error.response.status}`);
        this.logger.error(`   Data: ${JSON.stringify(error.response.data)}`);
      }
      return { 
        status: false,
        message: error.message || 'Failed to fetch banks from Paystack'
      };
    }
  }

  /**
   * Resolve account number to get account name
   */
  async resolveAccountNumber(data: {
    account_number: string;
    bank_code: string;
  }): Promise<{
    status: boolean;
    message?: string;
    data?: {
      account_number: string;
      account_name: string;
      bank_id: number;
    };
  }> {
    try {
      this.logger.log(`🔍 Resolving account: ${data.account_number} at bank: ${data.bank_code}`);
      
      const response = await this.axiosInstance.get('/bank/resolve', {
        params: {
          account_number: data.account_number,
          bank_code: data.bank_code,
        },
      });

      this.logger.log(`✅ Account resolved: ${response.data.data?.account_name}`);

      return {
        status: true,
        data: response.data.data,
      };
    } catch (error: any) {
      this.logger.error(`❌ Account resolution error: ${error.message}`);
      if (error.response) {
        this.logger.error(`   Status: ${error.response.status}`);
        this.logger.error(`   Data: ${JSON.stringify(error.response.data)}`);
      }
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Create Paystack customer
   */
  async createCustomer(data: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    metadata?: any;
  }): Promise<{
    status: boolean;
    message?: string;
    data?: {
      customer_code: string;
      email: string;
      id: number;
    };
  }> {
    try {
      const response = await this.axiosInstance.post('/customer', data);

      return {
        status: true,
        data: {
          customer_code: response.data.data.customer_code,
          email: response.data.data.email,
          id: response.data.data.id,
        },
      };
    } catch (error) {
      return {
        status: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  // ==========================================
  // WEBHOOK & UTILITY METHODS
  // ==========================================

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(signature: string, body: string): boolean {
    const crypto = require('crypto');
    const webhookSecret = this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      this.logger.error('❌ PAYSTACK_WEBHOOK_SECRET not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(body)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Generate unique reference
   */
  generateReference(prefix: string = 'rent'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `homezy_${prefix}_${timestamp}_${random}`;
  }

  /**
   * Get balance
   */
  async getBalance(): Promise<{
    status: boolean;
    data?: Array<{
      currency: string;
      balance: number;
    }>;
  }> {
    try {
      const response = await this.axiosInstance.get('/balance');
      
      return {
        status: true,
        data: response.data.data.map((item: any) => ({
          currency: item.currency,
          balance: item.balance / 100,
        })),
      };
    } catch (error) {
      return { status: false };
    }
  }
}

