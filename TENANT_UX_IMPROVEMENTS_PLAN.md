# Tenant UX Improvements Plan

## Issues to Fix

### 1. Total Due Sync Issue ⚠️
**Problem:** Home screen and Wallet screen show different totalDue values
**Root Cause:** 
- Home screen uses: `apiService.getTenantData()` → `/tenants/my-data`
- Wallet screen uses: `apiService.getTenantPayments()` → `/tenants/payments`
- Both calculate totalDue differently

**Solution:** Use the same endpoint or ensure both calculate the same way

### 2. Missing Skeletons 🎨
**Needed on:**
- Tenant home screen
- Tenant wallet screen (already has WalletSkeleton)
- Tenant messages screen
- Tenant complaints screen
- Tenant profile screen

### 3. Tenant Settings Features 🔧
**Need to implement:**
- Help & Support screen (copy from landlord)
- Change Password screen (copy from landlord)
- Add to tenant profile/settings

## Implementation Order

1. **Fix Total Due Sync** (Critical - affects payment accuracy)
2. **Add Tenant Help & Support** (Quick win - copy from landlord)
3. **Add Tenant Change Password** (Quick win - copy from landlord)
4. **Add Skeletons** (UX improvement)
5. **Add Animations** (Polish)

## Time Estimate
- Total Due Sync: 15 minutes
- Help & Support: 10 minutes
- Change Password: 10 minutes
- Skeletons: 30 minutes
- Total: ~1 hour
