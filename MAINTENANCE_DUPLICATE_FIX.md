# Maintenance Request Duplicate Key Fix

## 🐛 Issue
React error: "Encountered two children with the same key"
- Duplicate maintenance requests appearing in the list
- Same maintenance request ID appearing multiple times

## 🔍 Root Cause

### Backend Query Issue
The LEFT JOIN in `landlord.service.ts` was incorrectly joining units:

```typescript
// ❌ WRONG - Joins ALL units for the property
.leftJoin(sql`units AS unit`, sql`unit.property_id = ${maintenanceRequests.propertyId}`)
```

This caused:
- If a property has 5 units, each maintenance request would appear 5 times
- Each row would have a different unit, but the same maintenance request ID
- React would see duplicate keys and throw an error

### Example:
Property "Sunset Apartments" has 3 units:
- Maintenance request #123 would appear 3 times in the query result
- Once with Unit 1, once with Unit 2, once with Unit 3
- All with the same ID: #123

## ✅ Solution

### 1. Fixed Backend Query
```typescript
// ✅ CORRECT - Only joins the specific unit for this maintenance request
.leftJoin(sql`units AS unit`, sql`unit.id = ${maintenanceRequests.unitId}`)
```

Now:
- Each maintenance request appears exactly once
- Only the specific unit (if any) is joined
- No duplicates in the result set

### 2. Added Frontend Deduplication (Safety Net)
```typescript
// Deduplicate by ID to prevent React key errors
const uniqueRequests = requestsData.reduce((acc: any[], current: any) => {
  const exists = acc.find(item => item.id === current.id);
  if (!exists) {
    acc.push(current);
  }
  return acc;
}, []);
```

This provides a safety net in case any duplicates slip through.

## 📊 Impact

### Before Fix:
- Property with 5 units = 5 duplicate maintenance requests shown
- React console errors
- Confusing UX (same request appearing multiple times)
- Potential performance issues

### After Fix:
- Each maintenance request appears exactly once
- No React errors
- Clean, accurate list
- Better performance

## 🧪 Testing

### Test Cases:
1. ✅ Property with multiple units - maintenance request appears once
2. ✅ Property with no units - maintenance request appears once
3. ✅ Maintenance request with specific unit - shows correct unit number
4. ✅ Maintenance request without unit - shows property only
5. ✅ Multiple maintenance requests - all appear correctly

### How to Test:
```bash
# 1. Create a property with multiple units
# 2. Report a maintenance issue for the property (not specific unit)
# 3. Check maintenance list - should appear once
# 4. Report another issue for a specific unit
# 5. Check maintenance list - both should appear once each
```

## 🔧 Files Changed

### Backend:
- `backend/src/landlord/landlord.service.ts`
  - Fixed LEFT JOIN in `getMaintenanceRequests()` method
  - Changed from `unit.property_id` to `unit.id` join condition

### Frontend:
- `mobile/app/landlord/maintenance/index.tsx`
  - Added deduplication logic in `loadMaintenanceData()`
  - Safety net to prevent duplicate keys

## 📝 Technical Details

### SQL Join Explanation:

**Wrong Join:**
```sql
LEFT JOIN units AS unit ON unit.property_id = maintenance_requests.property_id
```
This joins ALL units that belong to the property, creating a Cartesian product.

**Correct Join:**
```sql
LEFT JOIN units AS unit ON unit.id = maintenance_requests.unit_id
```
This joins only the specific unit referenced by the maintenance request (if any).

### Why LEFT JOIN?
- Not all maintenance requests are unit-specific
- Some are general property issues
- LEFT JOIN allows NULL unit_id (property-level issues)
- INNER JOIN would exclude property-level maintenance requests

## 🎯 Key Learnings

1. **Be specific with JOINs**: Always join on the most specific relationship
2. **Test with realistic data**: Properties with multiple units exposed this bug
3. **Add safety nets**: Frontend deduplication prevents UI issues even if backend has problems
4. **Check for Cartesian products**: Multiple matches in JOINs can cause unexpected duplicates

## ✅ Status
- **Fixed**: Backend query corrected
- **Tested**: Deduplication working
- **Deployed**: Ready for production
- **Monitoring**: No more duplicate key errors

---

**Related Issues:**
- React key duplication warning
- Maintenance list showing duplicates
- Performance issues with large property portfolios

**Prevention:**
- Always test queries with properties that have multiple units
- Use DISTINCT or proper JOIN conditions
- Add unique constraints where appropriate
- Implement frontend deduplication as safety net
