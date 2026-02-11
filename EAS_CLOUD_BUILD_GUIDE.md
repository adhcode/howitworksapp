# EAS Cloud Build Guide - Simple & Clean

## Why Cloud Build?

✅ **No Gradle needed** - EAS handles everything
✅ **No Android Studio** - Build happens in the cloud
✅ **No local setup** - Just push code and build
✅ **Faster** - EAS servers are optimized for builds
✅ **Reliable** - Consistent build environment

## Do You Need the `android` Folder?

**NO!** With EAS, you don't need the `android` folder at all. EAS generates it automatically during the build process.

### Should You Delete It?

You can safely delete the `mobile/android` folder if:
- You're only using EAS builds (recommended)
- You don't need to customize native Android code
- You want a cleaner project

Keep it only if:
- You need custom native modules
- You want to build locally with Android Studio

## Quick Start

### 1. Make Sure You're Logged In

```bash
cd mobile
eas login
```

### 2. Run the Build Script

```bash
chmod +x eas-cloud-build.sh
./eas-cloud-build.sh
```

Or manually:

```bash
# Push changes
git add .
git commit -m "Ready for EAS build"
git push --set-upstream origin main

# Start build
cd mobile
eas build --platform android --profile preview
```

## What Happens

1. **Upload** - Your code is uploaded to EAS servers (~30 seconds)
2. **Build** - EAS builds your APK in the cloud (5-10 minutes)
3. **Download** - You get a link to download the APK

## Check Build Status

### In Terminal
```bash
cd mobile
eas build:list
```

### In Browser
Visit: https://expo.dev

Navigate to: Projects → homezy → Builds

## Download Your APK

Once the build completes, you'll get:
- A download link in the terminal
- An email notification
- The APK available at expo.dev

## Build Profiles

Your `eas.json` has these profiles:

### preview (recommended for testing)
```bash
eas build --platform android --profile preview
```
- Creates an APK you can install directly
- Internal distribution
- Good for testing

### production (for Play Store)
```bash
eas build --platform android --profile production
```
- Creates an AAB for Play Store
- Auto-increments version
- Production-ready

## Common Commands

```bash
# Check who you're logged in as
eas whoami

# List all builds
eas build:list

# View specific build
eas build:view [build-id]

# Cancel a build
eas build:cancel

# Build for both platforms
eas build --platform all --profile preview
```

## Troubleshooting

### "Not logged in"
```bash
eas login
```

### "Project not found"
Make sure your `app.json` has the correct `extra.eas.projectId`

### "Build failed"
Check the build logs at expo.dev or run:
```bash
eas build:view [build-id]
```

## Clean Up Android Folder (Optional)

If you want to remove the android folder since you're using EAS:

```bash
# Remove android folder
rm -rf mobile/android

# Add to .gitignore
echo "android/" >> mobile/.gitignore

# Commit
git add mobile/.gitignore
git commit -m "Remove android folder - using EAS builds only"
git push
```

EAS will generate the android folder automatically during builds.

## Next Steps After Build

1. **Download the APK** from the link provided
2. **Install on your device** - Enable "Install from unknown sources"
3. **Test the app** thoroughly
4. **Submit to Play Store** when ready (use production profile)

## Cost

- **Free tier**: 30 builds/month
- **Paid plans**: Unlimited builds

Check: https://expo.dev/pricing

## Summary

```bash
# The simplest way to build:
cd mobile
eas build --platform android --profile preview

# Then download from expo.dev when done!
```

No Gradle, no Android Studio, no hassle! 🎉
