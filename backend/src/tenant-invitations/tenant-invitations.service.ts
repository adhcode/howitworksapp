import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import { tenantInvitations, NewTenantInvitation, TenantInvitation, units, properties, users, leases } from '../database/schema';
import { LandlordPayoutType } from '../tenant-rent-contracts/dto/tenant-rent-contract.dto';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class TenantInvitationsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly usersService: UsersService,
  ) { }

  private generateInvitationToken(): string {
    // Generate a 6-digit alphanumeric code (easier for users to type)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createInvitation(invitationData: {
    landlordId: string;
    propertyId: string;
    unitId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nextOfKinName?: string;
    nextOfKinPhone?: string;
    leaseStartDate: string;
    leaseEndDate: string;
    monthlyRent: number;
    securityDeposit?: number;
    notes?: string;
    landlordPayoutType?: 'monthly' | 'yearly';
    isExistingTenant?: boolean;
    originalExpiryDate?: string;
  }): Promise<TenantInvitation> {
    // Check if unit exists and is available
    const [unit] = await this.db
      .select()
      .from(units)
      .where(and(
        eq(units.id, invitationData.unitId),
        eq(units.propertyId, invitationData.propertyId),
        eq(units.isAvailable, true)
      ));

    if (!unit) {
      throw new BadRequestException('Unit not found or not available');
    }

    // Check if there's already a pending invitation for this email and unit
    const existingInvitation = await this.db
      .select()
      .from(tenantInvitations)
      .where(and(
        eq(tenantInvitations.email, invitationData.email),
        eq(tenantInvitations.unitId, invitationData.unitId),
        eq(tenantInvitations.status, 'pending')
      ));

    if (existingInvitation.length > 0) {
      throw new BadRequestException('An invitation for this email and unit already exists');
    }

    // Generate invitation token
    const invitationToken = this.generateInvitationToken();

    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Debug logging to check the landlordId
    console.log('=== TENANT INVITATION DEBUG ===');
    console.log('Received landlordId:', invitationData.landlordId);
    console.log('Invitation data:', JSON.stringify(invitationData, null, 2));
    console.log('=== END DEBUG ===');

    // Build enhanced notes with contract information
    let enhancedNotes = invitationData.notes || '';
    
    if (invitationData.landlordPayoutType) {
      enhancedNotes += `${enhancedNotes ? ', ' : ''}Landlord Payout: ${invitationData.landlordPayoutType}`;
    }
    
    if (invitationData.isExistingTenant !== undefined) {
      enhancedNotes += `${enhancedNotes ? ', ' : ''}Existing Tenant: ${invitationData.isExistingTenant}`;
    }
    
    if (invitationData.originalExpiryDate) {
      enhancedNotes += `${enhancedNotes ? ', ' : ''}Original Expiry: ${invitationData.originalExpiryDate}`;
    }

    const newInvitation: NewTenantInvitation = {
      invitationToken,
      landlordId: invitationData.landlordId,
      propertyId: invitationData.propertyId,
      unitId: invitationData.unitId,
      firstName: invitationData.firstName,
      lastName: invitationData.lastName,
      email: invitationData.email,
      phone: invitationData.phone || '',
      emergencyContact: invitationData.nextOfKinName || null,
      emergencyPhone: invitationData.nextOfKinPhone || null,
      leaseStartDate: new Date(invitationData.leaseStartDate),
      leaseEndDate: new Date(invitationData.leaseEndDate),
      monthlyRent: invitationData.monthlyRent.toString(),
      securityDeposit: invitationData.securityDeposit?.toString() || null,
      notes: enhancedNotes || null,
      expiresAt,
    };

    // Create the invitation record with explicit field mapping
    const insertData = {
      invitationToken: invitationToken,
      landlordId: invitationData.landlordId,
      propertyId: invitationData.propertyId,
      unitId: invitationData.unitId,
      firstName: invitationData.firstName,
      lastName: invitationData.lastName,
      email: invitationData.email,
      phone: invitationData.phone || '',
      emergencyContact: invitationData.nextOfKinName || null,
      emergencyPhone: invitationData.nextOfKinPhone || null,
      leaseStartDate: new Date(invitationData.leaseStartDate),
      leaseEndDate: new Date(invitationData.leaseEndDate),
      monthlyRent: invitationData.monthlyRent.toString(),
      securityDeposit: invitationData.securityDeposit?.toString() || null,
      notes: enhancedNotes || null,
      expiresAt: expiresAt,
    };

    console.log('Insert data:', JSON.stringify(insertData, null, 2));

    const [invitation] = await this.db
      .insert(tenantInvitations)
      .values(insertData)
      .returning();



    // Mark unit as reserved (optional - you might want to keep it available until accepted)
    // await this.db
    //   .update(units)
    //   .set({ isAvailable: false })
    //   .where(eq(units.id, invitationData.unitId));

    return invitation;
  }

  async getInvitationByToken(token: string): Promise<TenantInvitation & { property: any; unit: any } | null> {
    const [invitation] = await this.db
      .select({
        invitation: tenantInvitations,
        property: properties,
        unit: units,
      })
      .from(tenantInvitations)
      .leftJoin(properties, eq(tenantInvitations.propertyId, properties.id))
      .leftJoin(units, eq(tenantInvitations.unitId, units.id))
      .where(eq(tenantInvitations.invitationToken, token));

    if (!invitation) {
      return null;
    }

    return {
      ...invitation.invitation,
      property: invitation.property,
      unit: invitation.unit,
    };
  }

  async acceptInvitation(token: string, tenantId: string): Promise<TenantInvitation> {
    const invitation = await this.getInvitationByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation is no longer valid');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    // Update invitation status
    const [updatedInvitation] = await this.db
      .update(tenantInvitations)
      .set({
        status: 'accepted',
        tenantId,
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tenantInvitations.invitationToken, token))
      .returning();

    // Mark unit as occupied
    await this.db
      .update(units)
      .set({ isAvailable: false })
      .where(eq(units.id, invitation.unitId));

    // Create lease record
    try {
      // Format dates as strings for date fields (not timestamp)
      const startDate = new Date(invitation.leaseStartDate);
      const endDate = new Date(invitation.leaseEndDate);
      
      await this.db.insert(leases).values({
        tenantId,
        landlordId: invitation.landlordId,
        propertyId: invitation.propertyId,
        unitId: invitation.unitId,
        startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        monthlyRent: invitation.monthlyRent,
        securityDeposit: invitation.securityDeposit,
        status: 'active',
        signedAt: new Date(),
      });
      console.log('✅ Lease created successfully for tenant:', tenantId);
    } catch (error) {
      console.error('❌ Error creating lease:', error);
      // Don't fail the invitation acceptance if lease creation fails
    }

    // Create rent contract if landlord payout preference is specified in notes
    try {
      await this.createRentContractFromInvitation(updatedInvitation, invitation);
    } catch (error) {
      console.error('Error creating rent contract:', error);
      // Don't fail the invitation acceptance if rent contract creation fails
    }

    // Payment schedules are now handled through the tenant_rent_contracts table
    // See ContractsService for creating contracts which manage payment schedules
    console.log('Payment schedules are now managed through rent contracts');

    return updatedInvitation;
  }

  /**
   * Create rent contract from accepted invitation
   */
  private async createRentContractFromInvitation(invitation: TenantInvitation, invitationDetails: any): Promise<void> {
    // Parse landlord payout preference and existing tenant status from notes
    const notes = invitation.notes || '';
    let landlordPayoutType = 'monthly'; // default
    let isExistingTenant = false;
    let originalExpiryDate: Date | null = null;

    // Parse notes for contract information
    // Expected format: "Payment Frequency: Monthly, Landlord Payout: yearly, Existing Tenant: true, Original Expiry: 2024-06-30"
    if (notes.includes('Landlord Payout:')) {
      const payoutMatch = notes.match(/Landlord Payout:\s*(monthly|yearly)/i);
      if (payoutMatch) {
        landlordPayoutType = payoutMatch[1].toLowerCase();
      }
    }

    if (notes.includes('Existing Tenant:')) {
      const existingMatch = notes.match(/Existing Tenant:\s*(true|false)/i);
      if (existingMatch) {
        isExistingTenant = existingMatch[1].toLowerCase() === 'true';
      }
    }

    if (notes.includes('Original Expiry:')) {
      const expiryMatch = notes.match(/Original Expiry:\s*(\d{4}-\d{2}-\d{2})/);
      if (expiryMatch) {
        originalExpiryDate = new Date(expiryMatch[1]);
      }
    }

    // Only create rent contract if we have the necessary information
    if (notes.includes('Landlord Payout:')) {
      // Import TenantPaymentService dynamically to avoid circular dependency
      const { TenantPaymentService } = await import('../tenant-rent-contracts/tenant-payment.service');
      const tenantPaymentService = new TenantPaymentService(this.db);

      const contractData = {
        tenantId: invitation.tenantId!,
        landlordId: invitation.landlordId,
        propertyId: invitation.propertyId,
        unitId: invitation.unitId,
        monthlyAmount: parseFloat(invitation.monthlyRent),
        expiryDate: invitation.leaseEndDate.toISOString(),
        landlordPayoutType: landlordPayoutType as LandlordPayoutType,
        isExistingTenant,
        originalExpiryDate: originalExpiryDate?.toISOString(),
      };

      await tenantPaymentService.createRentContract(contractData);
      console.log('Rent contract created successfully for invitation:', invitation.id);
    }
  }

  async getInvitationsByLandlord(landlordId: string): Promise<any[]> {
    try {
      console.log('🗄️ Querying database for invitations with landlordId:', landlordId);
      
      const invitations = await this.db
        .select({
          invitation: tenantInvitations,
          tenant: users, // Include tenant user data if they've accepted
        })
        .from(tenantInvitations)
        .leftJoin(users, eq(tenantInvitations.tenantId, users.id))
        .where(eq(tenantInvitations.landlordId, landlordId));
      
      console.log('🗄️ Database returned', invitations.length, 'invitations');
      
      // Merge invitation and tenant data, using real email if tenant has accepted
      const enrichedInvitations = invitations.map(({ invitation, tenant }) => ({
        ...invitation,
        // Override with real tenant data if they've accepted
        email: tenant?.email || invitation.email,
        phone: tenant?.phoneNumber || invitation.phone,
        // Add flag to indicate if using real data
        hasAcceptedAccount: !!tenant,
      }));
      
      return enrichedInvitations;
    } catch (error) {
      console.error('❌ Error getting invitations by landlord:', error);
      return [];
    }
  }

  async getAcceptedTenantsByLandlord(landlordId: string): Promise<any[]> {
    try {
      console.log('🔍 Getting accepted tenants for landlord:', landlordId);
      
      const acceptedInvitations = await this.db
        .select({
          invitation: tenantInvitations,
          property: properties,
          unit: units,
        })
        .from(tenantInvitations)
        .leftJoin(properties, eq(tenantInvitations.propertyId, properties.id))
        .leftJoin(units, eq(tenantInvitations.unitId, units.id))
        .where(and(
          eq(tenantInvitations.landlordId, landlordId),
          eq(tenantInvitations.status, 'accepted')
        ));

      console.log('🔍 Found accepted invitations:', acceptedInvitations.length);

      const result = acceptedInvitations.map(result => ({
        // Flatten invitation data to top level for easier access
        id: result.invitation.id,
        propertyId: result.invitation.propertyId,
        unitId: result.invitation.unitId,
        firstName: result.invitation.firstName,
        lastName: result.invitation.lastName,
        email: result.invitation.email,
        phone: result.invitation.phone,
        monthlyRent: result.invitation.monthlyRent,
        securityDeposit: result.invitation.securityDeposit,
        status: result.invitation.status,
        leaseStartDate: result.invitation.leaseStartDate,
        leaseEndDate: result.invitation.leaseEndDate,
        createdAt: result.invitation.createdAt,
        updatedAt: result.invitation.updatedAt,
        // Include nested objects
        property: result.property,
        unit: result.unit,
      }));

      console.log('🔍 Returning tenants:', result);
      return result;
    } catch (error) {
      console.error('❌ Error getting accepted tenants:', error);
      return [];
    }
  }

  async cancelInvitation(invitationId: string, landlordId: string): Promise<void> {
    const [invitation] = await this.db
      .select()
      .from(tenantInvitations)
      .where(and(
        eq(tenantInvitations.id, invitationId),
        eq(tenantInvitations.landlordId, landlordId)
      ));

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.db
      .update(tenantInvitations)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(tenantInvitations.id, invitationId));
  }

  async validateInvitationToken(token: string): Promise<boolean> {
    const invitation = await this.getInvitationByToken(token);

    if (!invitation) {
      return false;
    }

    if (invitation.status !== 'pending') {
      return false;
    }

    if (new Date() > invitation.expiresAt) {
      // Mark as expired
      await this.db
        .update(tenantInvitations)
        .set({
          status: 'expired',
          updatedAt: new Date(),
        })
        .where(eq(tenantInvitations.invitationToken, token));

      return false;
    }

    return true;
  }
}