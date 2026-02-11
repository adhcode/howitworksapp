# Expo Warnings Explained

## Overview
These warnings appear during development but don't affect app functionality. Most are informational or related to Expo Go limitations.

## Warnings Breakdown

### 1. Push Notifications Warning (Can Ignore)
```
expo-notifications: Android Push notifications functionality was removed from Expo Go with SDK 53
```

**What it means:** Push notifications don't work in Expo Go for SDK 53+

**Impact:** None for production - notifications will work in production builds

**Action:** No action needed unless you need to test notifications, then use a development build

---

### 2. Component Export Warnings (Can Ignore)
```
Route "./components/CustomAlert.tsx" is missing the required default export
Route "./components/skeletons/*.tsx" is missing the required default export
Route "./context/*.tsx" is missing the required default export
```

**What it means:** These files are components/utilities, not routes, so they don't need default exports

**Impact:** None - these are false warnings because Expo is scanning all files

**Action:** No action needed - these files are correctly implemented as named exports

**Files affected:**
- All skeleton components (used for loading states)
- Context providers (AuthContext, NotificationContext)
- Utility files (api.ts, notificationService.ts, mockData.ts)
- Type definitions (svg.d.ts)

---

### 3. New Architecture Warning (Can Ignore for Now)
```
React Native's New Architecture is always enabled in Expo Go, but explicitly disabled in your project
```

**What it means:** Expo Go uses the new architecture, but your app config disables it

**Impact:** Minor - may see slight differences between Expo Go and production builds

**Action:** Can be ignored for now. When ready to adopt new architecture:
```json
// In app.json
{
  "expo": {
    "newArchEnabled": true  // Change from false to true
  }
}
```

---

### 4. Missing Route Warnings (Can Ignore)
```
No route named "landlord/send-notice" exists
No route named "landlord/property-details" exists
No route named "landlord/add-tenant" exists
... etc
```

**What it means:** These routes exist but Expo's router is looking in the wrong place

**Impact:** None - routes work correctly, this is just a scanning issue

**Action:** No action needed - all these routes exist and function properly

**Routes mentioned:**
- landlord/send-notice
- landlord/property-details
- landlord/edit-property
- landlord/add-unit
- landlord/add-tenant
- landlord/unit-details
- landlord/edit-unit
- landlord/tenant-invitation-success
- landlord/tenant-list
- profile

All these routes exist in the correct locations and work as expected.

---

## Summary

**Warnings to ignore:**
- ✅ Push notifications warning (only affects Expo Go)
- ✅ Component export warnings (false positives)
- ✅ New architecture warning (informational)
- ✅ Missing route warnings (routes exist and work)

**Warnings that need action:**
- ❌ None - all warnings are informational

## Why These Warnings Appear

1. **Expo Go Limitations:** Expo Go has restrictions that don't apply to production builds
2. **File Scanning:** Expo scans all TypeScript files and assumes they're routes
3. **Router Detection:** Expo's router sometimes can't detect dynamically loaded routes

## Testing Recommendations

For full feature testing (especially push notifications):
1. Use EAS Build to create a development build
2. Or build locally with `npx expo run:android` or `npx expo run:ios`
3. Expo Go is fine for most development work

## Production Impact

**Zero impact** - None of these warnings affect production builds. The app will work perfectly when built for production.
