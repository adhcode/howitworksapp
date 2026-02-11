# Google Play Store Submission Checklist for Property HomeCare

## 🎯 IMMEDIATE ACTION ITEMS

### 1. Register Google Play Developer Account
**Cost:** $25 (one-time fee)  
**Time:** 5-10 minutes + 48 hours verification

**Steps:**
1. Go to: https://play.google.com/console/signup
2. Sign in with your Google account (use a business email if possible)
3. Accept the Developer Distribution Agreement
4. Pay the $25 registration fee (credit card)
5. Complete your account details:
   - Developer name (will be public): "Property HomeCare" or your company name
   - Email address (for user contact)
   - Phone number
   - Website (optional but recommended)
6. Wait for verification (usually 24-48 hours)

**⚠️ Important:** Use an email you'll have long-term access to. This account is permanent.

---

## 📋 REQUIRED ASSETS CHECKLIST

### ✅ App Information
- [ ] **App Name:** "Property HomeCare" or "Property HomeCare" (max 50 characters)
- [ ] **Short Description:** 80 characters max
  - Example: "Manage properties, tenants, rent payments & maintenance requests easily"
- [ ] **Full Description:** Up to 4000 characters
  - Describe features: property management, tenant invitations, rent tracking, maintenance, payments
  - Highlight benefits for landlords and tenants
  - Include keywords: property management, landlord, tenant, rent payment, maintenance

### ✅ Visual Assets (REQUIRED)

#### 1. App Icon
- [ ] **512 x 512 px PNG** (32-bit, no transparency)
- [ ] Must be your actual app icon
- [ ] Location: `mobile/assets/splash.png` (you'll need to create proper icon)

#### 2. Feature Graphic
- [ ] **1024 x 500 px JPG or PNG**
- [ ] Showcases your app (can include text, logo, screenshots)
- [ ] No transparency

#### 3. Screenshots (MINIMUM 2, MAXIMUM 8)
- [ ] **Phone screenshots:** At least 2 required
  - Minimum dimension: 320px
  - Maximum dimension: 3840px
  - Recommended: 1080 x 1920 px or 1080 x 2340 px
- [ ] **7-inch tablet screenshots:** Optional but recommended
- [ ] **10-inch tablet screenshots:** Optional

**Screenshot Ideas:**
1. Login/Welcome screen
2. Landlord dashboard
3. Property list
4. Tenant management
5. Payment screen
6. Maintenance requests
7. Wallet/transactions
8. Settings/profile

### ✅ Legal & Policy Documents

#### 1. Privacy Policy (REQUIRED)
- [ ] **Privacy Policy URL** - Must be publicly accessible
- [ ] Must explain:
  - What data you collect (email, phone, payment info, property data)
  - How you use it
  - How you protect it
  - Third-party services (Paystack, notifications)
  - User rights (access, deletion)
  - Contact information

**Quick Solution:** Use a privacy policy generator:
- https://www.privacypolicies.com/
- https://app-privacy-policy-generator.firebaseapp.com/

#### 2. Terms of Service (Recommended)
- [ ] Terms & Conditions URL

### ✅ Store Listing Details

- [ ] **Category:** Choose primary category
  - Recommended: "Business" or "Productivity"
- [ ] **Tags:** Up to 5 tags
  - Examples: property management, landlord, tenant, real estate
- [ ] **Contact Email:** Support email for users
- [ ] **Contact Phone:** Optional
- [ ] **Website:** Optional but recommended

---

## 🔧 TECHNICAL REQUIREMENTS

### ✅ App Build Requirements

#### 1. Production Build File
- [ ] **AAB (Android App Bundle)** - Recommended for Play Store
  - OR APK (older format)
- [ ] Signed with production keystore
- [ ] Version code: 1 (must increment for each update)
- [ ] Version name: 1.0.0

#### 2. App Configuration
- [ ] **Package Name:** `com.adhcode.homezy` ✅ (already set in app.json)
- [ ] **Target SDK:** Android 13 (API 33) or higher
- [ ] **Minimum SDK:** Android 5.0 (API 21) or higher

#### 3. Permissions Declared
Your app currently requests:
- [ ] CAMERA - Explain: "Take photos of properties and maintenance issues"
- [ ] READ_EXTERNAL_STORAGE - Explain: "Select property images from gallery"
- [ ] WRITE_EXTERNAL_STORAGE - Explain: "Save property documents"
- [ ] NOTIFICATIONS - Explain: "Receive rent reminders and maintenance updates"

---

## 📝 CONTENT RATING QUESTIONNAIRE

You'll need to complete Google's content rating questionnaire:

- [ ] **Violence:** None (property management app)
- [ ] **Sexual Content:** None
- [ ] **Profanity:** None
- [ ] **Controlled Substances:** None
- [ ] **Gambling:** None
- [ ] **User Interaction:** Yes (users can communicate)
- [ ] **Shares Location:** No (unless you add this feature)
- [ ] **Unrestricted Web Access:** No

**Expected Rating:** Everyone or Teen (depending on user interaction)

---

## 🎨 DATA SAFETY SECTION

Google requires you to declare what data you collect:

### Data You Collect:
- [ ] **Personal Info:**
  - Name, email, phone number
  - Purpose: Account creation, communication
  - Shared: No (or with payment processor)

- [ ] **Financial Info:**
  - Payment info, bank details
  - Purpose: Rent payments, withdrawals
  - Shared: Yes (with Paystack)

- [ ] **Photos:**
  - Property images, maintenance photos
  - Purpose: Property documentation
  - Shared: No

- [ ] **App Activity:**
  - Payment history, maintenance requests
  - Purpose: App functionality
  - Shared: No

### Security Practices:
- [ ] Data encrypted in transit (HTTPS)
- [ ] Data encrypted at rest
- [ ] Users can request data deletion
- [ ] Committed to Google Play Families Policy (if targeting kids - probably not)

---

## 🚀 PRE-SUBMISSION CHECKLIST

### Testing
- [ ] Test on at least 2 different Android devices
- [ ] Test all user flows (signup, login, payments, maintenance)
- [ ] Test with poor internet connection
- [ ] Test notifications
- [ ] Test camera/photo upload
- [ ] No crashes or critical bugs
- [ ] All text is readable and properly formatted
- [ ] All images load correctly

### Code Quality
- [ ] Remove all console.log statements (or use production logging)
- [ ] Remove debug code
- [ ] Production API URLs configured (not localhost)
- [ ] Error handling in place
- [ ] Loading states implemented

### Compliance
- [ ] Privacy policy accessible in app (Settings screen)
- [ ] Terms of service accessible
- [ ] Support/Help section working
- [ ] Contact information provided
- [ ] Payment processing compliant with regulations

---

## 📱 HOW TO CREATE YOUR BUILD

### Option 1: Using EAS Build (Recommended)

```bash
# Install EAS CLI if not installed
npm install -g eas-cli

# Login to Expo
cd mobile
eas login

# Configure build
eas build:configure

# Build production AAB
eas build --platform android --profile production
```

### Option 2: Local Build

```bash
cd mobile
# Generate production bundle
npx expo export --platform android

# Build with Android Studio or Gradle
cd android
./gradlew bundleRelease
```

**Build output location:** 
- EAS: Download from Expo dashboard
- Local: `mobile/android/app/build/outputs/bundle/release/app-release.aab`

---

## 📤 SUBMISSION PROCESS

### Step 1: Create App in Play Console
1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in basic info:
   - App name: Property HomeCare
   - Default language: English
   - App or game: App
   - Free or paid: Free
   - Declarations: Check all boxes

### Step 2: Complete Dashboard Tasks
Work through the left sidebar:
1. **App access** - Explain if login required
2. **Ads** - Declare if you show ads (probably No)
3. **Content rating** - Complete questionnaire
4. **Target audience** - Age groups
5. **News app** - Probably No
6. **COVID-19** - Probably No
7. **Data safety** - Fill out data collection form
8. **Government apps** - Probably No
9. **Financial features** - Yes (in-app payments)
10. **Privacy policy** - Add your URL

### Step 3: Store Listing
1. Upload all graphics (icon, feature graphic, screenshots)
2. Write descriptions
3. Set category and tags
4. Add contact details

### Step 4: Release
1. Go to "Production" → "Create new release"
2. Upload your AAB file
3. Add release notes (e.g., "Initial release")
4. Review release
5. Click "Start rollout to Production"

### Step 5: Wait for Review
- Google will review your app (1-7 days)
- You'll get email notifications
- Check Play Console for status updates

---

## ⏱️ TIMELINE ESTIMATE

| Task | Time Required |
|------|---------------|
| Register developer account | 10 min + 48h verification |
| Create privacy policy | 1-2 hours |
| Design feature graphic | 2-4 hours |
| Take screenshots | 1-2 hours |
| Write descriptions | 1 hour |
| Build production APK/AAB | 30 min - 2 hours |
| Fill out Play Console forms | 2-3 hours |
| Upload and submit | 30 min |
| **Total prep time** | **1-2 days** |
| Google review | **1-7 days** |

---

## 🎯 PRIORITY ORDER

### Do This Week:
1. ✅ Register Google Play Developer account ($25)
2. ✅ Create/publish privacy policy
3. ✅ Take app screenshots (8 screens)
4. ✅ Design feature graphic (1024x500)
5. ✅ Write app descriptions

### Do Next Week:
6. ✅ Build production AAB
7. ✅ Create app in Play Console
8. ✅ Complete all forms and questionnaires
9. ✅ Upload assets and build
10. ✅ Submit for review

---

## 📞 SUPPORT RESOURCES

- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Policy Center:** https://play.google.com/about/developer-content-policy/
- **Launch Checklist:** https://developer.android.com/distribute/best-practices/launch/launch-checklist
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/

---

## ✨ TIPS FOR FASTER APPROVAL

1. **Be honest** in all declarations
2. **Test thoroughly** before submitting
3. **Provide clear screenshots** showing actual app functionality
4. **Write detailed description** explaining what the app does
5. **Have working privacy policy** before submission
6. **Respond quickly** if Google requests changes
7. **Use internal testing track** first to catch issues

---

## 🚨 COMMON REJECTION REASONS

- Missing or invalid privacy policy
- Misleading screenshots or description
- Crashes on startup
- Permissions not explained
- Incomplete data safety form
- Violates content policies
- Broken functionality

**Avoid these and you'll be fine!**

---

## NEXT STEPS

1. **Right now:** Register for Google Play Developer account
2. **While waiting for verification:** Create privacy policy and take screenshots
3. **After verification:** Complete Play Console setup and submit

Good luck! 🚀
