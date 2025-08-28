import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../database/database.module';
import { tenantInvitations, NewTenantInvitation, TenantInvitation, units, properties } from '../database/schema';
import { UsersService } from '../users/users.service';
import { PaymentsService } from '../payments/payments.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class TenantInvitationsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly db: any,
    private readonly usersService: UsersService,
    private readonly paymentsService: PaymentsService,
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
      notes: invitationData.notes || null,
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
      notes: invitationData.notes || null,
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

    // Generate payment schedule for the tenant
    try {
      console.log('Generating payment schedule for invitation:', updatedInvitation.id);
      await this.paymentsService.generatePaymentSchedule(updatedInvitation.id);
      console.log('Payment schedule generated successfully');
    } catch (error) {
      console.error('Error generating payment schedule:', error);
      // Don't fail the invitation acceptance if payment schedule generation fails
    }

    return updatedInvitation;
  }

  async getInvitationsByLandlord(landlordId: string): Promise<TenantInvitation[]> {
    try {
      return await this.db
        .select()
        .from(tenantInvitations)
        .where(eq(tenantInvitations.landlordId, landlordId));
    } catch (error) {
      console.error('Error getting invitations by landlord:', error);
      return [];
    }
  }

  async getAcceptedTenantsByLandlord(landlordId: string): Promise<any[]> {
    try {
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

      return acceptedInvitations.map(result => ({
        ...result.invitation,
        property: result.property,
        unit: result.unit,
      }));
    } catch (error) {
      console.error('Error getting accepted tenants:', error);
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