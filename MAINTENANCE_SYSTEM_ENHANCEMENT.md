# Maintenance System Enhancement Plan

## Current State Analysis

### What Exists ✅
1. **Tenant Side:**
   - Can view complaints/reports
   - Can submit new complaints
   - Can view complaint details
   - Basic status tracking

2. **Landlord Side:**
   - Can view all maintenance requests
   - Can filter by status
   - Can view request details
   - Can add comments
   - Has stats overview

### What's Missing ❌
1. **No skeleton loaders** on tenant reports screen
2. **Status updates** - Landlord can't change status
3. **Priority management** - Can't update priority
4. **Assignment system** - Can't assign to facilitators
5. **Image uploads** - Limited image handling
6. **Notifications** - No real-time updates
7. **Timeline/Activity log** - No history tracking
8. **Estimated completion** - No ETA system
9. **Cost tracking** - No budget/cost management
10. **Tenant feedback** - Can't rate/review completion

## Enhancement Priority

### Phase 1: Critical (Implement Now) 🔥
1. ✅ Add skeleton loader to tenant reports screen
2. ✅ Status update functionality for landlord
3. ✅ Priority update functionality
4. ✅ Improved comment system with timestamps
5. ✅ Activity timeline/history
6. ✅ Better image handling and viewing

### Phase 2: Important (Next)
7. Assignment to facilitators
8. Estimated completion date
9. Cost tracking
10. Push notifications

### Phase 3: Nice to Have
11. Tenant feedback/rating
12. Recurring maintenance
13. Preventive maintenance scheduling
14. Analytics and reports

## Implementation Plan - Phase 1

### 1. Tenant Reports Skeleton
**File:** `mobile/app/tenant/tabs/reports.tsx`
- Add loading skeleton
- Improve empty state
- Add pull-to-refresh

### 2. Status Management
**Backend:** Add endpoint to update status
**Landlord App:** Add status update UI
- Dropdown/modal to change status
- Confirmation dialog
- Optimistic updates

### 3. Priority Management
**Backend:** Add endpoint to update priority
**Landlord App:** Add priority update UI
- Visual priority indicators
- Quick priority change

### 4. Enhanced Comments
**Features:**
- Show commenter name and role
- Timestamp for each comment
- Avatar/icon for commenter
- Better formatting

### 5. Activity Timeline
**Features:**
- Status changes logged
- Priority changes logged
- Comments logged
- Assignment logged
- Visual timeline UI

### 6. Image Improvements
**Features:**
- Image gallery view
- Zoom/pinch to zoom
- Multiple image upload
- Image preview before upload

## Database Schema Updates Needed

```sql
-- Add to maintenance_requests table
ALTER TABLE maintenance_requests
ADD COLUMN assigned_to UUID REFERENCES users(id),
ADD COLUMN estimated_completion TIMESTAMP,
ADD COLUMN actual_completion TIMESTAMP,
ADD COLUMN cost DECIMAL(10, 2),
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN tenant_feedback TEXT;

-- Create activity log table
CREATE TABLE maintenance_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_request_id UUID REFERENCES maintenance_requests(id),
  user_id UUID REFERENCES users(id),
  action_type VARCHAR(50), -- status_change, priority_change, comment, assignment, etc.
  old_value TEXT,
  new_value TEXT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints Needed

### Status Management
- `PATCH /maintenance/:id/status` - Update status
- `PATCH /maintenance/:id/priority` - Update priority

### Activity Log
- `GET /maintenance/:id/activity` - Get activity timeline

### Assignment
- `PATCH /maintenance/:id/assign` - Assign to facilitator
- `GET /facilitators/available` - Get available facilitators

### Cost Tracking
- `PATCH /maintenance/:id/cost` - Update cost
- `GET /maintenance/costs/summary` - Get cost summary

## Success Metrics

1. **Response Time:** Average time from report to first response < 2 hours
2. **Resolution Time:** Average time to complete < 48 hours for urgent
3. **Tenant Satisfaction:** Average rating > 4.0/5.0
4. **Completion Rate:** > 95% of requests completed
5. **Communication:** Average comments per request > 2

## Next Steps

1. Add skeleton to tenant reports (5 min)
2. Implement status update (20 min)
3. Implement priority update (15 min)
4. Add activity timeline (30 min)
5. Enhance comment system (20 min)
6. Improve image handling (25 min)

Total Time: ~2 hours for Phase 1
