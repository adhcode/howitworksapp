# Fixes Log

## 2025-11-08: Fixed Duplicate DTO Warning

### Issue
```
ERROR Duplicate DTO detected: "AssignFacilitatorDto" is defined multiple times with different schemas.
```

### Root Cause
Two classes with the same name `AssignFacilitatorDto` existed in different modules:
- `backend/src/facilitators/dto/facilitator.dto.ts`
- `backend/src/admin/dto/admin.dto.ts`

This caused Swagger/OpenAPI documentation conflicts.

### Solution
Renamed the DTO in the admin module to avoid naming collision:
- Changed `AssignFacilitatorDto` → `AdminAssignFacilitatorDto` in admin module
- Updated import in `admin.controller.ts`
- Updated usage in controller method

### Files Modified
1. `backend/src/admin/dto/admin.dto.ts` - Renamed class
2. `backend/src/admin/admin.controller.ts` - Updated import and usage

### Result
✅ No more duplicate DTO warning
✅ Swagger documentation generates correctly
✅ Both DTOs can coexist with unique names

### Prevention
When creating DTOs, use module-specific prefixes to avoid naming conflicts:
- `AdminAssignFacilitatorDto` (admin module)
- `AssignFacilitatorDto` (facilitators module)
- `TenantAssignFacilitatorDto` (if needed in tenant module)

---

## 2025-11-08: Fixed Mobile App Connection to Backend

### Issue
```
[API] POST /auth/register
[API] 💥 Request error: Aborted
```

Mobile app couldn't connect to backend server.

### Root Cause
The mobile app was configured with an incorrect IP address (`172.20.10.6`) that didn't match the Mac's actual network IP (`192.168.1.6`).

### Solution
Updated the API configuration in `mobile/app/services/api.ts`:
```typescript
baseURL: 'http://192.168.1.6:3003'
```

### How to Find Your IP
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

### Testing Connection
Run the test script:
```bash
chmod +x test-backend-connection.sh
./test-backend-connection.sh
```

### Troubleshooting
If mobile still can't connect:
1. **Check backend is running**: `cd backend && npm run start:dev`
2. **Check firewall**: System Settings → Network → Firewall → Allow port 3003
3. **Verify IP**: Run `ifconfig` to confirm your Mac's IP
4. **Same network**: Ensure mobile device is on same WiFi network
5. **Test with curl**: `curl http://YOUR_IP:3003/health`

### Files Modified
1. `mobile/app/services/api.ts` - Updated baseURL with correct IP

### Result
✅ Mobile app can now connect to backend
✅ Registration and login work
✅ Email sending works

---

## 2025-11-08: Enabled Email Verification Enforcement

### Issue
Users could login without verifying their email address, which is a security concern.

### Root Cause
Email verification check was commented out in `auth.service.ts` for development convenience.

### Solution
1. **Enabled email verification check** in login flow
2. **Added manual verification endpoint** for testing (development only)
3. **Added manual verify button** in mobile app verification screen
4. **Created verification script** for command-line testing

### Changes Made

#### Backend (`backend/src/auth/auth.service.ts`)
```typescript
// Before (commented out):
// if (!user.isEmailVerified) {
//   throw new UnauthorizedException('Please verify your email...');
// }

// After (enabled):
if (!user.isEmailVerified) {
  throw new UnauthorizedException('Please verify your email address before logging in. Check your inbox for the verification link.');
}
```

#### New Testing Features
1. **Manual Verification Endpoint**: `POST /auth/manual-verify`
2. **Manual Verify Button**: In mobile app verification screen
3. **CLI Script**: `./manual-verify-email.sh <email>`

### How to Test

#### Option 1: Use Mobile App Button
1. Register a new user
2. Go to verification screen
3. Tap "🧪 Manual Verify (Testing)" button
4. Email is verified instantly

#### Option 2: Use CLI Script
```bash
chmod +x manual-verify-email.sh
./manual-verify-email.sh test@example.com
```

#### Option 3: Use cURL
```bash
curl -X POST http://localhost:3003/auth/manual-verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Files Modified
1. `backend/src/auth/auth.service.ts` - Enabled verification check + added manual verify
2. `backend/src/auth/auth.controller.ts` - Added manual verify endpoint
3. `mobile/app/services/api.ts` - Added manual verify API method
4. `mobile/app/auth/verify-email.tsx` - Added manual verify button
5. `manual-verify-email.sh` - Created CLI script (NEW)

### Security Notes
- Manual verification is **ONLY available in development**
- Automatically disabled in production
- Real verification still works via email links
- This is purely for testing convenience

### Result
✅ Users must verify email before login
✅ Clear error message when email not verified
✅ Easy testing with manual verification
✅ Production-safe (manual verify disabled)

---

## 2025-11-08: Fixed Notification Service Cleanup Error

### Issue
```
ERROR Error clearing auth: [TypeError: Notifications.removeNotificationSubscription is not a function (it is undefined)]
```

### Root Cause
The `removeNotificationSubscription` method doesn't exist in the current version of expo-notifications. The correct way to remove subscriptions is to call `.remove()` on the subscription object.

### Solution
Updated the cleanup method to use the correct API:

```typescript
// Before (incorrect):
Notifications.removeNotificationSubscription(this.notificationListener);

// After (correct):
this.notificationListener.remove();
```

### Files Modified
1. `mobile/app/services/notificationService.ts` - Fixed cleanup method

### Result
✅ Logout works without errors
✅ Notification listeners properly cleaned up
✅ No more TypeError on logout
