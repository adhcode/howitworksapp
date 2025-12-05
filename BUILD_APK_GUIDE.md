# Build APK Guide - HowitWorks Mobile App

## Date: December 5, 2025

---

## 📋 Pre-Build Checklist

### ✅ Code Status
- [x] Email notification system fixed
- [x] Payment balance display working
- [x] Tenant management screen working
- [x] Tenant list screen implemented
- [x] Transaction history fixed
- [x] All TypeScript errors resolved
- [x] Backend compiles successfully
- [x] Mobile app runs without crashes

---

## 🚀 Step 1: Push Code to Git

### Check Git Status
```bash
git status
```

### Stage All Changes
```bash
git add .
```

### Commit Changes
```bash
git commit -m "feat: major fixes - email notifications, payment system, tenant management

- Fixed email notification system (payment reminders instead of verification)
- Added payment stats endpoint and fixed wallet balance display
- Fixed tenant management screen data loading
- Implemented full tenant list screen with skeleton loader
- Fixed transaction history display
- Resolved all TypeScript compilation errors
- Added proper navigation and UX improvements"
```

### Push to Remote
```bash
# Push to main branch
git push origin main

# Or if you're on a different branch
git push origin your-branch-name
```

---

## 📱 Step 2: Build APK with EAS Build

### Prerequisites
1. **EAS CLI installed**:
   ```bash
   npm install -g eas-cli
   ```

2. **Expo account logged in**:
   ```bash
   eas login
   ```

3. **Project configured for EAS**:
   ```bash
   cd mobile
   eas build:configure
   ```

### Build APK (Development Build)

```bash
cd mobile

# Build for Android (APK)
eas build --platform android --profile preview

# Or for production
eas build --platform android --profile production
```

### Build Options

#### Option 1: Preview Build (Recommended for Testing)
```bash
eas build --platform android --profile preview
```
- Faster build time
- Suitable for testing
- Can be installed on any Android device

#### Option 2: Production Build
```bash
eas build --platform android --profile production
```
- Optimized for Play Store
- Requires signing keys
- Larger file size but better performance

---

## 🔧 Step 3: Configure EAS Build (If Not Already Done)

### Create/Update `eas.json` in mobile directory

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 📦 Step 4: Update App Version

### Update `app.json` or `app.config.js`

```json
{
  "expo": {
    "name": "HowitWorks",
    "slug": "howitworks",
    "version": "1.1.0",
    "android": {
      "versionCode": 2,
      "package": "com.howitworks.app"
    }
  }
}
```

**Important**: Increment `versionCode` for each new build!

---

## 🏗️ Step 5: Start the Build

### Run Build Command
```bash
cd mobile
eas build --platform android --profile preview
```

### What Happens:
1. EAS uploads your code to their servers
2. Builds the APK in the cloud
3. Provides a download link when complete
4. Build typically takes 10-20 minutes

### Monitor Build Progress
- Check the terminal for build URL
- Visit the URL to see real-time build logs
- You'll receive an email when build completes

---

## 📥 Step 6: Download and Install APK

### Download APK
1. Build completes → EAS provides download link
2. Click link to download APK
3. Or use command:
   ```bash
   eas build:list
   ```

### Install on Android Device

#### Method 1: Direct Install
1. Transfer APK to Android device
2. Open APK file
3. Allow "Install from Unknown Sources" if prompted
4. Install the app

#### Method 2: Share via Link
1. EAS provides a shareable link
2. Open link on Android device
3. Download and install

---

## 🔍 Step 7: Test the APK

### Test Checklist
- [ ] App launches successfully
- [ ] Login works
- [ ] Dashboard loads correctly
- [ ] Tenant management shows tenants
- [ ] Payment screen shows wallet balance
- [ ] Transaction history displays
- [ ] Tenant list screen works
- [ ] Navigation flows correctly
- [ ] No crashes or errors

---

## 🛠️ Alternative: Local APK Build (Without EAS)

### Using Expo Prebuild + Android Studio

```bash
cd mobile

# Generate native Android project
npx expo prebuild --platform android

# Build APK using Gradle
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

**Note**: This requires Android Studio and Android SDK installed locally.

---

## 📊 Build Profiles Comparison

| Profile | Build Type | Use Case | Install Method |
|---------|-----------|----------|----------------|
| **development** | APK | Development/Testing | Direct install |
| **preview** | APK | Internal testing | Direct install |
| **production** | AAB | Play Store | Play Store only |

---

## 🚨 Common Issues & Solutions

### Issue 1: Build Fails - Missing Dependencies
**Solution**:
```bash
cd mobile
npm install
# or
yarn install
```

### Issue 2: EAS CLI Not Found
**Solution**:
```bash
npm install -g eas-cli
```

### Issue 3: Not Logged In
**Solution**:
```bash
eas login
```

### Issue 4: Build Takes Too Long
**Solution**:
- Use `preview` profile instead of `production`
- Check EAS build queue status
- Builds can take 15-30 minutes during peak times

### Issue 5: APK Won't Install
**Solution**:
- Enable "Install from Unknown Sources" on Android
- Check if app is already installed (uninstall first)
- Verify APK is not corrupted (re-download)

---

## 📝 Quick Commands Reference

```bash
# Push code
git add .
git commit -m "your message"
git push origin main

# Build APK
cd mobile
eas build --platform android --profile preview

# Check build status
eas build:list

# Download latest build
eas build:download --platform android

# View build logs
eas build:view
```

---

## 🎯 Production Deployment Checklist

### Before Production Build:
- [ ] Update version number in app.json
- [ ] Increment versionCode
- [ ] Test all features thoroughly
- [ ] Update API URLs to production
- [ ] Remove debug logs
- [ ] Test on multiple devices
- [ ] Prepare Play Store listing
- [ ] Create signing keys
- [ ] Configure app signing

### Production Build:
```bash
eas build --platform android --profile production
```

### Submit to Play Store:
```bash
eas submit --platform android
```

---

## 📱 App Information

**App Name**: HowitWorks
**Package**: com.howitworks.app
**Current Version**: 1.0.0
**Target SDK**: Android 13+ (API 33)

---

## 🔗 Useful Links

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **EAS Dashboard**: https://expo.dev/accounts/[your-account]/projects
- **Build Queue**: https://expo.dev/eas/builds
- **Expo Forums**: https://forums.expo.dev/

---

## ✅ Success Criteria

Your APK is ready when:
- ✅ Build completes without errors
- ✅ APK downloads successfully
- ✅ App installs on Android device
- ✅ All features work as expected
- ✅ No crashes or critical bugs
- ✅ Performance is acceptable

---

**Status**: Ready to Build
**Date**: December 5, 2025
**Build Type**: Preview APK (Recommended)
