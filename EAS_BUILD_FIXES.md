# EAS Build Fixes Applied

## Issues Fixed

### 1. Missing Drawable Resource ✅
**Error:** `resource drawable/splashscreen_logo (aka com.homezy:drawable/splashscreen_logo) not found`

**Fix:** Created `mobile/android/app/src/main/res/drawable/splashscreen_logo.xml`
- Added proper layer-list drawable with white background
- Matches the splash screen configuration in app.json

### 2. Package Name Mismatch ✅
**Issue:** Build.gradle had `com.homezy` but app.json has `com.adhcode.homezy`

**Fix:** Updated `mobile/android/app/build.gradle`
- Changed namespace from `com.homezy` to `com.adhcode.homezy`
- Changed applicationId from `com.homezy` to `com.adhcode.homezy`

## Ready to Build

Run from the mobile directory:

```bash
cd mobile
eas build --platform android --profile preview
```

Or for production:

```bash
cd mobile
eas build --platform android --profile production
```

## What Changed

1. `mobile/android/app/src/main/res/drawable/splashscreen_logo.xml` - NEW FILE
2. `mobile/android/app/build.gradle` - Updated package names
3. `mobile/android/gradle/wrapper/gradle-wrapper.properties` - Increased network timeout

These were the exact issues causing the previous build failures.
