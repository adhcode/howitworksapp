# 🔧 Landlord Maintenance Feature

## Overview

Complete maintenance management system for landlords to report issues, track tenant-reported maintenance, and monitor resolution progress. Aligns with your business model where the company (admin/facilitators) handles all coordination.

## Business Model Alignment

```
Landlord Reports Issue → Your Company Reviews → Facilitator Assigned → Issue Resolved
     ↓                                                                         ↓
Tenant Reports Issue → Your Company Reviews → Facilitator Assigned → Issue Resolved
```

**Key Points:**
- Landlords can report maintenance they notice
- Landlords can view tenant-reported maintenance
- Landlords CANNOT assign facilitators (admin does this)
- Landlords CANNOT close tickets (facilitator does this)
- Landlords CAN add comments and track progress

---

## Features Implemented

### 1. Quick Actions Updated ✅
**File**: `mobile/app/components/landlord/QuickActions.tsx`

**Changes:**
- Replaced "Add New Tenant" with "Report Maintenance"
- Replaced "Report Tenant" with "View Maintenance"
- Updated icons and descriptions

**New Actions:**
1. Add New Property
2. Report Maintenance (new)
3. View Maintenance (new)

---

### 2. API Service Methods ✅
**File**: `mobile/app/services/api.ts`

**New Methods:**
```typescript
// Get all maintenance requests with filters
getLandlordMaintenanceRequests(filters?: {
  status?: string;
  priority?: string;
  propertyId?: string;
}): Promise<any[]>

// Get single maintenance request details
getLandlordMaintenanceById(id: string): Promise<any>

// Create new maintenance request
createLandlordMaintenanceRequest(data: {
  propertyId: string;
  unitId?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  images?: string[];
}): Promise<any>

// Add comment to maintenance request
addMaintenanceComment(maintenanceId: string, comment: string): Promise<any>

// Get maintenance statistics
getLandlordMaintenanceStats(): Promise<{
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  byPriority: { low, medium, high, urgent };
}>
```

---

### 3. Maintenance List Screen ✅
**File**: `mobile/app/landlord/maintenance/index.tsx`

**Features:**
- Stats cards showing total, pending, in progress, completed
- Filter chips for quick filtering
- List of all maintenance requests
- Status indicators with colors
- Priority badges
- Property and unit information
- Tenant information (who reported it)
- Date formatting (Today, Yesterday, X days ago)
- Pull to refresh
- Empty state with CTA
- Tap to view details

**UI Elements:**
- Header with back button and add button
- Stats grid (4 cards)
- Filter chips (All, Pending, In Progress, Completed)
- Request cards with:
  - Status icon and color
  - Title
  - Priority badge
  - Description preview
  - Property/unit info
  - Reporter info
  - Date

---

### 4. Report Maintenance Screen ✅
**File**: `mobile/app/landlord/maintenance/report.tsx`

**Features:**
- Property selection (required)
- Unit selection (optional, loads based on property)
- Priority selection (Low, Medium, High, Urgent)
- Title input (max 100 chars)
- Description textarea (max 500 chars)
- Character counters
- Form validation
- Loading states
- Success/error alerts

**Form Fields:**
1. Property (dropdown) *
2. Unit (dropdown, optional)
3. Priority (buttons) *
4. Title (text input) *
5. Description (textarea) *

**Validation:**
- Property must be selected
- Title cannot be empty
- Description cannot be empty
- Character limits enforced

---

### 5. Maintenance Detail Screen ✅
**File**: `mobile/app/landlord/maintenance/[id].tsx`

**Features:**
- Status banner with color coding
- Title and priority badge
- Property information card
- Unit information (if applicable)
- Reporter information
- Reported date
- Completed date (if completed)
- Full description
- Photo gallery (horizontal scroll)
- Assigned facilitator card
- Comments section
- Add comment functionality

**Information Displayed:**
- Status (Pending, In Progress, Completed, Cancelled)
- Priority (Low, Medium, High, Urgent)
- Property name
- Unit number
- Reported by (tenant name)
- Reported on (date/time)
- Completed on (date/time, if applicable)
- Description
- Photos
- Assigned facilitator name
- Comments with author and timestamp

---

### 6. Dashboard Integration ✅
**File**: `mobile/app/screens/landlord/EnhancedDashboardScreen.tsx`

**Changes:**
- Added maintenance stats state
- Load maintenance stats on dashboard load
- Display maintenance overview section (if any maintenance exists)
- Three cards: Pending, In Progress, Completed
- "View All" link to maintenance list
- Color-coded cards

**Dashboard Section:**
```
Maintenance Overview                    View All
┌─────────────┬─────────────┬─────────────┐
│ 3           │ 2           │ 5           │
│ Pending     │ In Progress │ Completed   │
└─────────────┴─────────────┴─────────────┘
```

---

## Database Schema

**Table**: `maintenance_requests`

```sql
id: uuid (primary key)
tenant_id: uuid (references users)
landlord_id: uuid (references users)
property_id: uuid (references properties)
title: varchar(255)
description: text
priority: enum('low', 'medium', 'high', 'urgent')
status: enum('pending', 'in_progress', 'completed', 'cancelled')
images: text[] (array of image URLs)
assigned_to: uuid (references users - facilitator)
completed_at: timestamp
created_at: timestamp
updated_at: timestamp
```

---

## Backend Endpoints Needed

### 1. Get Landlord Maintenance Requests
```
GET /landlord/maintenance
Query params: status, priority, propertyId
Response: Array of maintenance requests
```

### 2. Get Maintenance Request Details
```
GET /landlord/maintenance/:id
Response: Single maintenance request with full details
```

### 3. Create Maintenance Request
```
POST /landlord/maintenance
Body: {
  propertyId, unitId?, title, description, priority, images?
}
Response: Created maintenance request
```

### 4. Add Comment
```
POST /landlord/maintenance/:id/comment
Body: { comment }
Response: Updated maintenance request
```

### 5. Get Maintenance Stats
```
GET /landlord/maintenance/stats
Response: {
  total, pending, inProgress, completed,
  byPriority: { low, medium, high, urgent }
}
```

---

## User Flow

### Report Maintenance Flow
1. Landlord taps "Report Maintenance" on dashboard
2. Selects property from dropdown
3. Optionally selects unit
4. Chooses priority level
5. Enters title and description
6. Taps "Submit Request"
7. Success message shown
8. Redirected back to dashboard

### View Maintenance Flow
1. Landlord taps "View Maintenance" on dashboard
2. Sees list of all maintenance requests
3. Can filter by status (All, Pending, In Progress, Completed)
4. Taps on a request to view details
5. Sees full information, photos, comments
6. Can add comments
7. Can see assigned facilitator

### Dashboard Flow
1. Landlord opens app
2. Dashboard loads with maintenance overview
3. Sees quick stats (Pending, In Progress, Completed)
4. Taps "View All" to see full list
5. Or taps "Report Maintenance" to create new

---

## Status Colors

| Status | Color | Icon |
|--------|-------|------|
| Pending | Blue (#3B82F6) | schedule |
| In Progress | Orange (#F59E0B) | hourglass-empty |
| Completed | Green (#10B981) | check-circle |
| Cancelled | Red (#EF4444) | cancel |

## Priority Colors

| Priority | Color |
|----------|-------|
| Low | Green (#10B981) |
| Medium | Yellow (#F59E0B) |
| High | Orange (#EA580C) |
| Urgent | Red (#DC2626) |

---

## Permissions & Access Control

### Landlord CAN:
- ✅ Report maintenance issues
- ✅ View all maintenance for their properties
- ✅ View maintenance reported by tenants
- ✅ Add comments to maintenance requests
- ✅ View assigned facilitator
- ✅ Track status changes
- ✅ View completion dates

### Landlord CANNOT:
- ❌ Assign facilitators (admin only)
- ❌ Change status (system/facilitator only)
- ❌ Delete maintenance requests
- ❌ Edit other people's comments
- ❌ Close tickets (facilitator only)
- ❌ Contact tenant directly

---

## Testing Checklist

### Report Maintenance
- [ ] Can select property
- [ ] Units load when property selected
- [ ] Can select priority
- [ ] Can enter title and description
- [ ] Character counters work
- [ ] Validation works (required fields)
- [ ] Success message shows
- [ ] Redirects after success
- [ ] Error handling works

### View Maintenance List
- [ ] List loads correctly
- [ ] Stats cards show correct numbers
- [ ] Filter chips work
- [ ] Status colors display correctly
- [ ] Priority badges show correctly
- [ ] Property/unit info displays
- [ ] Tenant info shows (if tenant-reported)
- [ ] Date formatting works
- [ ] Pull to refresh works
- [ ] Empty state shows when no data
- [ ] Tap to view details works

### Maintenance Details
- [ ] Status banner shows correctly
- [ ] All information displays
- [ ] Photos display (if any)
- [ ] Facilitator card shows (if assigned)
- [ ] Comments load correctly
- [ ] Can add comment
- [ ] Comment submission works
- [ ] Back button works

### Dashboard Integration
- [ ] Maintenance section shows (if data exists)
- [ ] Stats are correct
- [ ] Cards are color-coded
- [ ] "View All" link works
- [ ] Section hides if no maintenance

---

## Next Steps

### Phase 1: Backend Implementation
1. Create landlord maintenance controller
2. Implement all 5 endpoints
3. Add proper authorization (landlord can only see their properties)
4. Test endpoints with Postman

### Phase 2: Testing
1. Test with real data
2. Test all user flows
3. Test error scenarios
4. Test on iOS and Android

### Phase 3: Enhancements
1. Add photo upload functionality
2. Add push notifications for status changes
3. Add maintenance history export
4. Add maintenance cost tracking
5. Add maintenance scheduling

---

## Files Created/Modified

### Created:
- `mobile/app/landlord/maintenance/_layout.tsx`
- `mobile/app/landlord/maintenance/index.tsx`
- `mobile/app/landlord/maintenance/report.tsx`
- `mobile/app/landlord/maintenance/[id].tsx`

### Modified:
- `mobile/app/components/landlord/QuickActions.tsx`
- `mobile/app/services/api.ts`
- `mobile/app/screens/landlord/EnhancedDashboardScreen.tsx`

---

## Summary

✅ **Complete maintenance module for landlords**
✅ **Aligned with your business model**
✅ **Professional UI with proper UX**
✅ **Proper status and priority indicators**
✅ **Dashboard integration**
✅ **Ready for backend implementation**

The landlord can now:
- Report maintenance issues they notice
- View all maintenance for their properties
- Track status of all requests
- See who reported each issue
- Add comments and communicate
- Monitor facilitator assignments

All while your company maintains control over:
- Facilitator assignment
- Status changes
- Ticket closure
- Direct tenant communication

---

**Status**: ✅ Frontend Complete - Backend Needed
**Priority**: High
**Complexity**: Medium

