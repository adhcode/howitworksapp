# API Methods Comparison: getMyInvitations() vs getTenantsByLandlord()

## Quick Answer
**Yes, `getMyInvitations()` works perfectly as the primary source!** It's actually better because it shows ALL invitations regardless of status.

## Detailed Comparison

### getMyInvitations()
**Endpoint:** `GET /tenant-invitations/my-invitations`  
**Backend Method:** `getInvitationsByLandlord(landlordId)`

**What it returns:**
```typescript
{
  id: string
  invitationToken: string  // ✅ INCLUDES TOKEN
  landlordId: string
  propertyId: string
  unitId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  monthlyRent: string
  leaseStartDate: Date
  leaseEndDate: Date
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'  // ✅ ALL STATUSES
  createdAt: Date
  expiresAt: Date
  hasAcceptedAccount: boolean
}
```

**Includes:**
- ✅ Pending invitations
- ✅ Accepted invitations
- ✅ Expired invitations
- ✅ Cancelled invitations
- ✅ Invitation tokens
- ✅ All invitation data

---

### getTenantsByLandlord()
**Endpoint:** `GET /tenant-invitations/my-tenants`  
**Backend Method:** `getAcceptedTenantsByLandlord(landlordId)`

**What it returns:**
```typescript
{
  id: string
  // ❌ NO TOKEN
  landlordId: string
  propertyId: string
  unitId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  monthlyRent: string
  leaseStartDate: Date
  leaseEndDate: Date
  status: 'accepted'  // ❌ ONLY ACCEPTED
  property: { ... }
  unit: { ... }
}
```

**Includes:**
- ✅ Accepted invitations only
- ❌ No pending invitations
- ❌ No expired invitations
- ❌ No cancelled invitations
- ❌ No invitation tokens
- ✅ Includes property and unit details

---

## Why getMyInvitations() is Better

### 1. Complete Visibility
```typescript
// getMyInvitations() - Shows everything
[
  { status: 'pending', token: 'ABC123' },   // ✅ Visible
  { status: 'accepted', token: 'XYZ789' },  // ✅ Visible
  { status: 'expired', token: 'DEF456' },   // ✅ Visible
  { status: 'cancelled', token: 'GHI012' }  // ✅ Visible
]

// getTenantsByLandlord() - Only accepted
[
  { status: 'accepted' }  // ✅ Visible
  // ❌ Pending not shown
  // ❌ Expired not shown
  // ❌ Cancelled not shown
]
```

### 2. Token Access
```typescript
// getMyInvitations() - Has tokens
invitation.invitationToken  // ✅ "ABC123"

// getTenantsByLandlord() - No tokens
invitation.invitationToken  // ❌ undefined
```

### 3. Immediate Visibility
```typescript
// Landlord creates invitation
createInvitation() → status: 'pending'

// With getMyInvitations()
loadData() → Shows immediately ✅

// With getTenantsByLandlord()
loadData() → Not shown until accepted ❌
```

---

## Backend Implementation

### getInvitationsByLandlord (powers getMyInvitations)
```typescript
async getInvitationsByLandlord(landlordId: string) {
  const invitations = await this.db
    .select({
      invitation: tenantInvitations,
      tenant: users  // Join with users if accepted
    })
    .from(tenantInvitations)
    .leftJoin(users, eq(tenantInvitations.tenantId, users.id))
    .where(eq(tenantInvitations.landlordId, landlordId));
  
  // Returns ALL invitations with ALL statuses
  return invitations.map(({ invitation, tenant }) => ({
    ...invitation,
    email: tenant?.email || invitation.email,  // Real email if accepted
    phone: tenant?.phoneNumber || invitation.phone,
    hasAcceptedAccount: !!tenant
  }));
}
```

### getAcceptedTenantsByLandlord (powers getTenantsByLandlord)
```typescript
async getAcceptedTenantsByLandlord(landlordId: string) {
  const acceptedInvitations = await this.db
    .select({
      invitation: tenantInvitations,
      property: properties,
      unit: units
    })
    .from(tenantInvitations)
    .leftJoin(properties, eq(tenantInvitations.propertyId, properties.id))
    .leftJoin(units, eq(tenantInvitations.unitId, units.id))
    .where(and(
      eq(tenantInvitations.landlordId, landlordId),
      eq(tenantInvitations.status, 'accepted')  // ❌ ONLY ACCEPTED
    ));
  
  // Returns ONLY accepted invitations
  return acceptedInvitations;
}
```

---

## Use Cases

### When to use getMyInvitations() ✅
- **Tenant management screens** - Show all invitations
- **Dashboard statistics** - Count all tenants
- **Token viewing** - Need access to tokens
- **Status tracking** - Need to see pending/expired
- **Unit availability** - Check if unit has invitation

### When to use getTenantsByLandlord() ⚠️
- **Legacy code** - Old implementation
- **When you only need accepted tenants** - Rare case
- **Not recommended** - Use getMyInvitations() and filter instead

---

## Migration Impact

### Before (using getTenantsByLandlord)
```typescript
// Problem: Only shows accepted tenants
const tenants = await getTenantsByLandlord()
// Result: [{ status: 'accepted' }]
// Missing: pending, expired, cancelled
```

### After (using getMyInvitations)
```typescript
// Solution: Shows all invitations
const invitations = await getMyInvitations()
// Result: [
//   { status: 'pending' },
//   { status: 'accepted' },
//   { status: 'expired' }
// ]

// Filter as needed
const active = invitations.filter(i => i.status === 'accepted')
const pending = invitations.filter(i => i.status === 'pending')
const excludeCancelled = invitations.filter(i => i.status !== 'cancelled')
```

---

## Data Consistency

### getMyInvitations() - Single Source of Truth ✅
```
tenant_invitations table
├── All invitations
├── All statuses
├── All tokens
└── Complete history
```

### getTenantsByLandlord() - Filtered View ⚠️
```
tenant_invitations table
└── WHERE status = 'accepted'  // Incomplete view
```

---

## Performance

Both methods query the same table with similar performance:

```typescript
// getMyInvitations()
SELECT * FROM tenant_invitations 
WHERE landlordId = ?
// Returns: ~10-100 rows typically

// getTenantsByLandlord()
SELECT * FROM tenant_invitations 
WHERE landlordId = ? AND status = 'accepted'
// Returns: ~5-50 rows typically
```

**Difference:** Negligible - both are fast indexed queries

---

## Recommendation

**Use `getMyInvitations()` everywhere** and filter in the frontend:

```typescript
// ✅ RECOMMENDED APPROACH
const allInvitations = await getMyInvitations()

// Filter as needed
const active = allInvitations.filter(i => i.status === 'accepted')
const pending = allInvitations.filter(i => i.status === 'pending')
const notCancelled = allInvitations.filter(i => i.status !== 'cancelled')

// Benefits:
// - Single API call
// - Complete data
// - Flexible filtering
// - Token access
// - Immediate visibility
```

---

## Summary

| Feature | getMyInvitations() | getTenantsByLandlord() |
|---------|-------------------|------------------------|
| All statuses | ✅ Yes | ❌ No (accepted only) |
| Tokens included | ✅ Yes | ❌ No |
| Pending visible | ✅ Yes | ❌ No |
| Immediate visibility | ✅ Yes | ❌ No |
| Complete data | ✅ Yes | ⚠️ Partial |
| Recommended | ✅ Yes | ❌ No |

**Conclusion:** `getMyInvitations()` is the superior choice and works perfectly for getting tenants by landlord!
