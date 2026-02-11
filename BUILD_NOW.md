# Build AAB Now - Quick Start

## Ready to Build? Follow These Steps:

### 1. Make Script Executable
```bash
chmod +x build-playstore-aab.sh
```

### 2. Run the Build Script
```bash
./build-playstore-aab.sh
```

### 3. What the Script Does
- ✅ Checks if you're in the right directory
- ✅ Verifies EAS CLI is installed
- ✅ Confirms you're logged in to Expo
- ✅ Shows current app version
- ✅ Checks for uncommitted changes
- ✅ Starts the AAB build

### 4. During the Build
- Build takes **10-20 minutes**
- You'll see progress in the terminal
- A build URL will be provided
- You can close terminal and check status later

### 5. After Build Completes
1. Download the `.aab` file from the provided URL
2. Go to [Google Play Console](https://play.google.com/console)
3. Upload AAB to Production track
4. Add release notes
5. Submit for review

---

## Alternative: Manual Build

If you prefer to build manually:

```bash
cd mobile

# Login to Expo (if not already)
eas login

# Build AAB
eas build --platform android --profile production
```

---

## Current Configuration

**App Name:** Property HomeCare  
**Package:** com.adhcode.propertyhomecare  
**Version:** 1.0.0  
**Version Code:** 1  

---

## Need Help?

See detailed guide: `BUILD_AAB_FOR_PLAYSTORE.md`

---

## Quick Troubleshooting

**Build fails?**
```bash
cd mobile
eas build --platform android --profile production --clear-cache
```

**Not logged in?**
```bash
eas login
```

**Check build status:**
```bash
eas build:list
```

---

**Ready? Run:** `./build-playstore-aab.sh`
