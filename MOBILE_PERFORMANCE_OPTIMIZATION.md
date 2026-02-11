# Mobile App Performance Optimization

## Current Issue: Slow Development Bundle

The JavaScript bundle takes long to build in Expo development mode (75+ seconds). This is normal for development but won't affect production.

## Why Development is Slow

1. **Metro bundler** processes all modules in real-time
2. **Source maps** are generated for debugging
3. **Hot reload** watches all files for changes
4. **No optimization** - code runs unminified for debugging

## Production Build Performance

Production builds (EAS Build) are MUCH faster because:
- Code is minified and optimized
- Tree-shaking removes unused code
- Assets are compressed
- No source maps or debugging overhead
- Hermes engine optimizes JavaScript execution

## Quick Fixes for Development

### 1. Clear Metro Cache
```bash
cd mobile
npx expo start -c
```

### 2. Enable Hermes (Already Enabled)
Check `mobile/app.json`:
```json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```
✅ Already configured

### 3. Reduce Bundle Size

Check for large dependencies:
```bash
cd mobile
npx expo-doctor
```

### 4. Use Production Mode Locally
```bash
cd mobile
npx expo start --no-dev --minify
```

## Bundle Size Analysis

Current bundle: ~1566 modules

Common culprits:
- `expo-router` and navigation
- `react-native-reanimated`
- `@react-navigation/*`
- Chart libraries
- Icon libraries

## Production Build Test

To test production performance:

```bash
cd mobile
eas build --profile preview --platform android
```

This will show actual production bundle size and startup time.

## Expected Production Performance

- **Bundle size**: ~5-10 MB (minified)
- **Startup time**: 2-3 seconds on mid-range devices
- **Navigation**: Instant (< 100ms)
- **API calls**: Depends on network

## Optimization Checklist

- [x] Hermes engine enabled
- [x] Production builds use minification
- [x] Images optimized (icon.png, splash.png)
- [ ] Consider lazy loading heavy screens
- [ ] Profile production build with React DevTools

## Development vs Production

| Metric | Development | Production |
|--------|-------------|------------|
| Bundle time | 60-90s | N/A (pre-built) |
| Bundle size | ~50 MB | ~5-10 MB |
| Startup time | 5-10s | 2-3s |
| Hot reload | Yes | No |
| Source maps | Yes | No |
| Minification | No | Yes |

## Recommendation

The slow development build is **normal and expected**. Focus on:
1. Production build performance (test with EAS)
2. Runtime performance (navigation, API calls)
3. User experience (loading states, animations)

Don't worry about development bundle time - users will never see it!
