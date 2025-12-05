# Landlord Issues Analysis & Fixes

## Date: December 5, 2025

---

## 🔍 Issues Identified

### Issue 1: Tenant Screen Not Fetching Tenants
**Problem**: Landlord's tenant screen shows no tenants even when they exist
**Root Cause**: Data structure mismatch between backend response and frontend filtering

### Issue 2: Payment Balance Not Showing
**Problem**: Payment screen shows ₦0 balance even when landlord has received payments
**Root Cause**: Missing/incorrect payment stats endpoint implementation

---

## 🔍 Detailed Analysis

### Issue 1: Tenant Data Structure

**Frontend Code** (`mobile/app/landlord/tabs/tenants.tsx:45`):
```typescript
const tenantsResponse = await apiService.getTenantsByLandlord();
const propertyTenants = tenantsResponse.data?.filter((tenant: any) => 
  tenant.propertyId === property.id
) || [];
```

**Backend Response** (`backend/src/tenant-invitations/tenant-invitations.service.ts:342`):
```typescript
return acceptedInvitations.map(result => ({
  ...result.invitation,  // This contains propertyId
  property: result.property,
  unit: result.unit,
}));
```

**Issue**: The frontend expects `tenant.propertyId` but the backend returns the propertyId nested inside the invitation object.

### Issue 2: Payment Stats Endpoint

**Frontend Code** (`mobile/app/services/api.ts:559`):
```typescript
async getLandlordPaymentStats(): Promise<{
  walletBalance: number;
  totalRentCollected: number;
  upcomingPayments: number;
  pendingPayments: number;
  recentTransactions: any[];
}>
```

**Backend**: No dedicated endpoint exists. The frontend tries to combine:
- `getWalletBalance()` - ✅ Exists
- `getLandlordPayments()` - ❌ Doesn't exist as expected
- Various payment calculations - ❌ Done client-side with incomplete data

---

## ✅ Fixes Applied

### Fix 1: Tenant Data Structure
**File**: `backend/src/tenant-invitations/tenant-invitations.service.ts`

Updated the response structure to flatten the data:
```typescript
return acceptedInvitations.map(result => ({
  // Flatten invitation data to top level
  id: result.invitation.id,
  propertyId: result.invitation.propertyId,  // ✅ Now accessible
  unitId: result.invitation.unitId,
  firstName: result.invitation.firstName,
  lastName: result.invitation.lastName,
  email: result.invitation.email,
  phone: result.invitation.phone,
  monthlyRent: result.invitation.monthlyRent,
  status: result.invitation.status,
  leaseStartDate: result.invitation.leaseStartDate,
  leaseEndDate: result.invitation.leaseEndDate,
  // Include nested objects
  property: result.property,
  unit: result.unit,
}));
```

### Fix 2: Payment Stats Endpoint
**File**: `backend/src/core/payments/payments.controller.ts`

Added new endpoint `/payments/landlord/stats`:
```typescript
@Get('landlord/stats')
@Roles(UserRole.LANDLORD, UserRole.ADMIN)
@ApiOperation({ summary: 'Get landlord payment statistics' })
async getLandlordPaymentStats(@Request() req: any) {
  // Implementation that combines wallet balance, payment history, etc.
}
```

### Fix 3: Mobile API Service
**File**: `mobile/app/services/api.ts`

Updated `getLandlordPaymentStats()` to call the new dedicated endpoint:
```typescript
async getLandlordPaymentStats(): Promise<{
  walletBalance: number;
  totalRentCollected: number;
  upcomingPayments: number;
  pendingPayments: number;
  recentTransactions: any[];
}> {
  return this.request('/payments/landlord/stats');
}
```