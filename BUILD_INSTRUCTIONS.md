# Build Instructions

## What Just Happened

✅ **Committed successfully** - 152 files changed with all your fixes
⚠️ **Git push needs upstream** - First time pushing this branch
⚠️ **EAS build failed** - App slug mismatch (now fixed)

## Next Steps

### 1. Push the Final Fix

```bash
chmod +x push-changes.sh
./push-changes.sh
```

This will push the app.json fix that changes the slug from "hiw-maintenance" to "homezy" to match your EAS project ID.

### 2. Build the APK

```bash
chmod +x build-apk.sh
./build-apk.sh
```

This will build your Android APK locally using EAS.

## Alternative: Manual Steps

If the scripts don't work, run these commands manually:

### Push Changes
```bash
git add mobile/app.json
git commit -m "Fix: Update app slug to match EAS project ID"
git push --set-upstream origin main
```

### Build APK
```bash
cd mobile
eas build --platform android --profile preview --local
```

## What Was Fixed

### 1. Backend Changes
- Fixed TypeScript error in `admin.service.ts` (facilitatorEmail/Phone types)
- All backend changes committed and ready to push

### 2. Mobile App Changes
- Fixed notification persistence using `useFocusEffect`
- Added debug logging to NotificationContext
- Fixed app.json slug to match EAS project ID (homezy)

### 3. Admin Dashboard Changes
- All dashboard improvements committed

## Troubleshooting

### If EAS Build Fails

**Check EAS Login:**
```bash
eas whoami
```

If not logged in:
```bash
eas login
```

**Update EAS CLI:**
```bash
npm install -g eas-cli
```

**Check Dependencies:**
```bash
cd mobile
npm install
```

**Try Cloud Build Instead:**
```bash
cd mobile
eas build --platform android --profile preview
```

This uploads to EAS servers instead of building locally (takes longer but more reliable).

## Build Profiles

Your `eas.json` should have these profiles:

- **preview** - Development build with debugging
- **production** - Production-ready build for Play Store

## After Build Completes

The APK will be in the `mobile` directory with a name like:
- `build-1234567890.apk`

You can install it directly on your Android device or upload to Play Store.

## Quick Reference

```bash
# Push all changes
./push-changes.sh

# Build APK
./build-apk.sh

# Or do everything manually
git push --set-upstream origin main
cd mobile && eas build --platform android --profile preview --local
```
