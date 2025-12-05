import { Injectable, Inject, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import * as schema from '../../database/schema';
import { 
  tenantRentContracts,
  landlordEscrowBalances,
  NewLandlordEscrowBalance,
} from '../../database/schema/tenant-rent-contracts';
import { payments, NewPayment } from '../../database/schema/payments';
import { users } from '../../database/schema/users';
import { ProcessPaymentDto, PaymentResultDto } from './dto/payment.dto';
import { BUSINESS_RULES } from '../../shared/constants/business-rules.constant';
import { addMonths, startOfMonth, differenceInMonths } from '../../shared/utils/date.utils';
import { PaystackService } from './paystack.service';
import { WalletService } from '../wallet/wallet.service';

/**
 * PAYMENT PROCESSOR SERVICE
 * 
 * Core service for processing rent payments with Paystack integration.
 * Handles the flow of money from tenant to either:
 * 1. Landlord wallet (immediate payout for monthly via Paystack Transfer)
 * 2. Escrow account (accumulation for yearly)
 * 
 * Key responsibilities:
 * 1. Initialize payments with Paystack
 * 2. Verify and process payments
 * 3. Route money based on payout type
 * 4. Handle recurring payments (saved cards)
 * 5. Manage landlord payouts/transfers
 * 6. Update contract payment due dates
 */
@Injectable()
export class PaymentProcessorService {
  private readonly logger = new Logger(PaymentProcessorService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly paystackService: PaystackService,
    private readonly walletService: WalletService,
  ) {}

  /**
   * PROCESS RENT PAYMENT
   * 
   * Main payment processing flow:
   * 1. Validate contract exists and is active
   * 2. Verify payment amount matches monthly rent
   * 3. Route payment based on landlord payout type:
   *    - MONTHLY → Immediate payout to landlord wallet
   *    - YEARLY → Add to escrow for later release
   * 4. Create payment record
   * 5. Update next payment due date
   * 
   * @param dto - Payment details
   * @returns Payment result
   */
  async processPayment(dto: ProcessPaymentDto): Promise<PaymentResultDto> {
    this.logger.log(`Processing payment for contract ${dto.contractId}`);

    // Get contract
    const [contract] = await this.db
      .select()
      .from(tenantRentContracts)
      .where(eq(tenantRentContracts.id, dto.contractId))
      .limit(1);

    if (!contract) {
      throw new BadRequestException(`Contract ${dto.contractId} not found`);
    }

    if (contract.status !== 'active') {
      throw new BadRequestException(`Contract is not active. Status: ${contract.status}`);
    }

    // Verify payment amount
    const expectedAmount = parseFloat(contract.monthlyAmount);
    if (Math.abs(dto.amount - expectedAmount) > 0.01) { // Allow 1 cent difference for rounding
      throw new BadRequestException(
        `Payment amount ${dto.amount} does not match contract amount ${expectedAmount}`
      );
    }

    try {
      let payoutMessage: string;
      let transactionId: string | undefined;

      // Route payment based on payout type
      if (contract.landlordPayoutType === 'monthly') {
        // Immediate payout to landlord
        transactionId = await this.processImmediatePayout(
          contract.landlordId,
          dto.amount,
          dto.contractId,
          dto.paymentMethod,
          dto.reference
        );
        payoutMessage = 'Payment credited immediately to landlord wallet';
      } else {
        // Add to escrow
        await this.addToEscrow(
          contract.landlordId,
          dto.amount,
          dto.contractId
        );
        payoutMessage = 'Payment added to escrow for yearly release';
      }

      // Create payment record
      await this.createPaymentRecord(contract, dto);

      // Update next payment due date (add 1 month)
      const nextPaymentDue = addMonths(contract.nextPaymentDue, 1);
      await this.updateNextPaymentDue(dto.contractId, nextPaymentDue);

      this.logger.log(`✅ Payment processed successfully for contract ${dto.contractId}`);
      this.logger.log(`   Amount: $${dto.amount}`);
      this.logger.log(`   Payout type: ${contract.landlordPayoutType}`);
      this.logger.log(`   Next payment due: ${nextPaymentDue.toDateString()}`);

      return {
        success: true,
        payoutType: contract.landlordPayoutType,
        message: payoutMessage,
        nextPaymentDue,
        transactionId,
      };
    } catch (error) {
      this.logger.error(`❌ Payment processing failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Payment processing failed: ${error.message}`);
    }
  }

  /**
   * PROCESS IMMEDIATE PAYOUT (MONTHLY)
   * 
   * Credits landlord's wallet immediately when tenant pays.
   * 
   * TODO: Integrate with actual wallet/banking system
   * For now, logs the transaction.
   * 
   * @param landlordId - Landlord to pay
   * @param amount - Amount to credit
   * @param contractId - Related contract
   * @param paymentMethod - How tenant paid
   * @param reference - Payment reference
   * @returns Transaction ID
   */
  private async processImmediatePayout(
    landlordId: string,
    amount: number,
    contractId: string,
    paymentMethod?: string,
    reference?: string
  ): Promise<string> {
    this.logger.log(`💰 Immediate payout: ₦${amount} to landlord ${landlordId}`);

    // Credit landlord's wallet using WalletService
    const transaction = await this.walletService.credit(landlordId, amount, {
      type: 'rent_payment',
      contractId,
      reference,
      description: `Rent payment received via ${paymentMethod || 'card'}`,
    });

    this.logger.log(`✅ Landlord wallet credited. Transaction ID: ${transaction.id}`);
    this.logger.log(`   Balance updated for landlord ${landlordId}`);

    return transaction.id;
  }

  /**
   * ADD TO ESCROW (YEARLY)
   * 
   * Adds payment to escrow balance for yearly payout landlords.
   * Money accumulates until:
   * - 12 months have passed, OR
   * - Contract expires
   * Then it's released to landlord wallet.
   * 
   * @param landlordId - Landlord ID
   * @param amount - Amount to add
   * @param contractId - Related contract
   */
  private async addToEscrow(
    landlordId: string,
    amount: number,
    contractId: string
  ): Promise<void> {
    this.logger.log(`🏦 Adding $${amount} to escrow for landlord ${landlordId}`);

    // Check if escrow balance exists for this contract
    const [existingEscrow] = await this.db
      .select()
      .from(landlordEscrowBalances)
      .where(
        and(
          eq(landlordEscrowBalances.contractId, contractId),
          eq(landlordEscrowBalances.landlordId, landlordId),
          eq(landlordEscrowBalances.isReleased, false)
        )
      )
      .limit(1);

    if (existingEscrow) {
      // Update existing escrow
      const newTotal = parseFloat(existingEscrow.totalEscrowed) + amount;
      const newMonthsAccumulated = existingEscrow.monthsAccumulated + 1;

      await this.db
        .update(landlordEscrowBalances)
        .set({
          totalEscrowed: newTotal.toFixed(2),
          monthsAccumulated: newMonthsAccumulated,
          updatedAt: new Date(),
        })
        .where(eq(landlordEscrowBalances.id, existingEscrow.id));

      this.logger.log(`✅ Escrow updated: $${newTotal} (${newMonthsAccumulated} months)`);
    } else {
      // Create new escrow balance
      // Expected release date: 12 months from now
      const expectedReleaseDate = addMonths(new Date(), BUSINESS_RULES.ESCROW.AUTO_RELEASE_MONTHS);

      const escrowData: NewLandlordEscrowBalance = {
        landlordId,
        contractId,
        totalEscrowed: amount.toFixed(2),
        monthsAccumulated: 1,
        expectedReleaseDate,
        isReleased: false,
      };

      await this.db
        .insert(landlordEscrowBalances)
        .values(escrowData);

      this.logger.log(`✅ New escrow created: $${amount} | Release date: ${expectedReleaseDate.toDateString()}`);
    }
  }

  /**
   * CREATE PAYMENT RECORD
   * 
   * Records payment in the payments table for tracking and history.
   * 
   * @param contract - Related contract
   * @param dto - Payment details
   */
  private async createPaymentRecord(
    contract: typeof tenantRentContracts.$inferSelect,
    dto: ProcessPaymentDto
  ): Promise<void> {
    const paymentData: NewPayment = {
      landlordId: contract.landlordId,
      tenantId: contract.tenantId,
      propertyId: contract.propertyId,
      unitId: contract.unitId,
      amount: dto.amount.toFixed(2),
      amountPaid: dto.amount.toFixed(2),
      dueDate: contract.nextPaymentDue,
      paidDate: new Date(),
      paymentType: 'rent',
      paymentMethod: dto.paymentMethod as any,
      status: 'paid',
      receiptNumber: dto.reference,
      description: `Rent payment for ${startOfMonth(contract.nextPaymentDue).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      notes: dto.reference,
    };

    await this.db.insert(payments).values(paymentData);

    this.logger.log(`✅ Payment record created`);
  }

  /**
   * UPDATE NEXT PAYMENT DUE DATE
   * 
   * After payment, advances the next payment due date by 1 month.
   * 
   * @param contractId - Contract ID
   * @param nextPaymentDue - New due date
   */
  private async updateNextPaymentDue(
    contractId: string,
    nextPaymentDue: Date
  ): Promise<void> {
    await this.db
      .update(tenantRentContracts)
      .set({
        nextPaymentDue,
        updatedAt: new Date(),
      })
      .where(eq(tenantRentContracts.id, contractId));

    this.logger.log(`✅ Next payment due updated to: ${nextPaymentDue.toDateString()}`);
  }

  /**
   * GET PAYMENT HISTORY FOR TENANT
   * 
   * Returns all payments made by a tenant across all their contracts.
   * 
   * @param tenantId - Tenant ID
   * @returns Payment history
   */
  async getPaymentHistory(tenantId: string): Promise<any[]> {
    return this.db
      .select()
      .from(payments)
      .where(and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, 'paid')
      ))
      .orderBy(sql`${payments.paidDate} DESC`);
  }

  /**
   * GET UPCOMING PAYMENTS FOR TENANT
   * 
   * Returns all upcoming (pending) payments for a tenant.
   * 
   * @param tenantId - Tenant ID
   * @returns Upcoming payments
   */
  async getUpcomingPayments(tenantId: string): Promise<any[]> {
    const contracts = await this.db
      .select()
      .from(tenantRentContracts)
      .where(and(
        eq(tenantRentContracts.tenantId, tenantId),
        eq(tenantRentContracts.status, 'active')
      ));

    return contracts.map(contract => ({
      contractId: contract.id,
      propertyId: contract.propertyId,
      unitId: contract.unitId,
      amount: contract.monthlyAmount,
      dueDate: contract.nextPaymentDue,
      status: this.getPaymentStatus(contract.nextPaymentDue),
    }));
  }

  /**
   * GET PAYMENT STATUS
   * 
   * Determines if payment is pending, due, or overdue based on dates.
   * 
   * @param dueDate - Payment due date
   * @returns Status string
   */
  private getPaymentStatus(dueDate: Date): 'upcoming' | 'due' | 'overdue' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < -BUSINESS_RULES.PAYMENT_GRACE_DAYS) {
      return 'overdue';
    } else if (diffDays <= 0) {
      return 'due';
    } else {
      return 'upcoming';
    }
  }

  // ==========================================
  // PAYSTACK-INTEGRATED METHODS
  // ==========================================

  /**
   * INITIALIZE PAYMENT WITH PAYSTACK
   * 
   * Step 1: Initialize payment transaction with Paystack.
   * Returns authorization URL for tenant to complete payment.
   * 
   * @param contractId - Contract to pay for
   * @param tenantEmail - Tenant's email
   * @returns Paystack authorization URL and reference
   */
  async initializePayment(contractId: string, tenantEmail: string): Promise<{
    success: boolean;
    message: string;
    authorization_url?: string;
    reference?: string;
    amount?: number;
  }> {
    this.logger.log(`💳 Initializing payment for contract ${contractId}`);

    // Get contract
    const [contract] = await this.db
      .select()
      .from(tenantRentContracts)
      .where(eq(tenantRentContracts.id, contractId))
      .limit(1);

    if (!contract) {
      throw new NotFoundException(`Contract ${contractId} not found`);
    }

    if (contract.status !== 'active') {
      throw new BadRequestException(`Contract is not active`);
    }

    const amount = parseFloat(contract.monthlyAmount);
    const reference = this.paystackService.generateReference();

    // Initialize with Paystack
    const paystackResponse = await this.paystackService.initializeTransaction({
      email: tenantEmail,
      amount: amount,
      reference: reference,
      callback_url: `${process.env.FRONTEND_URL}/payments/callback`,
      metadata: {
        contractId: contract.id,
        tenantId: contract.tenantId,
        landlordId: contract.landlordId,
        propertyId: contract.propertyId,
        unitId: contract.unitId,
        payoutType: contract.landlordPayoutType,
        type: 'rent_payment',
      },
    });

    if (!paystackResponse.status || !paystackResponse.data) {
      throw new BadRequestException(paystackResponse.message || 'Payment initialization failed');
    }

    this.logger.log(`✅ Payment initialized: ${reference}`);

    return {
      success: true,
      message: 'Payment initialized successfully',
      authorization_url: paystackResponse.data.authorization_url,
      reference: reference,
      amount: amount,
    };
  }

  /**
   * COMPLETE PAYMENT AFTER PAYSTACK VERIFICATION
   * 
   * Step 2: Verify payment with Paystack and process through business logic.
   * Called by webhook or callback handler.
   * 
   * @param reference - Paystack payment reference
   * @returns Payment result
   */
  async completePayment(reference: string): Promise<PaymentResultDto> {
    this.logger.log(`🔍 Completing payment: ${reference}`);

    // Verify transaction with Paystack
    const verification = await this.paystackService.verifyTransaction(reference);

    if (!verification.status || !verification.data) {
      throw new BadRequestException(verification.message || 'Payment verification failed');
    }

    if (verification.data.status !== 'success') {
      throw new BadRequestException(`Payment failed: ${verification.data.gateway_response}`);
    }

    // Extract contract details from metadata
    const metadata = verification.data.metadata;
    const contractId = metadata.contractId;
    const amount = verification.data.amount; // Already converted from kobo in verifyTransaction

    // Save authorization code if card is reusable (for recurring payments)
    if (verification.data.authorization?.reusable) {
      await this.savePaymentAuthorization(
        metadata.tenantId,
        verification.data.authorization
      );
    }

    // Process payment using existing business logic
    return this.processPayment({
      contractId: contractId,
      amount: amount,
      paymentMethod: verification.data.channel,
      reference: reference,
    });
  }

  /**
   * CHARGE RECURRING PAYMENT (SAVED CARD)
   * 
   * Charges tenant's saved card automatically for recurring payments.
   * 
   * @param contractId - Contract to charge for
   * @param tenantId - Tenant who owns the card
   * @returns Payment result
   */
  async chargeRecurringPayment(contractId: string, tenantId: string): Promise<PaymentResultDto> {
    this.logger.log(`🔄 Processing recurring payment for contract ${contractId}`);

    // Get contract
    const [contract] = await this.db
      .select()
      .from(tenantRentContracts)
      .where(eq(tenantRentContracts.id, contractId))
      .limit(1);

    if (!contract) {
      throw new NotFoundException(`Contract ${contractId} not found`);
    }

    if (contract.tenantId !== tenantId) {
      throw new BadRequestException(`Contract does not belong to this tenant`);
    }

    // Get tenant's saved authorization
    const [tenant] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, tenantId))
      .limit(1);

    if (!tenant || !tenant.paystackAuthorizationCode) {
      throw new BadRequestException(`No saved payment method found for this tenant`);
    }

    const amount = parseFloat(contract.monthlyAmount);
    const reference = this.paystackService.generateReference('recurring');

    // Charge the saved card
    const chargeResponse = await this.paystackService.chargeAuthorization({
      email: tenant.email,
      amount: amount,
      authorization_code: tenant.paystackAuthorizationCode,
      reference: reference,
      metadata: {
        contractId: contract.id,
        tenantId: contract.tenantId,
        landlordId: contract.landlordId,
        type: 'recurring_rent_payment',
      },
    });

    if (!chargeResponse.status) {
      this.logger.error(`❌ Recurring payment failed: ${chargeResponse.message}`);
      throw new BadRequestException(`Recurring payment failed: ${chargeResponse.message}`);
    }

    // Process payment
    return this.processPayment({
      contractId: contractId,
      amount: amount,
      paymentMethod: 'card_recurring',
      reference: reference,
    });
  }

  /**
   * SAVE PAYMENT AUTHORIZATION (CARD DETAILS)
   * 
   * Saves tenant's card authorization for recurring payments.
   * 
   * @param tenantId - Tenant ID
   * @param authorization - Paystack authorization object
   */
  private async savePaymentAuthorization(tenantId: string, authorization: any): Promise<void> {
    if (!authorization.reusable) {
      return; // Don't save if not reusable
    }

    this.logger.log(`💳 Saving payment method for tenant ${tenantId}`);

    await this.db
      .update(users)
      .set({
        paystackAuthorizationCode: authorization.authorization_code,
        paystackCardLast4: authorization.last4,
        paystackCardBrand: authorization.brand,
        paystackCardBank: authorization.bank,
        updatedAt: new Date(),
      })
      .where(eq(users.id, tenantId));

    this.logger.log(`✅ Payment method saved for tenant ${tenantId}`);
  }

  /**
   * PROCESS LANDLORD PAYOUT
   * 
   * Transfers money to landlord's bank account via Paystack.
   * 
   * @param landlordId - Landlord to pay out
   * @param amount - Amount to transfer
   * @param reason - Reason for transfer
   * @returns Transfer result
   */
  async processLandlordPayout(
    landlordId: string,
    amount: number,
    reason: string = 'Rent payout'
  ): Promise<{
    success: boolean;
    message: string;
    transfer_code?: string;
    reference?: string;
  }> {
    this.logger.log(`💸 Processing landlord payout: ${landlordId} - ₦${amount}`);

    // Get landlord details
    const [landlord] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, landlordId))
      .limit(1);

    if (!landlord) {
      throw new NotFoundException(`Landlord ${landlordId} not found`);
    }

    // Check if landlord has recipient code
    if (!landlord.paystackRecipientCode) {
      throw new BadRequestException(
        `Landlord must set up bank account before receiving payouts`
      );
    }

    // Initiate transfer
    const transferResponse = await this.paystackService.initiateTransfer({
      amount: amount,
      recipient: landlord.paystackRecipientCode,
      reason: reason,
      metadata: {
        landlordId: landlord.id,
        type: 'landlord_payout',
      },
    });

    if (!transferResponse.status) {
      this.logger.error(`❌ Payout failed: ${transferResponse.message}`);
      throw new BadRequestException(`Payout failed: ${transferResponse.message}`);
    }

    this.logger.log(`✅ Payout initiated: ${transferResponse.data?.transfer_code}`);

    return {
      success: true,
      message: 'Payout initiated successfully',
      transfer_code: transferResponse.data?.transfer_code,
      reference: transferResponse.data?.reference,
    };
  }

  /**
   * SETUP LANDLORD BANK ACCOUNT
   * 
   * Creates transfer recipient for landlord payouts.
   * 
   * @param landlordId - Landlord ID
   * @param bankDetails - Bank account details
   * @returns Recipient code
   */
  async setupLandlordBankAccount(
    landlordId: string,
    bankDetails: {
      account_number: string;
      bank_code: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
    recipient_code?: string;
  }> {
    this.logger.log(`🏦 Setting up bank account for landlord ${landlordId}`);

    // Get landlord
    const [landlord] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, landlordId))
      .limit(1);

    if (!landlord) {
      throw new NotFoundException(`Landlord ${landlordId} not found`);
    }

    // Resolve account number first
    const accountDetails = await this.paystackService.resolveAccountNumber({
      account_number: bankDetails.account_number,
      bank_code: bankDetails.bank_code,
    });

    if (!accountDetails.status) {
      throw new BadRequestException(`Invalid bank account: ${accountDetails.message}`);
    }

    // Create transfer recipient
    const recipientResponse = await this.paystackService.createTransferRecipient({
      type: 'nuban',
      name: accountDetails.data?.account_name || landlord.firstName + ' ' + landlord.lastName,
      account_number: bankDetails.account_number,
      bank_code: bankDetails.bank_code,
      metadata: {
        landlordId: landlord.id,
        email: landlord.email,
      },
    });

    if (!recipientResponse.status) {
      throw new BadRequestException(`Failed to create recipient: ${recipientResponse.message}`);
    }

    // Save recipient code to landlord
    await this.db
      .update(users)
      .set({
        paystackRecipientCode: recipientResponse.data?.recipient_code,
        bankAccountName: accountDetails.data?.account_name,
        bankAccountNumber: bankDetails.account_number,
        bankCode: bankDetails.bank_code,
        updatedAt: new Date(),
      })
      .where(eq(users.id, landlordId));

    this.logger.log(`✅ Bank account set up for landlord ${landlordId}`);

    return {
      success: true,
      message: 'Bank account set up successfully',
      recipient_code: recipientResponse.data?.recipient_code,
    };
  }

  /**
   * GET LANDLORD BANK ACCOUNTS
   * 
   * Returns landlord's saved bank accounts.
   */
  async getLandlordBankAccounts(landlordId: string): Promise<any[]> {
    this.logger.log(`💳 Fetching bank accounts for landlord ${landlordId}`);

    // Get landlord
    const [landlord] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, landlordId))
      .limit(1);

    if (!landlord) {
      throw new NotFoundException(`Landlord ${landlordId} not found`);
    }

    // Check if landlord has bank account setup
    if (!landlord.bankAccountNumber || !landlord.bankCode) {
      this.logger.log(`ℹ️ No bank account found for landlord ${landlordId}`);
      return [];
    }

    // Get bank name from Paystack
    const banksResponse = await this.paystackService.listBanks('nigeria');
    const bank = banksResponse.data?.find(b => b.code === landlord.bankCode);

    const accounts = [{
      accountName: landlord.bankAccountName,
      accountNumber: landlord.bankAccountNumber,
      bankCode: landlord.bankCode,
      bankName: bank?.name || 'Unknown Bank',
      recipientCode: landlord.paystackRecipientCode,
    }];

    this.logger.log(`✅ Found ${accounts.length} bank account(s) for landlord ${landlordId}`);

    return accounts;
  }

  // ==========================================
  // WALLET MANAGEMENT METHODS
  // ==========================================

  /**
   * GET WALLET BALANCE
   * 
   * Returns landlord's current wallet balance.
   */
  async getWalletBalance(landlordId: string) {
    return this.walletService.getBalance(landlordId);
  }

  /**
   * GET LANDLORD PAYMENT STATS
   * 
   * Returns comprehensive payment statistics for landlord dashboard.
   */
  async getLandlordPaymentStats(landlordId: string) {
    try {
      this.logger.log(`🔍 Getting payment stats for landlord: ${landlordId}`);

      // Get wallet balance
      const walletBalance = await this.walletService.getBalance(landlordId);
      this.logger.log(`💰 Wallet balance: ${walletBalance.availableBalance}`);

      // Get recent transactions
      const transactions = await this.walletService.getTransactions(landlordId, { limit: 10 });
      this.logger.log(`📊 Transactions count: ${transactions?.length || 0}`);

      // Get payments directly for this landlord
      const landlordPayments = await this.db
        .select()
        .from(payments)
        .where(eq(payments.landlordId, landlordId));
      this.logger.log(`💳 Payments count: ${landlordPayments.length}`);

      // Get contracts for upcoming/pending calculations
      const contracts = await this.db
        .select()
        .from(tenantRentContracts)
        .where(eq(tenantRentContracts.landlordId, landlordId));
      this.logger.log(`📋 Contracts count: ${contracts.length}`);

      // Calculate stats
      const totalRentCollected = landlordPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + parseFloat(p.amountPaid || '0'), 0);

      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const upcomingPayments = contracts
        .filter(c => {
          if (!c.nextPaymentDue) return false;
          const dueDate = new Date(c.nextPaymentDue);
          return dueDate >= now && dueDate <= nextWeek;
        }).length;

      const pendingPayments = contracts
        .filter(c => {
          if (!c.nextPaymentDue) return false;
          const dueDate = new Date(c.nextPaymentDue);
          return dueDate < now;
        })
        .reduce((sum, c) => sum + parseFloat(c.monthlyAmount || '0'), 0);

      // Format recent transactions
      const recentTransactions = transactions?.slice(0, 5).map(t => ({
        type: t.type === 'credit' ? 'credit' : 'debit',
        description: t.description,
        amount: parseFloat(t.amount),
        date: t.createdAt,
      })) || [];

      const result = {
        walletBalance: walletBalance.availableBalance || 0,
        totalRentCollected,
        upcomingPayments,
        pendingPayments,
        recentTransactions,
      };

      this.logger.log(`✅ Payment stats result:`, result);
      return result;
    } catch (error) {
      this.logger.error(`❌ Error getting landlord payment stats: ${error.message}`);
      return {
        walletBalance: 0,
        totalRentCollected: 0,
        upcomingPayments: 0,
        pendingPayments: 0,
        recentTransactions: [],
      };
    }
  }

  /**
   * GET WALLET TRANSACTIONS
   * 
   * Returns landlord's wallet transaction history.
   */
  async getWalletTransactions(landlordId: string, options?: { limit?: number; offset?: number }) {
    return this.walletService.getTransactions(landlordId, options);
  }

  /**
   * PROCESS WITHDRAWAL
   * 
   * Process landlord withdrawal request.
   * Debits wallet and initiates Paystack transfer.
   */
  async processWithdrawal(
    landlordId: string,
    amount: number,
    reason?: string
  ): Promise<{
    success: boolean;
    message: string;
    transactionId: string;
    transferCode?: string;
  }> {
    this.logger.log(`💸 Processing withdrawal: ₦${amount} for landlord ${landlordId}`);

    // Get landlord details
    const [landlord] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, landlordId))
      .limit(1);

    if (!landlord) {
      throw new NotFoundException('Landlord not found');
    }

    // Check if bank account is set up
    if (!landlord.paystackRecipientCode) {
      throw new BadRequestException(
        'Please set up your bank account before requesting withdrawal'
      );
    }

    // Get current balance
    const balance = await this.walletService.getBalance(landlordId);

    // Check sufficient balance
    if (balance.availableBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Available: ₦${balance.availableBalance}, Requested: ₦${amount}`
      );
    }

    // Minimum withdrawal amount
    const MIN_WITHDRAWAL = 1000; // ₦1,000
    if (amount < MIN_WITHDRAWAL) {
      throw new BadRequestException(`Minimum withdrawal amount is ₦${MIN_WITHDRAWAL}`);
    }

    try {
      // Debit wallet first
      const transaction = await this.walletService.debit(landlordId, amount, {
        type: 'withdrawal',
        description: reason || 'Withdrawal to bank account',
      });

      // Initiate Paystack transfer
      const transferResponse = await this.paystackService.initiateTransfer({
        amount: amount,
        recipient: landlord.paystackRecipientCode,
        reason: reason || 'Wallet withdrawal',
        metadata: {
          landlordId: landlord.id,
          transactionId: transaction.id,
          type: 'wallet_withdrawal',
        },
      });

      if (!transferResponse.status) {
        // Transfer failed - reverse the debit
        this.logger.error(`❌ Transfer failed, reversing debit: ${transferResponse.message}`);
        
        await this.walletService.credit(landlordId, amount, {
          type: 'refund',
          description: `Refund for failed withdrawal: ${transferResponse.message}`,
        });

        throw new BadRequestException(`Withdrawal failed: ${transferResponse.message}`);
      }

      this.logger.log(`✅ Withdrawal processed: ${transaction.id}`);
      this.logger.log(`   Transfer code: ${transferResponse.data?.transfer_code}`);

      return {
        success: true,
        message: 'Withdrawal processed successfully. Funds will be transferred to your bank account.',
        transactionId: transaction.id,
        transferCode: transferResponse.data?.transfer_code,
      };
    } catch (error) {
      this.logger.error(`❌ Withdrawal error: ${error.message}`);
      throw error;
    }
  }

  /**
   * CHECK FOR PENDING PAYMENT
   * 
   * Check if tenant has any pending payments to prevent duplicates
   * Auto-cancel payments older than 1 hour
   */
  async checkPendingPayment(tenantId: string): Promise<boolean> {
    try {
      const [pendingPayment] = await this.db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.tenantId, tenantId),
            eq(payments.status, 'pending'),
            eq(payments.paymentGateway, 'paystack')
          )
        )
        .limit(1);

      if (!pendingPayment) {
        return false;
      }

      // Auto-cancel if older than 5 minutes (300 seconds)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (pendingPayment.createdAt && new Date(pendingPayment.createdAt) < fiveMinutesAgo) {
        this.logger.log(`🗑️ Auto-canceling expired pending payment: ${pendingPayment.id}`);
        await this.db
          .update(payments)
          .set({ 
            status: 'overdue',
            updatedAt: new Date(),
          })
          .where(eq(payments.id, pendingPayment.id));
        return false; // Allow new payment
      }

      return true; // Has recent pending payment
    } catch (error) {
      this.logger.error(`Error checking pending payment: ${error.message}`);
      return false;
    }
  }

  /**
   * CREATE PENDING PAYMENT RECORD
   * 
   * Create a payment record when payment is initialized
   */
  async createPendingPaymentRecord(data: {
    tenantId: string;
    amount: number;
    paystackReference: string;
    description?: string;
    metadata?: any;
  }) {
    try {
      // Get tenant's property and unit info from invitation
      const [invitation] = await this.db
        .select()
        .from(schema.tenantInvitations)
        .where(
          and(
            eq(schema.tenantInvitations.tenantId, data.tenantId),
            eq(schema.tenantInvitations.status, 'accepted')
          )
        )
        .limit(1);

      if (!invitation) {
        throw new NotFoundException('Tenant invitation not found');
      }

      // Create payment record
      const [payment] = await this.db
        .insert(payments)
        .values({
          tenantId: data.tenantId,
          landlordId: invitation.landlordId,
          propertyId: invitation.propertyId,
          unitId: invitation.unitId,
          tenantInvitationId: invitation.id,
          amount: data.amount.toString(),
          amountPaid: '0',
          dueDate: new Date(),
          paymentType: 'rent',
          paymentMethod: 'online',
          status: 'pending',
          description: data.description || 'Rent payment',
          paystackReference: data.paystackReference,
          paystackStatus: 'pending',
          paymentGateway: 'paystack',
        })
        .returning();

      this.logger.log(`💾 Payment record created: ${payment.id} (${data.paystackReference})`);

      return payment;
    } catch (error) {
      this.logger.error(`Error creating payment record: ${error.message}`);
      throw error;
    }
  }

  /**
   * UPDATE PAYMENT STATUS
   * 
   * Update payment record based on Paystack verification
   */
  async updatePaymentStatus(
    paystackReference: string,
    paystackStatus: string,
    paystackData: any
  ) {
    try {
      // Find payment by Paystack reference
      const [payment] = await this.db
        .select()
        .from(payments)
        .where(eq(payments.paystackReference, paystackReference))
        .limit(1);

      if (!payment) {
        this.logger.warn(`⚠️ Payment not found for reference: ${paystackReference}`);
        return null;
      }

      // IDEMPOTENCY CHECK: Don't process if already paid
      if (payment.status === 'paid') {
        this.logger.warn(`⚠️ Payment already processed: ${paystackReference}`);
        return payment;
      }

      // Map Paystack status to our payment status
      let newStatus: 'pending' | 'paid' | 'overdue' | 'partial' = 'pending';
      let paidDate: Date | null = null;
      let amountPaid = '0';

      if (paystackStatus === 'success') {
        // AMOUNT VALIDATION: Verify Paystack charged the correct amount
        const expectedAmountInNaira = parseFloat(payment.amount);
        
        // IMPORTANT: Paystack's verification API returns amount in Naira (already divided by 100)
        // NOT in kobo like the initialization API expects
        const paystackAmountInNaira = parseFloat(paystackData.amount);
        
        // Allow 1% tolerance for rounding errors
        const tolerance = expectedAmountInNaira * 0.01;
        const difference = Math.abs(expectedAmountInNaira - paystackAmountInNaira);
        
        this.logger.log(`💰 Amount validation:`);
        this.logger.log(`   Expected: ₦${expectedAmountInNaira}`);
        this.logger.log(`   Paystack: ₦${paystackAmountInNaira}`);
        this.logger.log(`   Difference: ₦${difference} (tolerance: ₦${tolerance})`);
        
        if (difference > tolerance) {
          this.logger.error(
            `❌ AMOUNT MISMATCH! Expected: ₦${expectedAmountInNaira}, ` +
            `Got: ₦${paystackAmountInNaira}`
          );
          throw new Error(
            `Payment amount mismatch. Expected ₦${expectedAmountInNaira}, but Paystack processed ₦${paystackAmountInNaira}`
          );
        }

        newStatus = 'paid';
        paidDate = new Date(paystackData.paid_at || new Date());
        // Use the original payment amount from our DB (source of truth)
        amountPaid = payment.amount;
        
        this.logger.log(`✅ Payment validated and marked as paid: ₦${amountPaid}`);
      } else if (paystackStatus === 'failed') {
        newStatus = 'pending'; // Keep as pending so they can retry
      }

      // Update payment record
      const [updatedPayment] = await this.db
        .update(payments)
        .set({
          status: newStatus,
          paystackStatus: paystackStatus,
          paidDate: paidDate,
          amountPaid: amountPaid,
          receiptNumber: paystackData.reference,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();

      this.logger.log(`✅ Payment updated: ${payment.id} -> ${newStatus}`);

      // If payment is successful, credit landlord wallet
      if (newStatus === 'paid') {
        await this.walletService.credit(
          payment.landlordId,
          parseFloat(amountPaid),
          {
            type: 'rent_payment',
            paymentId: payment.id,
            reference: paystackReference,
            description: `Rent payment from tenant - ${paystackReference}`,
          }
        );
        this.logger.log(`💰 Landlord wallet credited: ${payment.landlordId}`);
      }

      return updatedPayment;
    } catch (error) {
      this.logger.error(`Error updating payment status: ${error.message}`);
      throw error;
    }
  }
}

