import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import * as request from 'supertest';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { eq, and } from 'drizzle-orm';

import { TenantRentContractsModule } from './tenant-rent-contracts.module';
import { DatabaseModule } from '../database/database.module';
import { EmailModule } from '../email/email.module';
import { TenantPaymentService } from './tenant-payment.service';
import { LandlordPayoutService } from './landlord-payout.service';
import { SchedulerService } from './scheduler.service';

import { 
  tenantRentContracts, 
  landlordEscrowBalances, 
  paymentNotifications,
  users,
  properties,
  units,
  payments
} from '../database/schema';
import { LandlordPayoutType, ContractStatus } from './dto/tenant-rent-contract.dto';

describe('Tenant Rent Contracts Integration Tests', () => {
  let app: INestApplication;
  let module: TestingModule;
  let tenantPaymentService: TenantPaymentService;
  let landlordPayoutService: LandlordPayoutService;
  let schedulerService: SchedulerService;
  
  let db: any;
  let pool: Pool;
  
  // Test data
  let testLandlord: any;
  let testTenant: any;
  let testProperty: any;
  let testUnit: any;

  beforeAll(async () => {
    // Setup test database connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/homezy_test_db',
    });
    db = drizzle(pool);

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        DatabaseModule,
        EmailModule,
        TenantRentContractsModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    tenantPaymentService = module.get<TenantPaymentService>(TenantPaymentService);
    landlordPayoutService = module.get<LandlordPayoutService>(LandlordPayoutService);
    schedulerService = module.get<SchedulerService>(SchedulerService);

    // Create test users, property, and unit
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
    await pool.end();
  });

  beforeEach(async () => {
    // Clean up contracts and related data before each test
    await db.delete(paymentNotifications);
    await db.delete(landlordEscrowBalances);
    await db.delete(tenantRentContracts);
  });

  async function setupTestData() {
    // Create test landlord
    const [landlord] = await db.insert(users).values({
      firstName: 'Test',
      lastName: 'Landlord',
      email: 'test.landlord@integration.com',
      password: 'hashedpassword',
      phoneNumber: '+1234567890',
      role: 'landlord',
    }).returning();

    // Create test tenant
    const [tenant] = await db.insert(users).values({
      firstName: 'Test',
      lastName: 'Tenant',
      email: 'test.tenant@integration.com',
      password: 'hashedpassword',
      phoneNumber: '+1234567891',
      role: 'tenant',
    }).returning();

    // Create test property
    const [property] = await db.insert(properties).values({
      landlordId: landlord.id,
      name: 'Integration Test Property',
      address: '123 Integration St',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      propertyType: 'apartment',
    }).returning();

    // Create test unit
    const [unit] = await db.insert(units).values({
      propertyId: property.id,
      unitNumber: '101',
      bedrooms: 2,
      bathrooms: '1.5',
      rent: '2500.00',
    }).returning();

    testLandlord = landlord;
    testTenant = tenant;
    testProperty = property;
    testUnit = unit;
  }

  async function cleanupTestData() {
    try {
      await db.delete(paymentNotifications);
      await db.delete(landlordEscrowBalances);
      await db.delete(tenantRentContracts);
      await db.delete(units).where(eq(units.id, testUnit?.id));
      await db.delete(properties).where(eq(properties.id, testProperty?.id));
      await db.delete(users).where(eq(users.id, testLandlord?.id));
      await db.delete(users).where(eq(users.id, testTenant?.id));
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  }

  describe('Contract Creation Flow', () => {
    it('should create a new tenant contract with monthly payout', async () => {
      const contractData = {
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      };

      const contract = await tenantPaymentService.createRentContract(contractData);

      expect(contract).toBeDefined();
      expect(contract.id).toBeDefined();
      expect(contract.tenantId).toBe(testTenant.id);
      expect(contract.landlordId).toBe(testLandlord.id);
      expect(contract.landlordPayoutType).toBe(LandlordPayoutType.MONTHLY);
      expect(contract.status).toBe('active');
      expect(contract.nextPaymentDue).toBeDefined();
      expect(contract.transitionStartDate).toBeDefined();

      // Verify transition start date is 3 months before expiry for monthly payout
      const expiryDate = new Date('2025-12-31T23:59:59.000Z');
      const expectedTransitionStart = new Date(expiryDate);
      expectedTransitionStart.setMonth(expectedTransitionStart.getMonth() - 3);
      
      expect(contract.transitionStartDate.getMonth()).toBe(expectedTransitionStart.getMonth());
    });

    it('should create a new tenant contract with yearly payout', async () => {
      const contractData = {
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.YEARLY,
        isExistingTenant: false,
      };

      const contract = await tenantPaymentService.createRentContract(contractData);

      expect(contract.landlordPayoutType).toBe(LandlordPayoutType.YEARLY);

      // Verify transition start date is 6 months before expiry for yearly payout
      const expiryDate = new Date('2025-12-31T23:59:59.000Z');
      const expectedTransitionStart = new Date(expiryDate);
      expectedTransitionStart.setMonth(expectedTransitionStart.getMonth() - 6);
      
      expect(contract.transitionStartDate.getMonth()).toBe(expectedTransitionStart.getMonth());
    });

    it('should create existing tenant contract with original expiry date', async () => {
      const contractData = {
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: true,
        originalExpiryDate: new Date('2025-06-30T23:59:59.000Z'),
      };

      const contract = await tenantPaymentService.createRentContract(contractData);

      expect(contract.isExistingTenant).toBe(true);
      expect(contract.originalExpiryDate).toBeDefined();
      expect(new Date(contract.originalExpiryDate!).getTime()).toBe(
        new Date('2025-06-30T23:59:59.000Z').getTime()
      );
    });

    it('should prevent duplicate active contracts for same tenant', async () => {
      const contractData = {
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      };

      // Create first contract
      await tenantPaymentService.createRentContract(contractData);

      // Attempt to create second contract for same tenant
      await expect(
        tenantPaymentService.createRentContract(contractData)
      ).rejects.toThrow('Tenant already has an active rent contract');
    });
  });

  describe('Payment Processing Flow', () => {
    let monthlyContract: any;
    let yearlyContract: any;

    beforeEach(async () => {
      // Create contracts for testing
      monthlyContract = await tenantPaymentService.createRentContract({
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      });

      // Create a second tenant for yearly contract
      const [yearlyTenant] = await db.insert(users).values({
        firstName: 'Yearly',
        lastName: 'Tenant',
        email: 'yearly.tenant@integration.com',
        password: 'hashedpassword',
        phoneNumber: '+1234567892',
        role: 'tenant',
      }).returning();

      yearlyContract = await tenantPaymentService.createRentContract({
        tenantId: yearlyTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.YEARLY,
        isExistingTenant: false,
      });
    });

    it('should process monthly payment with immediate payout', async () => {
      const paymentResult = await tenantPaymentService.processMonthlyPayment(
        monthlyContract.id,
        2500,
        'card',
        'test-ref-123'
      );

      expect(paymentResult.success).toBe(true);
      expect(paymentResult.payoutType).toBe(LandlordPayoutType.MONTHLY);
      expect(paymentResult.message).toContain('immediately');

      // Verify next payment due was updated
      const updatedContract = await tenantPaymentService.getContractById(monthlyContract.id);
      const originalDue = new Date(monthlyContract.nextPaymentDue);
      const newDue = new Date(updatedContract.nextPaymentDue);
      
      expect(newDue.getMonth()).toBe((originalDue.getMonth() + 1) % 12);
    });

    it('should process monthly payment with escrow accumulation', async () => {
      const paymentResult = await tenantPaymentService.processMonthlyPayment(
        yearlyContract.id,
        2500,
        'card',
        'test-ref-456'
      );

      expect(paymentResult.success).toBe(true);
      expect(paymentResult.payoutType).toBe(LandlordPayoutType.YEARLY);
      expect(paymentResult.message).toContain('escrow');

      // Verify escrow balance was created
      const escrowBalances = await landlordPayoutService.getLandlordEscrowBalances(testLandlord.id);
      expect(escrowBalances).toHaveLength(1);
      expect(parseFloat(escrowBalances[0].totalEscrowed)).toBe(2500);
      expect(escrowBalances[0].monthsAccumulated).toBe(1);
    });

    it('should accumulate multiple payments in escrow', async () => {
      // First payment
      await tenantPaymentService.processMonthlyPayment(yearlyContract.id, 2500);
      
      // Second payment
      await tenantPaymentService.processMonthlyPayment(yearlyContract.id, 2500);

      // Verify escrow accumulation
      const escrowBalances = await landlordPayoutService.getLandlordEscrowBalances(testLandlord.id);
      expect(escrowBalances).toHaveLength(1);
      expect(parseFloat(escrowBalances[0].totalEscrowed)).toBe(5000);
      expect(escrowBalances[0].monthsAccumulated).toBe(2);
    });

    it('should reject payment with incorrect amount', async () => {
      await expect(
        tenantPaymentService.processMonthlyPayment(monthlyContract.id, 2000) // Wrong amount
      ).rejects.toThrow('Payment amount 2000 does not match expected monthly amount 2500');
    });

    it('should reject payment that is too early', async () => {
      // Set next payment due to far future
      await db.update(tenantRentContracts)
        .set({ nextPaymentDue: new Date('2025-12-01T00:00:00.000Z') })
        .where(eq(tenantRentContracts.id, monthlyContract.id));

      await expect(
        tenantPaymentService.processMonthlyPayment(monthlyContract.id, 2500)
      ).rejects.toThrow('Payment is too early');
    });
  });

  describe('Escrow Release Flow', () => {
    let yearlyContract: any;
    let escrowBalance: any;

    beforeEach(async () => {
      // Create yearly contract
      yearlyContract = await tenantPaymentService.createRentContract({
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-01-31T23:59:59.000Z'), // Near future for testing
        landlordPayoutType: LandlordPayoutType.YEARLY,
        isExistingTenant: false,
      });

      // Add some payments to escrow
      await tenantPaymentService.processMonthlyPayment(yearlyContract.id, 2500);
      await tenantPaymentService.processMonthlyPayment(yearlyContract.id, 2500);
      await tenantPaymentService.processMonthlyPayment(yearlyContract.id, 2500);

      const escrowBalances = await landlordPayoutService.getLandlordEscrowBalances(testLandlord.id);
      escrowBalance = escrowBalances[0];
    });

    it('should release escrow balance when contract expires', async () => {
      // Set escrow to be ready for release (past expected release date)
      await db.update(landlordEscrowBalances)
        .set({ expectedReleaseDate: new Date('2024-01-01T00:00:00.000Z') }) // Past date
        .where(eq(landlordEscrowBalances.id, escrowBalance.id));

      const releaseResults = await landlordPayoutService.checkEscrowReleases();

      expect(releaseResults).toHaveLength(1);
      expect(releaseResults[0].success).toBe(true);
      expect(releaseResults[0].releasedAmount).toBe(7500); // 3 payments of 2500
      expect(releaseResults[0].landlordId).toBe(testLandlord.id);

      // Verify escrow is marked as released
      const [updatedEscrow] = await db.select()
        .from(landlordEscrowBalances)
        .where(eq(landlordEscrowBalances.id, escrowBalance.id));

      expect(updatedEscrow.isReleased).toBe(true);
      expect(updatedEscrow.releasedAt).toBeDefined();
      expect(parseFloat(updatedEscrow.releasedAmount!)).toBe(7500);
    });

    it('should force release escrow for early termination', async () => {
      const releaseResult = await landlordPayoutService.forceReleaseEscrow(
        yearlyContract.id,
        'Early contract termination'
      );

      expect(releaseResult.success).toBe(true);
      expect(releaseResult.releasedAmount).toBe(7500);
      expect(releaseResult.landlordId).toBe(testLandlord.id);
    });

    it('should calculate total escrowed amount correctly', async () => {
      const totalEscrowed = await landlordPayoutService.getTotalEscrowedAmount(testLandlord.id);
      expect(totalEscrowed).toBe(7500);

      // After release, total should be 0
      await landlordPayoutService.forceReleaseEscrow(yearlyContract.id);
      const totalAfterRelease = await landlordPayoutService.getTotalEscrowedAmount(testLandlord.id);
      expect(totalAfterRelease).toBe(0);
    });
  });

  describe('Contract Status Management', () => {
    let testContract: any;

    beforeEach(async () => {
      testContract = await tenantPaymentService.createRentContract({
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      });
    });

    it('should update contract status', async () => {
      const updatedContract = await tenantPaymentService.updateContractStatus(
        testContract.id,
        ContractStatus.TERMINATED
      );

      expect(updatedContract.status).toBe('terminated');
      expect(updatedContract.updatedAt).toBeDefined();
    });

    it('should mark contract as expired when payment would exceed expiry', async () => {
      // Create contract that expires soon
      const shortContract = await tenantPaymentService.createRentContract({
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2024-12-15T23:59:59.000Z'), // Expires soon
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      });

      // Set next payment due close to expiry
      await db.update(tenantRentContracts)
        .set({ nextPaymentDue: new Date('2024-12-01T00:00:00.000Z') })
        .where(eq(tenantRentContracts.id, shortContract.id));

      // Update next payment due - should mark as expired
      await tenantPaymentService.updateNextPaymentDue(shortContract.id);

      const updatedContract = await tenantPaymentService.getContractById(shortContract.id);
      expect(updatedContract.status).toBe('expired');
    });

    it('should get contracts with due payments', async () => {
      // Set payment due to today
      const today = new Date();
      await db.update(tenantRentContracts)
        .set({ nextPaymentDue: today })
        .where(eq(tenantRentContracts.id, testContract.id));

      const dueContracts = await tenantPaymentService.getContractsWithDuePayments(today);
      expect(dueContracts).toHaveLength(1);
      expect(dueContracts[0].id).toBe(testContract.id);
    });

    it('should get expiring contracts', async () => {
      // Create contract expiring soon
      const expiringContract = await tenantPaymentService.createRentContract({
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        landlordPayoutType: LandlordPayoutType.YEARLY,
        isExistingTenant: false,
      });

      const expiringContracts = await tenantPaymentService.getExpiringContracts(7);
      expect(expiringContracts).toHaveLength(1);
      expect(expiringContracts[0].id).toBe(expiringContract.id);
    });
  });

  describe('Scheduler Service Integration', () => {
    let testContract: any;

    beforeEach(async () => {
      testContract = await tenantPaymentService.createRentContract({
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      });
    });

    it('should check due payments without errors', async () => {
      // Set payment as due
      const today = new Date();
      await db.update(tenantRentContracts)
        .set({ nextPaymentDue: today })
        .where(eq(tenantRentContracts.id, testContract.id));

      // Should not throw error
      await expect(schedulerService.checkDuePayments()).resolves.not.toThrow();
    });

    it('should send payment reminders without errors', async () => {
      // Set payment as due
      const today = new Date();
      await db.update(tenantRentContracts)
        .set({ nextPaymentDue: today })
        .where(eq(tenantRentContracts.id, testContract.id));

      // Should not throw error
      await expect(schedulerService.sendPaymentReminders()).resolves.not.toThrow();
    });

    it('should process escrow releases without errors', async () => {
      // Should not throw error even with no escrow to release
      await expect(schedulerService.processEscrowReleases()).resolves.not.toThrow();
    });

    it('should update overdue payment statuses without errors', async () => {
      // Set payment as overdue
      const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      await db.update(tenantRentContracts)
        .set({ nextPaymentDue: pastDate })
        .where(eq(tenantRentContracts.id, testContract.id));

      // Should not throw error
      await expect(schedulerService.updateOverduePaymentStatuses()).resolves.not.toThrow();
    });

    it('should get payment due summary', async () => {
      // Set payment as due
      const today = new Date();
      await db.update(tenantRentContracts)
        .set({ nextPaymentDue: today })
        .where(eq(tenantRentContracts.id, testContract.id));

      const summary = await schedulerService.getPaymentDueSummary();

      expect(summary).toBeDefined();
      expect(summary.totalDue).toBe(2500);
      expect(summary.contractsWithDuePayments).toBe(1);
      expect(summary.totalOverdue).toBe(0);
      expect(summary.contractsWithOverduePayments).toBe(0);
    });

    it('should get scheduler health status', async () => {
      const health = await schedulerService.getSchedulerHealth();

      expect(health).toBeDefined();
      expect(health.status).toBeDefined();
      expect(health.metrics).toBeDefined();
      expect(health.metrics.totalContracts).toBeGreaterThanOrEqual(1);
      expect(health.metrics.activeContracts).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Query and Filtering', () => {
    let contract1: any;
    let contract2: any;
    let secondLandlord: any;

    beforeEach(async () => {
      // Create second landlord
      const [landlord2] = await db.insert(users).values({
        firstName: 'Second',
        lastName: 'Landlord',
        email: 'second.landlord@integration.com',
        password: 'hashedpassword',
        phoneNumber: '+1234567893',
        role: 'landlord',
      }).returning();
      secondLandlord = landlord2;

      // Create contracts for different landlords
      contract1 = await tenantPaymentService.createRentContract({
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      });

      // Create second property for second landlord
      const [property2] = await db.insert(properties).values({
        landlordId: secondLandlord.id,
        name: 'Second Property',
        address: '456 Second St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        propertyType: 'house',
      }).returning();

      const [unit2] = await db.insert(units).values({
        propertyId: property2.id,
        unitNumber: '201',
        bedrooms: 3,
        bathrooms: '2',
        rent: '3000.00',
      }).returning();

      // Create second tenant
      const [tenant2] = await db.insert(users).values({
        firstName: 'Second',
        lastName: 'Tenant',
        email: 'second.tenant@integration.com',
        password: 'hashedpassword',
        phoneNumber: '+1234567894',
        role: 'tenant',
      }).returning();

      contract2 = await tenantPaymentService.createRentContract({
        tenantId: tenant2.id,
        landlordId: secondLandlord.id,
        propertyId: property2.id,
        unitId: unit2.id,
        monthlyAmount: 3000,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.YEARLY,
        isExistingTenant: false,
      });
    });

    it('should filter contracts by landlord', async () => {
      const landlord1Contracts = await tenantPaymentService.getActiveContracts(undefined, testLandlord.id);
      const landlord2Contracts = await tenantPaymentService.getActiveContracts(undefined, secondLandlord.id);

      expect(landlord1Contracts).toHaveLength(1);
      expect(landlord1Contracts[0].id).toBe(contract1.id);

      expect(landlord2Contracts).toHaveLength(1);
      expect(landlord2Contracts[0].id).toBe(contract2.id);
    });

    it('should filter contracts by tenant', async () => {
      const tenant1Contracts = await tenantPaymentService.getActiveContracts(testTenant.id);
      expect(tenant1Contracts).toHaveLength(1);
      expect(tenant1Contracts[0].id).toBe(contract1.id);
    });

    it('should get all contracts without filter', async () => {
      const allContracts = await tenantPaymentService.getActiveContracts();
      expect(allContracts.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter contracts by property', async () => {
      const propertyContracts = await tenantPaymentService.getActiveContractsWithQuery({
        propertyId: testProperty.id
      });

      expect(propertyContracts).toHaveLength(1);
      expect(propertyContracts[0].id).toBe(contract1.id);
    });

    it('should get all contracts including inactive ones', async () => {
      // Terminate one contract
      await tenantPaymentService.updateContractStatus(contract1.id, ContractStatus.TERMINATED);

      const allContracts = await tenantPaymentService.getAllContracts();
      const activeContracts = await tenantPaymentService.getActiveContracts();

      expect(allContracts.length).toBeGreaterThanOrEqual(2);
      expect(activeContracts).toHaveLength(1); // Only contract2 should be active
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle non-existent contract gracefully', async () => {
      await expect(
        tenantPaymentService.getContractById('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('Rent contract not found');
    });

    it('should handle payment processing for non-existent contract', async () => {
      await expect(
        tenantPaymentService.processMonthlyPayment('00000000-0000-0000-0000-000000000000', 2500)
      ).rejects.toThrow('Rent contract not found');
    });

    it('should handle escrow release for non-existent escrow', async () => {
      await expect(
        landlordPayoutService.releaseEscrowBalance('00000000-0000-0000-0000-000000000000')
      ).rejects.toThrow('Escrow balance not found or already released');
    });

    it('should handle force release for contract with no escrow', async () => {
      const monthlyContract = await tenantPaymentService.createRentContract({
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      });

      await expect(
        landlordPayoutService.forceReleaseEscrow(monthlyContract.id)
      ).rejects.toThrow('No active escrow found for contract');
    });

    it('should validate contract creation with past expiry date', async () => {
      const invalidContractData = {
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2020-12-31T23:59:59.000Z'), // Past date
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      };

      await expect(
        tenantPaymentService.createRentContract(invalidContractData)
      ).rejects.toThrow('Contract expiry date must be in the future');
    });

    it('should validate existing tenant without original expiry date', async () => {
      const invalidContractData = {
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: true,
        // Missing originalExpiryDate
      };

      await expect(
        tenantPaymentService.createRentContract(invalidContractData)
      ).rejects.toThrow('Original expiry date is required for existing tenants');
    });

    it('should handle zero or negative monthly amount', async () => {
      const invalidContractData = {
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 0,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.MONTHLY,
        isExistingTenant: false,
      };

      await expect(
        tenantPaymentService.createRentContract(invalidContractData)
      ).rejects.toThrow('Monthly amount must be greater than 0');
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle multiple concurrent contract creations', async () => {
      // Create multiple tenants
      const tenants = await Promise.all([
        db.insert(users).values({
          firstName: 'Concurrent',
          lastName: 'Tenant1',
          email: 'concurrent1@integration.com',
          password: 'hashedpassword',
          phoneNumber: '+1234567895',
          role: 'tenant',
        }).returning(),
        db.insert(users).values({
          firstName: 'Concurrent',
          lastName: 'Tenant2',
          email: 'concurrent2@integration.com',
          password: 'hashedpassword',
          phoneNumber: '+1234567896',
          role: 'tenant',
        }).returning(),
        db.insert(users).values({
          firstName: 'Concurrent',
          lastName: 'Tenant3',
          email: 'concurrent3@integration.com',
          password: 'hashedpassword',
          phoneNumber: '+1234567897',
          role: 'tenant',
        }).returning(),
      ]);

      // Create contracts concurrently
      const contractPromises = tenants.map(([tenant]) =>
        tenantPaymentService.createRentContract({
          tenantId: tenant.id,
          landlordId: testLandlord.id,
          propertyId: testProperty.id,
          unitId: testUnit.id,
          monthlyAmount: 2500,
          expiryDate: new Date('2025-12-31T23:59:59.000Z'),
          landlordPayoutType: LandlordPayoutType.MONTHLY,
          isExistingTenant: false,
        })
      );

      const contracts = await Promise.all(contractPromises);

      expect(contracts).toHaveLength(3);
      contracts.forEach(contract => {
        expect(contract.id).toBeDefined();
        expect(contract.status).toBe('active');
      });
    });

    it('should handle concurrent payments to same escrow', async () => {
      const yearlyContract = await tenantPaymentService.createRentContract({
        tenantId: testTenant.id,
        landlordId: testLandlord.id,
        propertyId: testProperty.id,
        unitId: testUnit.id,
        monthlyAmount: 2500,
        expiryDate: new Date('2025-12-31T23:59:59.000Z'),
        landlordPayoutType: LandlordPayoutType.YEARLY,
        isExistingTenant: false,
      });

      // Process multiple payments concurrently
      const paymentPromises = [
        tenantPaymentService.processMonthlyPayment(yearlyContract.id, 2500),
        tenantPaymentService.processMonthlyPayment(yearlyContract.id, 2500),
        tenantPaymentService.processMonthlyPayment(yearlyContract.id, 2500),
      ];

      const results = await Promise.all(paymentPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.payoutType).toBe(LandlordPayoutType.YEARLY);
      });

      // Verify final escrow balance
      const escrowBalances = await landlordPayoutService.getLandlordEscrowBalances(testLandlord.id);
      expect(escrowBalances).toHaveLength(1);
      expect(parseFloat(escrowBalances[0].totalEscrowed)).toBe(7500);
      expect(escrowBalances[0].monthsAccumulated).toBe(3);
    });
  });
});