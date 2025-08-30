import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

@Injectable()
export class PaystackService {
  private paystack: any;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY');
    if (secretKey) {
      this.paystack = require('paystack')(secretKey);
    }
  }

  async initializeTransaction(data: {
    email: string;
    amount: number; // Amount in kobo (multiply by 100)
    currency?: string;
    reference?: string;
    callback_url?: string;
    metadata?: any;
  }) {
    try {
      const response = await this.paystack.transaction.initialize({
        email: data.email,
        amount: Math.round(data.amount * 100), // Convert to kobo
        currency: data.currency || 'NGN',
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: data.metadata,
      });

      return {
        status: true,
        data: {
          authorization_url: response.data.authorization_url,
          access_code: response.data.access_code,
          reference: response.data.reference,
        },
      };
    } catch (error) {
      console.error('Paystack initialization error:', error);
      return {
        status: false,
        message: error.message || 'Failed to initialize payment',
      };
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const response = await this.paystack.transaction.verify(reference);
      
      return {
        status: response.status,
        data: {
          id: response.data.id,
          domain: response.data.domain,
          status: response.data.status,
          reference: response.data.reference,
          amount: response.data.amount / 100, // Convert back from kobo
          gateway_response: response.data.gateway_response,
          paid_at: response.data.paid_at,
          created_at: response.data.created_at,
          channel: response.data.channel,
          currency: response.data.currency,
          customer: response.data.customer,
          metadata: response.data.metadata,
        },
      };
    } catch (error) {
      console.error('Paystack verification error:', error);
      return {
        status: false,
        message: error.message || 'Failed to verify payment',
      };
    }
  }

  async createCustomer(data: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    metadata?: any;
  }) {
    try {
      const response = await this.paystack.customer.create({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        metadata: data.metadata,
      });

      return {
        status: true,
        data: {
          id: response.data.id,
          customer_code: response.data.customer_code,
          email: response.data.email,
        },
      };
    } catch (error) {
      console.error('Paystack customer creation error:', error);
      return {
        status: false,
        message: error.message || 'Failed to create customer',
      };
    }
  }

  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    customer?: string;
    status?: 'failed' | 'success' | 'abandoned';
    from?: string;
    to?: string;
  }) {
    try {
      const response = await this.paystack.transaction.list(params);
      
      return {
        status: true,
        data: response.data.map((transaction: any) => ({
          id: transaction.id,
          reference: transaction.reference,
          amount: transaction.amount / 100,
          status: transaction.status,
          gateway_response: transaction.gateway_response,
          paid_at: transaction.paid_at,
          created_at: transaction.created_at,
          customer: transaction.customer,
          metadata: transaction.metadata,
        })),
        meta: response.meta,
      };
    } catch (error) {
      console.error('Paystack list transactions error:', error);
      return {
        status: false,
        message: error.message || 'Failed to fetch transactions',
      };
    }
  }

  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `homezy_${timestamp}_${random}`;
  }
}


