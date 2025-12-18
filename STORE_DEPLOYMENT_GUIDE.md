# App Store Deployment Guide

## Prerequisites Checklist

### Google Play Store (Android)
- [ ] Google Play Console account ($25 one-time fee)
- [ ] App signing key (we'll generate this)
- [ ] Privacy policy URL
- [ ] App screenshots (phone & tablet)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512)
- [ ] Short description (80 chars)
- [ ] Full description (4000 chars)

### Apple App Store (iOS)
- [ ] Apple Developer account ($99/year)
- [ ] App Store Connect access
- [ ] Privacy policy URL
- [ ] App screenshots (various iPhone sizes)
- [ ] App icon (1024x1024)
- [ ] App description
- [ ] Keywords
- [ ] Support URL

---

## Part 1: Google Play Store (Android)

### Step 1: Generate Production Build

First, create a production keystore for signing:

```bash
cd mobile/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore homezy-release.keystore -alias homezy-key -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANT:** Save the passwords securely! You'll need:
- Keystore password
- Key password

### Step 2: Configure Signing in EAS

Update `mobile/eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      },
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-id",
        "appleTeamId": "your-team-id"
      }
    }
  }
}
```

### Step 3: Build Production APK/AAB

For AAB (recommended for Play Store):
```bash
cd mobile
eas build --platform android --profile production
```

### Step 4: Google Play Console Setup

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in app details:
   - App name: "Homezy" or "HIW Maintenance"
   - Default language: English
   - App or game: App
   - Free or paid: Free

4. Complete the setup checklist:
   - App access
   - Ads (declare if you show ads)
   - Content rating questionnaire
   - Target audience
   - News app declaration
   - COVID-19 contact tracing
   - Data safety form
   - Privacy policy

5. Upload your build:
   - Go to "Production" → "Create new release"
   - Upload the AAB file from EAS
   - Add release notes
   - Review and rollout

### Step 5: Automated Submission with EAS

After initial setup, you can automate:

```bash
# Build and submit in one command
cd mobile
eas build --platform android --profile production --auto-submit
```

Or submit existing build:
```bash
eas submit --platform android --latest
```

---

## Part 2: Apple App Store (iOS)

### Step 1: Apple Developer Account Setup

1. Enroll at https://developer.apple.com ($99/year)
2. Accept agreements in App Store Connect
3. Set up banking/tax info (for paid apps)

### Step 2: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: Your app name
   - Primary Language: English
   - Bundle ID: com.adhcode.homezy
   - SKU: homezy-001 (unique identifier)

### Step 3: Configure iOS Build

Update `mobile/app.json`:

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.adhcode.homezy",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to upload property photos.",
        "NSPhotoLibraryUsageDescription": "This app accesses your photos to upload property images."
      }
    }
  }
}
```

### Step 4: Build for iOS

```bash
cd mobile
eas build --platform ios --profile production
```

You'll need to authenticate with your Apple ID during the build.

### Step 5: Submit to App Store

```bash
cd mobile
eas submit --platform ios --latest
```

Or use EAS automated submission:
```bash
eas build --platform ios --profile production --auto-submit
```

### Step 6: Complete App Store Connect Listing

1. App Information:
   - Category (Productivity or Business)
   - Content rights
   - Age rating

2. Pricing and Availability:
   - Price: Free
   - Availability: All countries or select

3. App Privacy:
   - Privacy policy URL
   - Data collection details

4. Prepare for Submission:
   - Screenshots (required sizes)
   - App preview video (optional)
   - Promotional text
   - Description
   - Keywords
   - Support URL
   - Marketing URL (optional)

5. Submit for Review

---

## Part 3: EAS Submit Configuration

### Install EAS CLI (if not already)
```bash
npm install -g eas-cli
eas login
```

### Configure Credentials

For Android (Google Play):
```bash
eas credentials
# Select Android → Production → Set up Google Service Account
```

For iOS (App Store):
```bash
eas credentials
# Select iOS → Production → Set up App Store Connect API Key
```

---

## Part 4: Automated CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Stores

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Setup EAS
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      
      - name: Install dependencies
        run: cd mobile && npm install
      
      - name: Build and Submit Android
        run: cd mobile && eas build --platform android --profile production --auto-submit --non-interactive
      
      - name: Build and Submit iOS
        run: cd mobile && eas build --platform ios --profile production --auto-submit --non-interactive
```

---

## Part 5: Version Management

### Update Version Before Each Release

In `mobile/app.json`:
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    },
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

Rules:
- `version`: User-facing (1.0.0, 1.0.1, 1.1.0)
- `versionCode` (Android): Integer, must increment
- `buildNumber` (iOS): String, must increment

---

## Part 6: Pre-Launch Checklist

### Testing
- [ ] Test on physical Android device
- [ ] Test on physical iOS device
- [ ] Test all payment flows
- [ ] Test notifications
- [ ] Test camera/photo uploads
- [ ] Test offline behavior
- [ ] Performance testing

### Legal & Compliance
- [ ] Privacy policy published
- [ ] Terms of service
- [ ] GDPR compliance (if EU users)
- [ ] Payment processing compliance
- [ ] Data encryption verified

### Store Assets
- [ ] App icon (high quality)
- [ ] Screenshots (all required sizes)
- [ ] Feature graphic (Android)
- [ ] App description (compelling)
- [ ] Keywords optimized
- [ ] Support email set up
- [ ] Website/landing page

### App Configuration
- [ ] Production API URLs set
- [ ] Analytics configured
- [ ] Crash reporting enabled
- [ ] Push notification certificates
- [ ] Payment gateway production keys
- [ ] Remove debug code
- [ ] Obfuscation enabled

---

## Quick Commands Reference

### Build Commands
```bash
# Android Preview
eas build --platform android --profile preview

# Android Production
eas build --platform android --profile production

# iOS Production
eas build --platform ios --profile production

# Both platforms
eas build --platform all --profile production
```

### Submit Commands
```bash
# Submit latest Android build
eas submit --platform android --latest

# Submit latest iOS build
eas submit --platform ios --latest

# Submit specific build
eas submit --platform android --id [build-id]
```

### Check Build Status
```bash
eas build:list
eas build:view [build-id]
```

---

## Timeline Expectations

### Google Play Store
- Initial review: 1-7 days
- Updates: Few hours to 2 days
- Can publish to internal/beta track immediately

### Apple App Store
- Initial review: 1-3 days (can be longer)
- Updates: 1-2 days
- Can use TestFlight for beta testing

---

## Next Steps

1. **Immediate:**
   - Set up Google Play Console account
   - Set up Apple Developer account
   - Generate production keystore
   - Prepare store assets (screenshots, descriptions)

2. **Before First Submission:**
   - Test thoroughly on real devices
   - Prepare privacy policy
   - Set up support email
   - Create app store listings

3. **First Submission:**
   - Build production APK/AAB
   - Build production IPA
   - Submit to both stores
   - Monitor review status

4. **Post-Launch:**
   - Monitor crash reports
   - Respond to user reviews
   - Plan update cycle
   - Track analytics

---

## Helpful Resources

- EAS Build: https://docs.expo.dev/build/introduction/
- EAS Submit: https://docs.expo.dev/submit/introduction/
- Google Play Console: https://play.google.com/console
- App Store Connect: https://appstoreconnect.apple.com
- Expo Application Services: https://expo.dev/eas
