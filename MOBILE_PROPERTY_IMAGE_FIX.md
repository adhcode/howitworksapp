# 📱 Mobile Property Image Fix

## Issue Identified

**Problem**: Mobile landlord property screen shows mock house.png images instead of actual property images.

**Root Cause**: Backend upload controller was generating image URLs with `localhost:3003`, but mobile app connects via IP address `192.168.1.3:3003`. Mobile devices cannot access `localhost` URLs.

## Investigation Results

### Backend API Test ✅
```bash
./test-mobile-property-images.sh
```

**Results**:
- ✅ Landlord login works
- ✅ Properties API returns image data correctly
- ✅ Images field is populated in API response
- ❌ Image URLs use `localhost` instead of IP address

**Example API Response**:
```json
{
  "name": "DH house",
  "images": ["http://localhost:3003/uploads/1762688354639-335416083.jpg"]
}
```

**Problem**: Mobile app configured for `http://192.168.1.3:3003` but image URL uses `http://localhost:3003`

## Fix Applied

### Backend Upload Controller
**File**: `backend/src/upload/upload.controller.ts`

**Before**:
```typescript
// Return the file URL
const fileUrl = `http://localhost:3003/uploads/${filename}`;
return {
  url: fileUrl,
  filename: filename,
  originalname: data.filename,
};
```

**After**:
```typescript
// Return the file URL - use the request host instead of hardcoded localhost
const protocol = req.protocol || 'http';
const host = req.headers.host || 'localhost:3003';
const fileUrl = `${protocol}://${host}/uploads/${filename}`;

return {
  url: fileUrl,
  filename: filename,
  originalname: data.filename,
};
```

### Mobile App Debugging
**File**: `mobile/app/landlord/tabs/property.tsx`

**Added debugging logs**:
```typescript
// Debug image loading
onError={(error) => {
  console.log(`❌ Image failed to load for property ${property.name}:`, property.images[0]);
  console.log('Error details:', error.nativeEvent.error);
  setImageErrors(prev => new Set(prev).add(property.id));
}}
onLoad={() => {
  console.log(`✅ Image loaded successfully for property ${property.name}:`, property.images[0]);
}}

// Debug properties with images
console.log('🖼️ Properties loaded with images:');
propertiesWithStats.forEach(prop => {
  console.log(`- ${prop.name}: ${prop.images ? `${prop.images.length} images` : 'No images'}`);
  if (prop.images) {
    prop.images.forEach((img, idx) => console.log(`  ${idx + 1}. ${img}`));
  }
});
```

## Testing

### Upload Fix Test
```bash
chmod +x test-upload-fix.sh
./test-upload-fix.sh
```

**What it tests**:
1. Login as landlord
2. Upload a test image
3. Verify URL uses IP address instead of localhost
4. Test image accessibility

### Expected Results After Fix
- New uploads should generate URLs like: `http://192.168.1.3:3003/uploads/filename.jpg`
- Mobile app should load images successfully
- No more fallback to house.png for properties with images

## Current Status

### Properties in Database
1. **"DH house"**: Has image with localhost URL (needs re-upload)
2. **"DH house 2"**: No image (shows house.png correctly)
3. **"Mobile Test Property"**: Has Unsplash URLs (should work)

### Next Steps

1. **Restart Backend Server** - Apply the upload controller fix
2. **Test Upload Fix** - Run `./test-upload-fix.sh`
3. **Re-upload Property Images** - For existing properties with localhost URLs
4. **Test Mobile App** - Verify images load correctly

## Mobile App Image Loading Logic

```typescript
{property.images && property.images.length > 0 && !imageErrors.has(property.id) ? (
  <Image
    source={{ uri: property.images[0] }}
    style={styles.propertyImage}
    onError={() => setImageErrors(prev => new Set(prev).add(property.id))}
  />
) : (
  <Image
    source={require('../../assets/images/house.png')}
    style={styles.propertyImage}
    resizeMode="cover"
  />
)}
```

**Logic**:
- If property has images AND no previous load errors → Show actual image
- If no images OR image failed to load → Show house.png fallback

## Expected Behavior After Fix

### Properties with Valid Images
- Should display actual property images
- No house.png fallback

### Properties without Images
- Should display house.png fallback
- This is correct behavior

### Properties with Failed Images
- Should display house.png fallback after error
- Error logged to console

## Verification Steps

1. **Check Backend Logs** - Ensure upload controller fix is active
2. **Upload New Image** - Test with a property
3. **Check Generated URL** - Should use IP address
4. **Test Mobile App** - Images should load
5. **Check Console Logs** - Debug output should show successful loads

## Configuration Notes

### Mobile App API Config
```typescript
development: {
  baseURL: 'http://192.168.1.3:3003', // Your Mac's IP
  timeout: 10000,
  enableLogging: true,
}
```

### Backend Static File Serving
```typescript
// Serves files from /uploads/ directory
await app.register(require('@fastify/static'), {
  root: uploadsPath,
  prefix: '/uploads/',
});
```

## Troubleshooting

### If Images Still Don't Load

1. **Check Network** - Ensure mobile device can reach `192.168.1.3:3003`
2. **Check URLs** - Verify new uploads use IP address
3. **Check CORS** - Ensure backend allows image requests
4. **Check File Permissions** - Ensure uploads directory is readable
5. **Check Mobile Logs** - Look for image loading errors

### Common Issues

- **Localhost URLs**: Old uploads still use localhost
- **Network Access**: Mobile device can't reach Mac IP
- **File Not Found**: Upload directory or files missing
- **CORS Errors**: Backend blocking image requests

## Summary

✅ **Root cause identified**: Localhost URLs in image uploads
✅ **Fix implemented**: Dynamic host detection in upload controller
✅ **Debugging added**: Console logs for image loading
✅ **Test script created**: Verify upload URL fix

**Next**: Restart backend and test the fix!

---

**Status**: 🔧 Fix Applied - Needs Testing
**Impact**: High - Fixes mobile property image display
**Complexity**: Low - Simple URL generation fix