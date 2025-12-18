# Local Android Build Guide

## Prerequisites

1. **Java Development Kit (JDK) 17**
   ```bash
   # Check if installed
   java -version
   
   # Install via Homebrew (macOS)
   brew install openjdk@17
   
   # Set JAVA_HOME
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)
   ```

2. **Android Studio** (for Android SDK)
   - Download from: https://developer.android.com/studio
   - Install Android SDK Platform 34
   - Install Android SDK Build-Tools 34.0.0
   - Install Android SDK Command-line Tools

3. **Environment Variables**
   Add to your `~/.zshrc`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
   export JAVA_HOME=$(/usr/libexec/java_home -v 17)
   ```
   
   Then reload:
   ```bash
   source ~/.zshrc
   ```

## Fixed Issues

✅ Created missing `splashscreen_logo.xml` drawable
✅ Fixed package name to `com.adhcode.homezy`

## Build Commands

### 1. Clean Build (Recommended First Time)
```bash
cd mobile/android
./gradlew clean
```

### 2. Build Debug APK
```bash
cd mobile/android
./gradlew assembleDebug
```
Output: `mobile/android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Build Release APK
```bash
cd mobile/android
./gradlew assembleRelease
```
Output: `mobile/android/app/build/outputs/apk/release/app-release.apk`

### 4. Install Debug APK on Connected Device
```bash
cd mobile/android
./gradlew installDebug
```

### 5. Build and Install in One Command
```bash
cd mobile/android
./gradlew clean assembleDebug installDebug
```

## Troubleshooting

### If Gradle Daemon Issues
```bash
cd mobile/android
./gradlew --stop
./gradlew clean
```

### If Build Cache Issues
```bash
cd mobile/android
rm -rf .gradle
rm -rf app/build
./gradlew clean
```

### Check Gradle Version
```bash
cd mobile/android
./gradlew --version
```

### Verbose Build Output
```bash
cd mobile/android
./gradlew assembleDebug --info
```

## Testing the APK

### Install on Physical Device
1. Enable USB debugging on your Android device
2. Connect via USB
3. Run: `adb devices` to verify connection
4. Run: `adb install app/build/outputs/apk/debug/app-debug.apk`

### Install on Emulator
1. Start Android emulator from Android Studio
2. Run: `adb devices` to verify emulator is running
3. Run: `adb install app/build/outputs/apk/debug/app-debug.apk`

## Quick Start Script

Run this from the mobile directory:
```bash
cd android && ./gradlew clean assembleDebug && cd ..
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Release Build Notes

The current configuration uses debug signing for release builds. For production:
1. Generate a release keystore
2. Update `signingConfigs.release` in `app/build.gradle`
3. Never commit the keystore to git

## Next Steps After Successful Build

1. Test the APK on a physical device
2. Verify all features work (auth, payments, notifications)
3. Check app performance and loading times
4. Generate a proper release keystore for production builds
