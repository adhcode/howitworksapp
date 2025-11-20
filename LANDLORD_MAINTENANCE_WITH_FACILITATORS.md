# 🔧 Landlord Maintenance with Facilitator Flow

## Updated Business Model

```
┌─────────────┐    Report Issue    ┌──────────────┐    Auto-Assign    ┌─────────────┐
│  Landlord   │ ──────────────────► │ Your Company │ ─────────────────► │ Facilitator │
└─────────────┘                    └──────────────┘                    └─────────────┘
                                           │                                    │
                                           ▼                                    ▼
┌─────────────┐    Report Issue    ┌──────────────┐    Same Facilitator ┌─────────────┐
│   Tenant    │ ──────────────────► │ Your Company │ ─────────────────► │ Facilitator │
└─────────────┘                    └──────────────┘                    └─────────────┘
```

## Key Flow Changes

### 1. Property-Facilitator Assignment
- **Admin assigns facilitator** to each property (`properties.facilitatorId`)
- **All maintenance** for that property goes to the assigned facilitator
- **Both landlord and tenant** maintenance requests go to the same facilitator

### 2. Automatic Assignment
- When landlord reports maintenance → automatically assigned to property's facilitator
- When tenant reports maintenance → automatically assigned to property's facilitator
- **No manual assignment needed** - it's based on property relationship

### 3. Streamlined Communication
- Landlord interacts with facilitator (not tenant directly)
- Tenant interacts with facilitator (not landlord directly)
- Facilitator handles all coordination for the property

---

## Updated Backend Implementation

### Database Schema
```sql
-- Properties table has facilitator assignment
properties {
  id: uuid,
  landlord_id: uuid,
  facilitator_id: uuid,  -- Key: Assigned facilitator
  name: varchar,
  ...
}

-- Maintenance requests auto-assign to property facilitator
maintenance_requests {
  id: uuid,
  tenant_id: uuid,      -- Reporter (could be landlord or tenant)
  landlord_id: uuid,    -- Property owner
  property_id: uuid,    -- Property
  assigned_to: uuid,    -- Auto-set to property.facilitator_id
  ...
}
```

### Updated Landlord Service Methods

#### 1. Report Maintenance
```typescript
async reportMaintenance(landlordId, maintenanceData) {
  // 1. Verify property belongs to landlord
  // 2. Check if property has assigned facilitator
  // 3. Auto-assign maintenance to property's facilitator
  // 4. Return success with facilitator info
}
```

**Key Changes:**
- ✅ Validates property has facilitator before allowing report
- ✅ Auto-assigns to `property.facilitatorId`
- ✅ Returns facilitator name in response
- ❌ Throws error if no facilitator assigned

#### 2. Get Maintenance Requests
```typescript
async getMaintenanceRequests(landlordId, filters) {
  // Returns maintenance for landlord's properties with:
  // - Reporter info (landlord vs tenant)
  // - Assigned facilitator info
  // - Property facilitator relationship
}
```

**Enhanced Data:**
- `reportedBy`: "You" (if landlord) or tenant name
- `reporterType`: "landlord" or "tenant"
- `assignedFacilitator`: Facilitator name
- `hasFacilitator`: Boolean

#### 3. Get Maintenance Details
```typescript
async getMaintenanceRequest(landlordId, maintenanceId) {
  // Returns full details including:
  // - Who reported it
  // - Assigned facilitator contact
  // - Property facilitator relationship
}
```

---

## Updated Mobile App Features

### 1. Maintenance List Screen
**Enhanced Display:**
```
┌─────────────────────────────────────┐
│ 🔧 Leaking Faucet        [HIGH]    │
│ Kitchen faucet dripping constantly  │
│ 🏠 Sunset Apartments • Unit 3B     │
│ 👤 Reported by: You                 │
│ 🔧 Assigned to: John Smith          │
└─────────────────────────────────────┘
```

**New Info Shown:**
- Who reported it (You vs Tenant name)
- Assigned facilitator name
- Clear visual hierarchy

### 2. Report Maintenance Screen
**Updated Flow:**
1. Select property
2. Check if facilitator assigned
3. Show facilitator info
4. Submit → auto-assign to facilitator
5. Success message mentions facilitator

**Error Handling:**
- If no facilitator: "This property doesn't have an assigned facilitator. Please contact admin."

### 3. Maintenance Details Screen
**Enhanced Information:**
```
Status: PENDING
Priority: HIGH PRIORITY

Property: Sunset Apartments
Unit: Unit 3B
Reported By: You
Reported On: Nov 9, 2024

┌─────────────────────────────────────┐
│ 🔧 Assigned Facilitator             │
│ John Smith                          │
│ john.smith@company.com              │
│ This facilitator handles all        │
│ maintenance for this property       │
└─────────────────────────────────────┘
```

**New Features:**
- Facilitator contact card
- Clear role explanation
- Email contact (if available)
- Warning if no facilitator assigned

---

## API Endpoints Updated

### 1. POST /landlord/maintenance
**Request:**
```json
{
  "propertyId": "uuid",
  "title": "Leaking faucet",
  "description": "Kitchen faucet dripping...",
  "priority": "high"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "maintenance-uuid",
    "title": "Leaking faucet",
    "status": "pending",
    "assignedFacilitator": "John Smith",
    "propertyName": "Sunset Apartments"
  }
}
```

**Error (No Facilitator):**
```json
{
  "success": false,
  "error": "This property does not have an assigned facilitator. Please contact admin to assign a facilitator first."
}
```

### 2. GET /landlord/maintenance
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Leaking faucet",
      "status": "pending",
      "priority": "high",
      "propertyName": "Sunset Apartments",
      "reportedBy": "You",
      "reporterType": "landlord",
      "assignedFacilitator": "John Smith",
      "hasFacilitator": true,
      "createdAt": "2024-11-09T10:00:00Z"
    }
  ]
}
```

### 3. GET /landlord/maintenance/:id
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Leaking faucet",
    "description": "Kitchen faucet dripping constantly...",
    "status": "pending",
    "priority": "high",
    "propertyName": "Sunset Apartments",
    "unitNumber": "3B",
    "reportedBy": "You",
    "reporterType": "landlord",
    "assignedFacilitator": "John Smith",
    "facilitatorEmail": "john.smith@company.com",
    "hasFacilitator": true,
    "createdAt": "2024-11-09T10:00:00Z",
    "comments": []
  }
}
```

---

## User Experience Flow

### Landlord Reports Maintenance
1. **Open app** → Dashboard
2. **Tap "Report Maintenance"**
3. **Select property** → Shows facilitator info
4. **Fill form** → Priority, title, description
5. **Submit** → "Assigned to John Smith"
6. **View list** → See facilitator assignment
7. **Tap details** → Full facilitator contact

### Landlord Views Tenant-Reported Maintenance
1. **Open "View Maintenance"**
2. **See all requests** → Both landlord and tenant reported
3. **Filter by status** → Pending, In Progress, Completed
4. **Tap request** → See who reported it
5. **View facilitator** → Same facilitator for all property maintenance

### Error Scenarios
1. **Property has no facilitator** → Clear error message
2. **Facilitator removed** → Shows "Not assigned"
3. **Network error** → Proper error handling

---

## Admin Workflow (Prerequisite)

Before landlords can report maintenance:

1. **Admin creates facilitator account**
2. **Admin assigns facilitator to property**
3. **Property now ready for maintenance requests**
4. **All maintenance auto-routes to facilitator**

---

## Benefits of This Approach

### For Landlords
✅ **Clear communication path** - Know exactly who handles maintenance
✅ **Consistent service** - Same facilitator for all property issues
✅ **Professional handling** - Vetted facilitators manage everything
✅ **Transparency** - See who's assigned and their contact info

### For Tenants
✅ **Single point of contact** - Same facilitator for all issues
✅ **Consistent experience** - Familiar with property and tenant
✅ **Professional service** - Trained facilitator handles requests

### For Your Company
✅ **Streamlined operations** - Clear assignment rules
✅ **Scalable system** - Easy to manage facilitator workload
✅ **Quality control** - Consistent service per property
✅ **Clear accountability** - Each facilitator owns their properties

### For Facilitators
✅ **Property expertise** - Deep knowledge of assigned properties
✅ **Relationship building** - Work with same landlords/tenants
✅ **Efficient workflow** - Familiar with property specifics
✅ **Clear responsibility** - Own all maintenance for assigned properties

---

## Testing Checklist

### Prerequisites
- [ ] Property exists with assigned facilitator
- [ ] Landlord owns the property
- [ ] Facilitator account is active

### Report Maintenance Flow
- [ ] Can select property with facilitator
- [ ] Error shown for property without facilitator
- [ ] Form validation works
- [ ] Success message shows facilitator name
- [ ] Request appears in maintenance list
- [ ] Facilitator receives the assignment

### View Maintenance Flow
- [ ] List shows both landlord and tenant reported issues
- [ ] Reporter info is clear ("You" vs tenant name)
- [ ] Facilitator info is displayed
- [ ] Status filtering works
- [ ] Details screen shows full facilitator info

### Edge Cases
- [ ] Property with no facilitator
- [ ] Facilitator removed after assignment
- [ ] Multiple properties with different facilitators
- [ ] Network errors handled gracefully

---

## Summary

The maintenance system now perfectly aligns with your facilitator-based business model:

1. **Properties have assigned facilitators**
2. **All maintenance auto-routes to property facilitator**
3. **Landlords and tenants both work with same facilitator**
4. **Clear communication and accountability**
5. **Scalable and professional system**

This creates a streamlined experience where everyone knows exactly who to work with for each property, and your company maintains control over the quality and consistency of service.

---

**Status**: ✅ Complete with Facilitator Integration
**Next Step**: Test with real facilitator assignments
**Business Impact**: Streamlined operations, better service quality
