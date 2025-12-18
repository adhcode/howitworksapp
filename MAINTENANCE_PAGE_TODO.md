# Maintenance Page Updates - TODO

## Current Status
The Maintenance page exists but needs several improvements:

## Required Updates

### 1. Backend - Add Facilitator Information
The maintenance requests need to include:
- Facilitator name (from property assignment)
- Facilitator email
- Facilitator phone number

**Backend Changes Needed:**
- Update `/admin/maintenance` endpoint to join with properties table
- Get facilitator_id from properties
- Join with users table to get facilitator details
- Return facilitator info with each maintenance request

### 2. Frontend - Display Facilitator Contact
Add a column/section showing:
- Facilitator name
- Contact button/link to email
- Phone number (if available)

### 3. Mobile Responsiveness
- Responsive stats grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Hide table on mobile, show cards instead
- Responsive filters
- Mobile-friendly action buttons

### 4. Skeleton Loaders
- Add `StatCardSkeleton` for stats
- Add table/card skeletons while loading
- Smooth loading transitions

### 5. Brand Colors
- Navy `#1A2A52` for primary elements
- Update stat cards to use brand colors
- Modern card design with rounded corners
- Remove heavy shadows, use subtle borders

### 6. Better UX
- Click on facilitator to see contact modal
- Status badges with better colors
- Priority badges with icons
- Better empty states
- Improved filters UI

## Implementation Priority
1. ✅ Backend - Add facilitator info to maintenance endpoint
2. ✅ Frontend - Update UI with brand colors and responsiveness
3. ✅ Add skeleton loaders
4. ✅ Display facilitator contact information
5. ✅ Mobile card view for maintenance requests

## Files to Modify
- `backend/src/admin/admin.service.ts` - getMaintenance method
- `admin-dashboard/src/pages/Maintenance.tsx` - Complete redesign
- `admin-dashboard/src/lib/api.ts` - Verify API endpoint

## Notes
- Maintenance requests are linked to properties
- Properties have facilitator_id
- Need to join: maintenance_requests → properties → users (facilitator)
- Show "No facilitator assigned" if property has no facilitator
