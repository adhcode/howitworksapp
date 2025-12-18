# Units Calculation Fix - Complete

## Problem Identified
The dashboard was counting units from the **properties table** (`totalUnits` field), which is just what landlords DECLARE they will have. This is not accurate.

## Solution Implemented
Now counting from the **units table**, which contains the ACTUAL units that landlords have added to the system.

## Changes Made

### 1. Backend - Fixed Units Calculation
**File:** `backend/src/admin/admin.service.ts`

**Before:**
```typescript
const [propertyStats] = await this.db
  .select({
    totalProperties: count(),
    totalUnits: sql<number>`sum(total_units)`, // ❌ Wrong - summing declared units
  })
  .from(properties);
```

**After:**
```typescript
const [propertyStats] = await this.db
  .select({
    totalProperties: count(),
  })
  .from(properties);

// Get actual units count from units table
const [unitsStats] = await this.db
  .select({
    totalUnits: count(), // ✅ Correct - counting actual units
  })
  .from(units);
```

### 2. Sidebar Logo
**File:** `admin-dashboard/src/components/layouts/DashboardLayout.tsx`

Changed from text "HowItWorks" to logo image:
```tsx
<img src="/logo.svg" alt="HowItWorks" className="h-8 w-auto" />
```

### 3. Removed All Percentages
Confirmed no percentage calculations remain in the Dashboard component.

## How It Works Now

### Properties Table
- Landlord creates property
- Sets `totalUnits: 10` (declares they will have 10 units)
- This is just a declaration/plan

### Units Table  
- Landlord actually adds units one by one
- Unit 1: "Apt 101"
- Unit 2: "Apt 102"
- Unit 3: "Apt 103"
- etc.

### Dashboard Display
- **Total Units:** Counts rows in `units` table (actual units added)
- **Occupied Units:** Will count units with active leases (TODO)
- **Vacant Units:** Total units minus occupied units

## Example Scenario

**Property A:**
- Declared: 10 units (`properties.totalUnits = 10`)
- Actually added: 3 units in `units` table

**Property B:**
- Declared: 5 units (`properties.totalUnits = 5`)
- Actually added: 8 units in `units` table (landlord added more than planned)

**Dashboard Shows:**
- Total Units: **11** (3 + 8 from units table) ✅ Correct
- NOT: 15 (10 + 5 from properties table) ❌ Wrong

## Future Enhancement
When a landlord tries to add more units than they declared in `properties.totalUnits`, you can:
1. Allow it and auto-update `properties.totalUnits`
2. Show a warning but allow it
3. Block it and ask them to update the property first

For now, we just count the actual units regardless of what was declared.

## Files Modified
1. `backend/src/admin/admin.service.ts` - Fixed units calculation
2. `admin-dashboard/src/components/layouts/DashboardLayout.tsx` - Added logo
3. `admin-dashboard/src/pages/Dashboard.tsx` - Already had percentages removed

## Testing
To verify the fix is working:
1. Check how many rows are in the `units` table
2. Compare with the dashboard "Total Units" display
3. They should match exactly
