# Build AAB for Play Store - Complete Guide

## Prerequisites Checklist

Before building, ensure:
- ✅ All features tested and working
- ✅ App version updated in app.json
- ✅ EAS CLI installed
- ✅ Expo account configured
- ✅ All code committed to git

## Step 1: Update App Version

First, update the version in `mobile/app.json`:

```json
{
  "expo": {
    "version": "1.0.0",  // Update this
    "android": {
      "versionCode": 1   // Increment this for each build
    }
  }
}
```

**Version rules:**
- First release: `1.0.0` with versionCode `1`
- Bug fix: `1.0.1` with versionCode `2`
- Minor update: `1.1.0` with versionCode `3`
- Major update: `2.0.0` with versionCode `4`

## Step 2: Build AAB with EAS

### Option A: Using EAS Build (Recommended)

```bash
cd mobile

# Build production AAB
eas build --platform android --profile production

# Or if you want to build locally (faster but requires Android SDK)
eas build --platform android --profile production --local
```

### Option B: Quick Build Script

I'll create a script for you:

```bash
chmod +x build-playstore-aab.sh
./build-playstore-aab.sh
```

## Step 3: What Happens During Build

1. **EAS uploads your code** to their servers
2. **Dependencies installed** (npm install)
3. **Native code compiled** (Android Gradle)
4. **AAB file created** and signed
5. **Download link provided** (valid for 30 days)

**Build time:** 10-20 minutes typically

## Step 4: Download the AAB

After build completes:

```bash
# EAS will show a download URL like:
# https://expo.dev/accounts/[account]/projects/[project]/builds/[build-id]

# Or download directly:
eas build:list
# Copy the URL and download the .aab file
```

## Step 5: Test the AAB (Optional but Recommended)

### Using bundletool:

```bash
# Install bundletool if not already installed
brew install bundletool  # macOS
# or download from: https://github.com/google/bundletool/releases

# Generate APKs from AAB for testing
bundletool build-apks \
  --bundle=app-release.aab \
  --output=app-release.apks \
  --mode=universal

# Extract the universal APK
unzip app-release.apks -d apks

# Install on device
adb install apks/universal.apk
```

## Step 6: Upload to Play Store

### Via Play Console:

1. Go to https://play.google.com/console
2. Select your app (or create new app)
3. Go to **Production** → **Create new release**
4. Upload the `.aab` file
5. Fill in release notes
6. Review and rollout

### Release Notes Template:

```
What's New in v1.0.0:

✨ New Features:
- Tenant invitation system with token management
- Real-time payment tracking
- Maintenance request system
- In-app notifications

🐛 Bug Fixes:
- Fixed tenant name display
- Improved invitation status tracking
- Enhanced payment flow

🎨 Improvements:
- Updated UI/UX
- Performance optimizations
- Better error handling
```

## Build Configuration

Your `eas.json` should have:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  }
}
```

## Troubleshooting

### Build Fails

```bash
# Clear EAS cache
eas build:cancel

# Try again with clean cache
eas build --platform android --profile production --clear-cache
```

### Version Conflict

```bash
# Error: Version code must be greater than previous
# Solution: Increment versionCode in app.json
```

### Signing Issues

```bash
# EAS handles signing automatically
# But if you need to check:
eas credentials
```

## Post-Build Checklist

After successful build:

- [ ] Download AAB file
- [ ] Test on physical device (optional)
- [ ] Verify app version
- [ ] Check file size (should be < 150MB)
- [ ] Prepare release notes
- [ ] Upload to Play Console
- [ ] Submit for review

## Important Notes

### File Size
- **AAB file:** Usually 30-50MB
- **Installed size:** 50-80MB
- **Play Store limit:** 150MB for AAB

### Build Artifacts
- AAB file is signed automatically by EAS
- No need to manually sign
- Keystore managed by EAS

### Testing Before Release
1. Internal testing track (recommended)
2. Closed testing (beta testers)
3. Open testing (public beta)
4. Production release

## Quick Commands Reference

```bash
# Check EAS CLI version
eas --version

# Login to Expo
eas login

# Check build status
eas build:list

# View build logs
eas build:view [build-id]

# Cancel ongoing build
eas build:cancel

# Configure credentials
eas credentials

# Submit to Play Store (after build)
eas submit --platform android
```

## Estimated Timeline

- **Build time:** 10-20 minutes
- **Play Store review:** 1-7 days (usually 1-2 days)
- **Total time to live:** 1-7 days

## Next Steps After Upload

1. **Internal Testing** (1-2 days)
   - Test with team members
   - Fix any critical bugs

2. **Closed Testing** (3-7 days)
   - Beta testers
   - Gather feedback

3. **Production Release**
   - Gradual rollout (10% → 50% → 100%)
   - Monitor crash reports
   - Respond to user reviews

## Support

If build fails:
1. Check build logs: `eas build:view [build-id]`
2. Review error messages
3. Check EAS documentation: https://docs.expo.dev/build/introduction/
4. Contact Expo support if needed

---

**Ready to build?** Run the script below!
