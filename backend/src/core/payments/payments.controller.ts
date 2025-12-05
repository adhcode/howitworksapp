import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
  ParseUUIDPipe,
  Delete,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentProcessorService } from './payment-processor.service';
import { PaystackService } from './paystack.service';
import { ContractsService } from '../contracts/contracts.service';
import { EscrowService } from '../escrow/escrow.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

enum UserRole {
  ADMIN = 'admin',
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  FACILITATOR = 'facilitator',
}

/**
 * PAYMENTS CONTROLLER
 * 
 * Complete Paystack-integrated payment management:
 * 1. Tenant payments (one-time & recurring)
 * 2. Landlord payouts/transfers
 * 3. Bank account management
 * 4. Payment history
 */
@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly paymentProcessor: PaymentProcessorService,
    private readonly paystackService: PaystackService,
    private readonly contractsService: ContractsService,
    private readonly escrowService: EscrowService,
  ) {}

  // ==========================================
  // TENANT PAYMENT ENDPOINTS
  // ==========================================

  /**
   * INITIALIZE PAYMENT
   * 
   * Step 1: Initialize payment with Paystack.
   * Returns authorization URL for tenant to complete payment.
   */
  @Post('initialize')
  @Roles(UserRole.TENANT, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Initialize rent payment',
    description: 'Initialize payment with Paystack. Returns authorization URL for payment.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment initialized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request' })
  async initializePayment(
    @Body() dto: { contractId: string; email: string },
    @Request() req: any
  ) {
    try {
      // Get contract to verify tenant
      const contract = await this.contractsService.getContractById(dto.contractId);

      // Verify tenant owns this contract (unless admin)
      if (req.user.role !== UserRole.ADMIN && contract.tenantId !== req.user.id) {
        throw new HttpException(
          'You can only make payments for your own contracts',
          HttpStatus.FORBIDDEN
        );
      }

      // Initialize payment
      const result = await this.paymentProcessor.initializePayment(
        dto.contractId,
        dto.email,
      );

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to initialize payment',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * INITIALIZE PAYSTACK PAYMENT (GENERIC)
   * 
   * Initialize a generic Paystack payment (not tied to a contract).
   * Used for one-time payments, top-ups, etc.
   * Creates a payment record immediately with status='pending'
   */
  @Post('paystack/initialize')
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Initialize Paystack payment',
    description: 'Initialize a generic payment with Paystack. Returns authorization URL.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment initialized' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request' })
  async initializePaystackPayment(
    @Body() dto: { 
      email: string; 
      amount: number; 
      currency?: string;
      description?: string;
      metadata?: any;
    },
    @Request() req: any
  ) {
    try {
      this.logger.log(`🔄 Initializing Paystack payment for ${dto.email}: ₦${dto.amount}`);

      // Check for existing pending payment for this tenant
      const existingPending = await this.paymentProcessor.checkPendingPayment(req.user.id);
      if (existingPending) {
        this.logger.warn(`⚠️ User ${req.user.id} already has a pending payment`);
        throw new HttpException(
          'You already have a pending payment. Please complete or cancel it first.',
          HttpStatus.CONFLICT
        );
      }

      // Initialize payment with Paystack
      // Note: Amount should be in Naira, PaystackService will convert to kobo
      const result = await this.paystackService.initializeTransaction({
        email: dto.email,
        amount: dto.amount, // Send in Naira, service converts to kobo
        currency: dto.currency || 'NGN',
        metadata: {
          ...dto.metadata,
          userId: req.user.id,
          userRole: req.user.role,
          description: dto.description,
        },
      });

      if (!result.status) {
        throw new HttpException(
          result.message || 'Failed to initialize payment',
          HttpStatus.BAD_REQUEST
        );
      }

      // Create payment record in database with status='pending'
      await this.paymentProcessor.createPendingPaymentRecord({
        tenantId: req.user.id,
        amount: dto.amount,
        paystackReference: result.data?.reference || '',
        description: dto.description,
        metadata: dto.metadata,
      });

      this.logger.log(`✅ Payment initialized and recorded: ${result.data?.reference}`);

      return {
        success: true,
        authorization_url: result.data?.authorization_url,
        access_code: result.data?.access_code,
        reference: result.data?.reference,
      };
    } catch (error) {
      this.logger.error(`❌ Payment initialization failed: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to initialize payment',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * VERIFY PAYMENT
   * 
   * Verify payment status after Paystack redirect.
   * Mobile app can call this to check if payment was successful.
   */
  @Get('verify/:reference')
  @Roles(UserRole.TENANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Verify payment status' })
  @ApiParam({ name: 'reference', description: 'Paystack payment reference' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment status' })
  async verifyPayment(
    @Param('reference') reference: string,
  ) {
    try {
      const verification = await this.paystackService.verifyTransaction(reference);
      
      if (!verification.status) {
        throw new HttpException(verification.message || 'Verification failed', HttpStatus.BAD_REQUEST);
      }

      return {
        success: true,
        data: {
          reference: verification.data?.reference,
          status: verification.data?.status,
          amount: verification.data?.amount,
          paid_at: verification.data?.paid_at,
          message: verification.data?.gateway_response,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to verify payment',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * VERIFY PAYSTACK PAYMENT (POST)
   * 
   * Verify payment status via POST request.
   * Updates payment record in database based on Paystack status.
   */
  @Post('paystack/verify')
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Verify Paystack payment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment verified' })
  async verifyPaystackPayment(
    @Body() dto: { reference: string },
  ) {
    try {
      this.logger.log(`🔍 Verifying payment: ${dto.reference}`);

      const verification = await this.paystackService.verifyTransaction(dto.reference);
      
      if (!verification.status) {
        this.logger.error(`❌ Verification failed: ${verification.message}`);
        throw new HttpException(verification.message || 'Verification failed', HttpStatus.BAD_REQUEST);
      }

      const paystackStatus = verification.data?.status || 'unknown';
      this.logger.log(`✅ Payment verified with Paystack: ${paystackStatus}`);
      this.logger.log(`💰 Raw amount from Paystack: ${verification.data?.amount}`);
      
      // Paystack returns amount in kobo, so we need to pass it as-is
      // The payment processor will validate it
      await this.paymentProcessor.updatePaymentStatus(
        dto.reference,
        paystackStatus,
        verification.data
      );

      return {
        status: true,
        data: {
          reference: verification.data?.reference,
          status: paystackStatus,
          amount: verification.data?.amount ? verification.data.amount / 100 : 0, // Convert from kobo
          paid_at: verification.data?.paid_at,
          message: verification.data?.gateway_response,
        },
      };
    } catch (error) {
      this.logger.error(`❌ Verification error: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to verify payment',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * COMPLETE PAYMENT
   * 
   * Verify and process payment through business logic.
   * This updates the contract, creates payment records, and handles payouts.
   * Call this after payment is successful to complete the transaction.
   */
  @Post('complete/:reference')
  @Roles(UserRole.TENANT, UserRole.ADMIN)
  @ApiOperation({ 
    summary: 'Complete payment processing',
    description: 'Verify payment with Paystack and process through business logic (update contract, create records, etc.)'
  })
  @ApiParam({ name: 'reference', description: 'Paystack payment reference' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment completed' })
  async completePayment(
    @Param('reference') reference: string,
  ) {
    try {
      const result = await this.paymentProcessor.completePayment(reference);
      
      return {
        success: true,
        message: 'Payment completed successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to complete payment',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * ENABLE RECURRING PAYMENTS
   * 
   * Tenant opts in to recurring payments using their saved card.
   * Card is saved automatically after first successful payment.
   */
  @Post('recurring/enable')
  @Roles(UserRole.TENANT)
  @ApiOperation({
    summary: 'Enable recurring payments',
    description: 'Enable automatic monthly payments using saved card',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recurring payments enabled' })
  async enableRecurringPayments(
    @Body() dto: { contractId: string },
    @Request() req: any
  ) {
    try {
      // TODO: Update contract to enable recurring payments
      // For now, just verify tenant has saved card

      return {
        success: true,
        message: 'Recurring payments enabled. Your card will be charged automatically on the 1st of each month.',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to enable recurring payments',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * CHARGE RECURRING PAYMENT
   * 
   * Manually trigger recurring payment (usually called by cron job).
   */
  @Post('recurring/charge')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Charge recurring payment',
    description: 'Charge saved card for rent payment (admin only)',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment charged' })
  async chargeRecurringPayment(
    @Body() dto: { contractId: string; tenantId: string },
  ) {
    try {
      const result = await this.paymentProcessor.chargeRecurringPayment(
        dto.contractId,
        dto.tenantId,
      );

      return {
        success: true,
        message: 'Recurring payment processed successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to charge recurring payment',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET PAYMENT HISTORY
   * 
   * Retrieve payment history for a tenant.
   */
  @Get('history')
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get payment history' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment history retrieved' })
  async getPaymentHistory(
    @Query('tenantId') tenantId: string,
    @Request() req: any
  ) {
    try {
      // Tenants can only view their own history
      if (req.user.role === UserRole.TENANT && tenantId !== req.user.id) {
        throw new HttpException('Access denied', HttpStatus.FORBIDDEN);
      }

      const payments = await this.paymentProcessor.getPaymentHistory(
        tenantId || req.user.id
      );

      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch payment history',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET UPCOMING PAYMENTS
   * 
   * Get list of upcoming rent payments for a tenant.
   */
  @Get('upcoming')
  @Roles(UserRole.TENANT, UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get upcoming payments' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Upcoming payments retrieved' })
  async getUpcomingPayments(@Request() req: any) {
    try {
      const payments = await this.paymentProcessor.getUpcomingPayments(req.user.id);

      return {
        success: true,
        data: payments,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch upcoming payments',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // ==========================================
  // LANDLORD PAYOUT ENDPOINTS
  // ==========================================

  /**
   * SETUP BANK ACCOUNT
   * 
   * Landlord sets up bank account for receiving payouts.
   */
  @Post('landlord/setup-bank')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Setup landlord bank account',
    description: 'Setup bank account for receiving rent payouts',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bank account set up' })
  async setupBankAccount(
    @Body() dto: { account_number: string; bank_code: string },
    @Request() req: any
  ) {
    try {
      const result = await this.paymentProcessor.setupLandlordBankAccount(
        req.user.id,
        dto
      );

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to setup bank account',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET BANK ACCOUNTS
   * 
   * Get landlord's saved bank accounts.
   */
  @Get('landlord/bank-accounts')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get saved bank accounts',
    description: 'Retrieve landlord\'s saved bank accounts',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bank accounts retrieved' })
  async getBankAccounts(@Request() req: any) {
    try {
      const accounts = await this.paymentProcessor.getLandlordBankAccounts(req.user.id);

      return {
        success: true,
        data: accounts,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch bank accounts',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * REQUEST PAYOUT
   * 
   * Landlord requests payout to their bank account.
   */
  @Post('landlord/request-payout')
  @Roles(UserRole.LANDLORD)
  @ApiOperation({
    summary: 'Request payout',
    description: 'Request transfer of available balance to bank account',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payout initiated' })
  async requestPayout(
    @Body() dto: { amount: number; reason?: string },
    @Request() req: any
  ) {
    try {
      // TODO: Verify landlord has sufficient balance
      // For now, just initiate payout

      const result = await this.paymentProcessor.processLandlordPayout(
        req.user.id,
        dto.amount,
        dto.reason || 'Rent payout'
      );

      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to process payout',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET ESCROW BALANCE
   * 
   * Get landlord's escrow balance (for yearly payouts).
   */
  @Get('landlord/escrow')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get escrow balance' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Escrow balance retrieved' })
  async getEscrowBalance(@Request() req: any) {
    try {
      const balances = await this.escrowService.getEscrowBalances(req.user.id);

      // Calculate total unreleased
      const total = balances
        .filter(b => !b.isReleased)
        .reduce((sum, b) => sum + parseFloat(b.totalEscrowed), 0);

      return {
        success: true,
        data: {
          balances,
          unreleasedTotal: total,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch escrow balance',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET AVAILABLE BALANCE
   * 
   * Get landlord's available balance for payout.
   */
  @Get('landlord/balance')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get available balance' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Balance retrieved' })
  async getAvailableBalance(@Request() req: any) {
    try {
      // TODO: Calculate available balance from payments
      // For now, return mock data

      return {
        success: true,
        data: {
          available: 0,
          pending: 0,
          currency: 'NGN',
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch balance',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // ==========================================
  // UTILITY ENDPOINTS
  // ==========================================

  /**
   * GET BANKS LIST
   * 
   * Get list of Nigerian banks for landlord account setup.
   */
  @Get('banks')
  @Roles(UserRole.LANDLORD, UserRole.TENANT, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get list of banks' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Banks list retrieved' })
  async getBanks() {
    try {
      const result = await this.paystackService.listBanks('nigeria');

      if (!result.status) {
        throw new HttpException(
          result.message || 'Failed to fetch banks from Paystack',
          HttpStatus.BAD_REQUEST
        );
      }

      if (!result.data || result.data.length === 0) {
        throw new HttpException(
          'No banks returned from Paystack',
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch banks',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * RESOLVE ACCOUNT NUMBER
   * 
   * Verify bank account details before saving.
   */
  @Post('resolve-account')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Resolve bank account number' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Account resolved' })
  async resolveAccount(
    @Body() dto: { account_number: string; bank_code: string }
  ) {
    try {
      this.logger.log(`🔍 Resolving account: ${dto.account_number} at bank: ${dto.bank_code}`);
      
      const result = await this.paystackService.resolveAccountNumber(dto);

      if (!result.status) {
        this.logger.error(`❌ Account resolution failed: ${result.message}`);
        throw new HttpException(
          result.message || 'Invalid account number',
          HttpStatus.BAD_REQUEST
        );
      }

      this.logger.log(`✅ Account resolved successfully: ${result.data?.account_name}`);

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to resolve account',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * DELETE SAVED CARD
   * 
   * Remove tenant's saved card (disable recurring payments).
   */
  @Delete('saved-card')
  @Roles(UserRole.TENANT)
  @ApiOperation({ summary: 'Delete saved card' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Card removed' })
  async deleteSavedCard(@Request() req: any) {
    try {
      // TODO: Remove saved card from user record
      // For now, just return success

      return {
        success: true,
        message: 'Saved card removed successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to remove card',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // ==========================================
  // LANDLORD WALLET ENDPOINTS
  // ==========================================

  /**
   * GET WALLET BALANCE
   * 
   * Get landlord's current wallet balance.
   */
  @Get('wallet/balance')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Balance retrieved' })
  async getWalletBalance(@Request() req: any) {
    try {
      const balance = await this.paymentProcessor.getWalletBalance(req.user.id);

      return {
        success: true,
        data: balance,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch wallet balance',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET WALLET TRANSACTIONS
   * 
   * Get landlord's wallet transaction history.
   */
  @Get('wallet/transactions')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get wallet transactions' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'Transactions retrieved' })
  async getWalletTransactions(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const transactions = await this.paymentProcessor.getWalletTransactions(
        req.user.id,
        {
          limit: limit ? parseInt(limit) : 50,
          offset: offset ? parseInt(offset) : 0,
        }
      );

      return {
        success: true,
        data: transactions,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch transactions',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * GET LANDLORD PAYMENT STATS
   * 
   * Get comprehensive payment statistics for landlord dashboard.
   */
  @Get('landlord/stats')
  @Roles(UserRole.LANDLORD, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get landlord payment statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Payment stats retrieved' })
  async getLandlordPaymentStats(@Request() req: any) {
    try {
      const stats = await this.paymentProcessor.getLandlordPaymentStats(req.user.id);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch payment stats',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  /**
   * REQUEST WITHDRAWAL
   * 
   * Landlord requests to withdraw funds to their bank account.
   */
  @Post('wallet/withdraw')
  @Roles(UserRole.LANDLORD)
  @ApiOperation({ summary: 'Request withdrawal' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Withdrawal initiated' })
  async requestWithdrawal(
    @Body() dto: { amount: number; reason?: string },
    @Request() req: any
  ) {
    try {
      const result = await this.paymentProcessor.processWithdrawal(
        req.user.id,
        dto.amount,
        dto.reason
      );

      return {
        success: true,
        message: 'Withdrawal request processed successfully',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to process withdrawal',
        error.status || HttpStatus.BAD_REQUEST
      );
    }
  }
}
