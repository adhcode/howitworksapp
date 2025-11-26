import { Injectable, Inject, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, or, gte, lte, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../database/database.module';
import * as schema from '../../database/schema';
import { 
  tenantRentContracts, 
  NewTenantRentContract,
  TenantRentContract 
} from '../../database/schema/tenant-rent-contracts';
import { users, properties, units } from '../../database/schema';
import {
  CreateNewTenantContractDto,
  CreateExistingTenantContractDto,
  UpdateContractDto,
  ContractQueryDto,
  LandlordPayoutType,
} from './dto/create-contract.dto';
import { BUSINESS_RULES } from '../../shared/constants/business-rules.constant';
import { 
  startOfDay, 
  addMonths, 
  subMonths, 
  isBefore, 
  startOfMonth,
  startOfNextMonth,
  addDays,
} from '../../shared/utils/date.utils';

/**
 * CONTRACTS SERVICE
 * 
 * Core service for managing rental contracts.
 * Handles both new tenants (fresh leases) and existing tenants (transitioning from another lease).
 * 
 * Key responsibilities:
 * 1. Create contracts for new and existing tenants
 * 2. Calculate transition dates for existing tenants
 * 3. Calculate first payment due dates
 * 4. Manage contract lifecycle (active → expired → terminated)
 * 5. Validate contract data
 */
@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  /**
   * CREATE CONTRACT FOR NEW TENANT
   * 
   * New tenant = starting fresh lease, no existing lease elsewhere
   * 
   * Flow:
   * 1. Validate tenant, landlord, property, unit exist
   * 2. Check for duplicate active contracts
   * 3. Calculate first payment due date (1st of move-in month or next month)
   * 4. Create contract with status 'active'
   * 
   * @param dto - New tenant contract data
   * @returns Created contract
   */
  async createNewTenantContract(dto: CreateNewTenantContractDto): Promise<TenantRentContract> {
    this.logger.log(`Creating new tenant contract for tenant ${dto.tenantId}`);

    // Validate entities exist
    await this.validateEntities(dto.tenantId, dto.landlordId, dto.propertyId, dto.unitId);

    // Check for duplicate contracts
    await this.checkDuplicateContract(dto.tenantId, dto.propertyId, dto.unitId);

    // Parse dates
    const leaseStart = startOfDay(new Date(dto.leaseStartDate));
    const leaseEnd = startOfDay(new Date(dto.leaseEndDate));
    const today = startOfDay(new Date());

    // Validate lease dates
    if (isBefore(leaseEnd, leaseStart)) {
      throw new BadRequestException('Lease end date must be after start date');
    }

    // Calculate first payment due date
    // Payment is due on the 1st of the month
    // If lease starts on the 1st, payment due that day
    // If lease starts mid-month, payment due on 1st of next month
    const firstPaymentDue = this.calculateFirstPaymentDue(leaseStart);

    // Create contract
    const contractData: NewTenantRentContract = {
      tenantId: dto.tenantId,
      landlordId: dto.landlordId,
      propertyId: dto.propertyId,
      unitId: dto.unitId,
      monthlyAmount: dto.monthlyAmount.toFixed(2),
      expiryDate: leaseEnd,
      landlordPayoutType: dto.landlordPayoutType,
      nextPaymentDue: firstPaymentDue,
      transitionStartDate: leaseStart, // For new tenants, transition is same as lease start
      status: 'active',
      isExistingTenant: false,
      originalExpiryDate: null,
    };

    const [contract] = await this.db
      .insert(tenantRentContracts)
      .values(contractData)
      .returning();

    this.logger.log(`✅ Contract created: ${contract.id} | First payment due: ${firstPaymentDue.toDateString()}`);

    return contract;
  }

  /**
   * CREATE CONTRACT FOR EXISTING TENANT
   * 
   * Existing tenant = already has active lease elsewhere, transitioning to Homezy
   * 
   * Key business logic:
   * - If landlord wants MONTHLY payout: tenant starts paying 3 months before current lease expires
   * - If landlord wants YEARLY payout: tenant starts paying 6 months before current lease expires
   * - If transition date has passed, start immediately
   * 
   * Flow:
   * 1. Validate entities
   * 2. Calculate transition start date based on payout type
   * 3. If transition date passed, start immediately
   * 4. Calculate first payment due (1st of month)
   * 5. Set new lease end date (default: 1 year after current lease expiry)
   * 
   * @param dto - Existing tenant contract data
   * @returns Created contract
   */
  async createExistingTenantContract(dto: CreateExistingTenantContractDto): Promise<TenantRentContract> {
    this.logger.log(`Creating existing tenant contract for tenant ${dto.tenantId}`);

    // Validate entities exist
    await this.validateEntities(dto.tenantId, dto.landlordId, dto.propertyId, dto.unitId);

    // Check for duplicate contracts
    await this.checkDuplicateContract(dto.tenantId, dto.propertyId, dto.unitId);

    // Parse dates
    const currentLeaseExpiry = startOfDay(new Date(dto.currentLeaseExpiryDate));
    const today = startOfDay(new Date());

    // Validate current lease expiry is in the future
    if (isBefore(currentLeaseExpiry, today)) {
      throw new BadRequestException('Current lease expiry must be in the future');
    }

    // Calculate transition start date based on payout type
    const transitionStart = this.calculateTransitionStartDate(
      currentLeaseExpiry,
      dto.landlordPayoutType
    );

    this.logger.log(`Transition calculation:`);
    this.logger.log(`  Current lease expires: ${currentLeaseExpiry.toDateString()}`);
    this.logger.log(`  Payout type: ${dto.landlordPayoutType}`);
    this.logger.log(`  Transition starts: ${transitionStart.toDateString()}`);
    this.logger.log(`  Started ${isBefore(transitionStart, today) ? 'IMMEDIATELY' : 'in the FUTURE'}`);

    // Calculate first payment due date (1st of month)
    const firstPaymentDue = this.calculateFirstPaymentDue(transitionStart);

    // Determine new lease end date
    // Default: 1 year after current lease expiry
    const newLeaseEnd = dto.newLeaseEndDate
      ? startOfDay(new Date(dto.newLeaseEndDate))
      : addMonths(currentLeaseExpiry, 12);

    // Create contract
    const contractData: NewTenantRentContract = {
      tenantId: dto.tenantId,
      landlordId: dto.landlordId,
      propertyId: dto.propertyId,
      unitId: dto.unitId,
      monthlyAmount: dto.monthlyAmount.toFixed(2),
      expiryDate: newLeaseEnd,
      landlordPayoutType: dto.landlordPayoutType,
      nextPaymentDue: firstPaymentDue,
      transitionStartDate: transitionStart,
      status: 'active',
      isExistingTenant: true,
      originalExpiryDate: currentLeaseExpiry,
    };

    const [contract] = await this.db
      .insert(tenantRentContracts)
      .values(contractData)
      .returning();

    this.logger.log(`✅ Existing tenant contract created: ${contract.id}`);
    this.logger.log(`   First payment due: ${firstPaymentDue.toDateString()}`);
    this.logger.log(`   New lease ends: ${newLeaseEnd.toDateString()}`);

    return contract;
  }

  /**
   * CALCULATE TRANSITION START DATE FOR EXISTING TENANTS
   * 
   * Business rule:
   * - Monthly payout → Start 3 months before lease expiry
   * - Yearly payout → Start 6 months before lease expiry
   * - If calculated date is in the past → Start immediately (today)
   * 
   * @param leaseExpiryDate - When current lease expires
   * @param payoutType - Monthly or yearly
   * @returns Date when tenant should start paying
   */
  private calculateTransitionStartDate(
    leaseExpiryDate: Date,
    payoutType: LandlordPayoutType
  ): Date {
    const monthsBeforeExpiry =
      payoutType === LandlordPayoutType.MONTHLY
        ? BUSINESS_RULES.TRANSITION_PERIODS.MONTHLY_PAYOUT
        : BUSINESS_RULES.TRANSITION_PERIODS.YEARLY_PAYOUT;

    // Calculate X months before expiry
    const transitionDate = subMonths(leaseExpiryDate, monthsBeforeExpiry);

    // If that date has passed, start immediately
    const today = startOfDay(new Date());

    return isBefore(transitionDate, today) ? today : transitionDate;
  }

  /**
   * CALCULATE FIRST PAYMENT DUE DATE
   * 
   * Business rule: Payments are due on the 1st of each month
   * 
   * Logic:
   * - If transition/lease starts on the 1st → Payment due that day
   * - If transition/lease starts mid-month → Payment due on 1st of NEXT month
   * - If transition/lease starts after today → Payment due on 1st of that month or next
   * 
   * @param startDate - Lease start or transition start date
   * @returns First payment due date (always 1st of month)
   */
  private calculateFirstPaymentDue(startDate: Date): Date {
    const today = startOfDay(new Date());
    const effectiveStart = isBefore(startDate, today) ? today : startDate;

    // If starting on the 1st, payment due that day
    if (effectiveStart.getDate() === BUSINESS_RULES.PAYMENT_DUE_DAY) {
      return effectiveStart;
    }

    // Otherwise, payment due on 1st of next month
    return startOfNextMonth(effectiveStart);
  }

  /**
   * GET CONTRACT BY ID
   */
  async getContractById(contractId: string): Promise<TenantRentContract> {
    const [contract] = await this.db
      .select()
      .from(tenantRentContracts)
      .where(eq(tenantRentContracts.id, contractId))
      .limit(1);

    if (!contract) {
      throw new NotFoundException(`Contract ${contractId} not found`);
    }

    return contract;
  }

  /**
   * GET CONTRACTS BY QUERY
   */
  async getContracts(query: ContractQueryDto): Promise<TenantRentContract[]> {
    const conditions: any[] = [];

    if (query.tenantId) {
      conditions.push(eq(tenantRentContracts.tenantId, query.tenantId));
    }

    if (query.landlordId) {
      conditions.push(eq(tenantRentContracts.landlordId, query.landlordId));
    }

    if (query.propertyId) {
      conditions.push(eq(tenantRentContracts.propertyId, query.propertyId));
    }

    if (query.status) {
      conditions.push(eq(tenantRentContracts.status, query.status as any));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return this.db
      .select()
      .from(tenantRentContracts)
      .where(whereClause)
      .orderBy(sql`${tenantRentContracts.createdAt} DESC`);
  }

  /**
   * UPDATE CONTRACT
   */
  async updateContract(
    contractId: string,
    dto: UpdateContractDto
  ): Promise<TenantRentContract> {
    const contract = await this.getContractById(contractId);

    const updateData: Partial<NewTenantRentContract> = {
      updatedAt: new Date(),
    };

    if (dto.monthlyAmount !== undefined) {
      updateData.monthlyAmount = dto.monthlyAmount.toFixed(2);
    }

    if (dto.leaseEndDate !== undefined) {
      updateData.expiryDate = startOfDay(new Date(dto.leaseEndDate));
    }

    if (dto.landlordPayoutType !== undefined) {
      updateData.landlordPayoutType = dto.landlordPayoutType;
    }

    const [updated] = await this.db
      .update(tenantRentContracts)
      .set(updateData)
      .where(eq(tenantRentContracts.id, contractId))
      .returning();

    this.logger.log(`✅ Contract updated: ${contractId}`);

    return updated;
  }

  /**
   * TERMINATE CONTRACT
   */
  async terminateContract(contractId: string): Promise<TenantRentContract> {
    const contract = await this.getContractById(contractId);

    const [terminated] = await this.db
      .update(tenantRentContracts)
      .set({
        status: 'terminated',
        updatedAt: new Date(),
      })
      .where(eq(tenantRentContracts.id, contractId))
      .returning();

    this.logger.log(`✅ Contract terminated: ${contractId}`);

    return terminated;
  }

  /**
   * VALIDATE ENTITIES EXIST
   * Private helper to validate tenant, landlord, property, unit exist
   */
  private async validateEntities(
    tenantId: string,
    landlordId: string,
    propertyId: string,
    unitId: string
  ): Promise<void> {
    // Validate tenant exists
    const [tenant] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, tenantId), eq(users.role, 'tenant')))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    // Validate landlord exists
    const [landlord] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, landlordId), eq(users.role, 'landlord')))
      .limit(1);

    if (!landlord) {
      throw new NotFoundException(`Landlord ${landlordId} not found`);
    }

    // Validate property exists and belongs to landlord
    const [property] = await this.db
      .select()
      .from(properties)
      .where(and(
        eq(properties.id, propertyId),
        eq(properties.landlordId, landlordId)
      ))
      .limit(1);

    if (!property) {
      throw new NotFoundException(
        `Property ${propertyId} not found or doesn't belong to landlord ${landlordId}`
      );
    }

    // Validate unit exists and belongs to property
    const [unit] = await this.db
      .select()
      .from(units)
      .where(and(
        eq(units.id, unitId),
        eq(units.propertyId, propertyId)
      ))
      .limit(1);

    if (!unit) {
      throw new NotFoundException(
        `Unit ${unitId} not found or doesn't belong to property ${propertyId}`
      );
    }
  }

  /**
   * CHECK FOR DUPLICATE CONTRACT
   * Private helper to ensure tenant doesn't have multiple active contracts for same unit
   */
  private async checkDuplicateContract(
    tenantId: string,
    propertyId: string,
    unitId: string
  ): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(tenantRentContracts)
      .where(
        and(
          eq(tenantRentContracts.tenantId, tenantId),
          eq(tenantRentContracts.propertyId, propertyId),
          eq(tenantRentContracts.unitId, unitId),
          eq(tenantRentContracts.status, 'active')
        )
      )
      .limit(1);

    if (existing) {
      throw new BadRequestException(
        `Tenant already has an active contract for this unit. Contract ID: ${existing.id}`
      );
    }
  }
}

