# Facilitator Assignment Display - Fix

## Issue
The maintenance detail page was showing "Assigned to: Banga Banga (Landlord)" even when there was no facilitator assigned to the property. This was confusing because we don't "assign" to landlords - landlords are the default owners.

## Root Cause
The backend was setting `assignedTo = landlordId` when no facilitator existed, and the frontend was displaying this as an assignment. However, landlords are the default owners, not "assigned" personnel.

## Solution

### Backend Fix (`backend/src/messages/enhanced-messages.service.ts`)

**Before**:
```typescript
// Get assigned person details (facilitator or landlord)
let assignedToDetails = null;
if (request.assignedTo) {
  const [assignedUser] = await this.db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, request.assignedTo));

  if (assignedUser) {
    assignedToDetails = {
      name: `${assignedUser.firstName} ${assignedUser.lastName}`,
      role: assignedUser.role,
    };
  }
}
```

**After**:
```typescript
// Get property facilitator details (only show if property has facilitator)
let assignedToDetails = null;
const [propertyDetails] = await this.db
  .select({
    facilitatorId: properties.facilitatorId,
  })
  .from(properties)
  .where(eq(properties.id, request.propertyId));

// Only set assignedToDetails if property has a facilitator
if (propertyDetails?.facilitatorId) {
  const [facilitator] = await this.db
    .select({
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, propertyDetails.facilitatorId));

  if (facilitator) {
    assignedToDetails = {
      name: `${facilitator.firstName} ${facilitator.lastName}`,
      role: facilitator.role,
    };
  }
}
```

### Frontend Fix (`mobile/app/tenant-screens/complaint-detail.tsx`)

**Before**:
```typescript
{request.assignedToDetails && (
  <View style={styles.infoRow}>
    <MaterialIcons 
      name={request.assignedToDetails.role === 'facilitator' ? 'engineering' : 'person'} 
      size={20} 
      color={colors.secondary} 
    />
    <Text style={styles.infoLabel}>Assigned to:</Text>
    <Text style={styles.infoValue}>
      {request.assignedToDetails.name} 
      ({request.assignedToDetails.role === 'facilitator' ? 'Property Manager' : 'Landlord'})
    </Text>
  </View>
)}
```

**After**:
```typescript
{request.assignedToDetails && request.assignedToDetails.role === 'facilitator' && (
  <View style={styles.infoRow}>
    <MaterialIcons 
      name="engineering" 
      size={20} 
      color={colors.secondary} 
    />
    <Text style={styles.infoLabel}>Property Manager:</Text>
    <Text style={styles.infoValue}>
      {request.assignedToDetails.name}
    </Text>
  </View>
)}
```

## New Behavior

### Scenario 1: Property HAS Facilitator
**What Tenant Sees**:
```
Property Manager: John Smith
```
- Shows engineering icon
- Shows facilitator's name
- Clear that there's a property manager handling it

### Scenario 2: Property DOES NOT Have Facilitator
**What Tenant Sees**:
```
(No "Assigned to" or "Property Manager" field shown)
```
- No assignment info displayed
- Request goes to landlord by default
- Tenant doesn't need to know internal routing

## Why This Makes Sense

1. **Landlords are Owners, Not Assignees**:
   - Landlords own the property
   - They're not "assigned" to handle maintenance
   - They're the default responsible party

2. **Facilitators are Delegated Personnel**:
   - Facilitators are explicitly assigned by landlords
   - They're delegated to handle day-to-day operations
   - It's useful for tenants to know who their property manager is

3. **Cleaner UI**:
   - Only show assignment when there's actual delegation
   - Reduces confusion
   - Focuses on relevant information

## Data Flow

### With Facilitator
```
Tenant submits request
  → Backend checks property.facilitatorId
  → facilitatorId exists
  → assignedTo = facilitatorId
  → assignedToDetails = { name: "John Smith", role: "facilitator" }
  → Tenant sees: "Property Manager: John Smith"
```

### Without Facilitator
```
Tenant submits request
  → Backend checks property.facilitatorId
  → facilitatorId is null
  → assignedTo = landlordId (for internal routing)
  → assignedToDetails = null (don't expose to tenant)
  → Tenant sees: (no assignment field)
```

## Testing

### Test Case 1: Property with Facilitator
1. Admin assigns facilitator to property
2. Tenant submits maintenance request
3. Tenant views request details
4. ✅ Should see "Property Manager: [Facilitator Name]"

### Test Case 2: Property without Facilitator
1. Property has no facilitator assigned
2. Tenant submits maintenance request
3. Tenant views request details
4. ✅ Should NOT see any "Assigned to" or "Property Manager" field

### Test Case 3: Landlord View
1. Landlord views maintenance request
2. If property has facilitator:
   - ✅ Should see "Assigned to: [Facilitator Name]"
3. If property has no facilitator:
   - ✅ Should NOT see assignment field

## Files Modified

1. `backend/src/messages/enhanced-messages.service.ts`
   - Updated `getMaintenanceRequestById()` method
   - Only returns assignedToDetails if property has facilitator

2. `mobile/app/tenant-screens/complaint-detail.tsx`
   - Updated UI to only show assignment if role is facilitator
   - Changed label to "Property Manager" for clarity

## Status
✅ **FIXED** - Maintenance requests now correctly show facilitator assignment only when a facilitator is actually assigned to the property.

## Date
December 2, 2025
