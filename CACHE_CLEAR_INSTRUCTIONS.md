# Cache Clear Instructions

The error you're seeing is from cached code in Metro bundler. The code has been updated correctly, but the app is running old cached code.

## To Fix:

### Option 1: Clear Metro Cache (Recommended)
```bash
cd mobile
npx expo start -c
```

### Option 2: Full Clean
```bash
cd mobile
rm -rf node_modules/.cache
rm -rf .expo
npx expo start -c
```

### Option 3: If still having issues
```bash
cd mobile
# Kill any running Metro processes
pkill -f "expo start" || true
pkill -f "react-native" || true

# Clear all caches
rm -rf node_modules/.cache
rm -rf .expo
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*

# Restart
npx expo start -c
```

## What Was Fixed:

1. ✅ Replaced all `Alert.alert()` calls with `showAlert()` using CustomAlert
2. ✅ Added KeyboardAvoidingView to withdraw modal
3. ✅ Made modal scrollable to prevent keyboard blocking
4. ✅ Added CustomAlert component at the end of the screen
5. ✅ All alerts now use the beautiful custom design

The code is correct - you just need to clear the cache and restart!
