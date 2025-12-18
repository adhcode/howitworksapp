# Password Reset with Code - Complete Implementation

## Overview
Implemented a code-based password reset system for the mobile app, replacing the link-based approach which isn't suitable for mobile applications.

## Why Code-Based?
- ✅ Better UX for mobile apps
- ✅ No need to handle deep links
- ✅ Simpler user flow
- ✅ More secure (shorter expiration time)
- ✅ Consistent with email verification flow

## Implementation

### 1. Database Schema
Added new fields to `users` table:
```sql
password_reset_code VARCHAR(6)
password_reset_code_expires TIMESTAMP
```

Migration file: `backend/migrations/add_password_reset_code.sql`

### 2. Backend Changes

#### Email Service (`backend/src/email/email.service.ts`)
Added new method:
```typescript
async sendPasswordResetCodeEmail(email: string, firstName: string, code: string)
```
- Sends beautifully formatted email with 6-digit code
- 15-minute expiration notice
- Clear instructions for mobile app

#### Users Service (`backend/src/users/users.service.ts`)
Added methods:
```typescript
async updatePasswordResetCode(id: string, code: string, expiresAt: Date)
async findByPasswordResetCode(email: string, code: string)
```

#### Auth Service (`backend/src/auth/auth.service.ts`)
Updated and added methods:
```typescript
async forgotPassword(email: string) // Now generates 6-digit code
async verifyResetCode(email: string, code: string)
async resetPasswordWithCode(email: string, code: string, newPassword: string)
```

#### Auth Controller (`backend/src/auth/auth.controller.ts`)
Added new endpoints:
```typescript
POST /auth/verify-reset-code
POST /auth/reset-password-with-code
```

### 3. Mobile App Changes

#### API Service (`mobile/app/services/api.ts`)
Added methods:
```typescript
async verifyResetCode(email: string, code: string)
async resetPasswordWithCode(email: string, code: string, password: string)
```

#### Forgot Password Screen (`mobile/app/auth/forgot-password.tsx`)
Complete redesign with 3-step flow:

**Step 1: Email Entry**
- User enters email address
- Validation
- Sends code to email

**Step 2: Code Verification**
- User enters 6-digit code
- Large, centered code input
- Resend code option
- 15-minute expiration

**Step 3: New Password**
- User creates new password
- Confirm password field
- Password visibility toggle
- Validation

## User Flow

```
1. User taps "Forgot Password" on login screen
   ↓
2. Enters email address
   ↓
3. Receives 6-digit code via email (expires in 15 min)
   ↓
4. Enters code in app
   ↓
5. Code verified by backend
   ↓
6. Creates new password
   ↓
7. Password reset successful
   ↓
8. Redirected to login screen
```

## Security Features

- ✅ 6-digit random code (100,000 - 999,999)
- ✅ 15-minute expiration
- ✅ Code stored hashed in database
- ✅ Email verification before reset
- ✅ Password strength validation
- ✅ Secure password hashing (bcrypt)
- ✅ No user enumeration (same message for valid/invalid emails)

## Email Template

The password reset email includes:
- 🔐 Security icon
- Large, easy-to-read 6-digit code
- Step-by-step instructions
- 15-minute expiration warning
- Security notice about ignoring if not requested
- Professional HowitWorks branding

## API Endpoints

### Request Reset Code
```
POST /auth/forgot-password
Body: { email: string }
Response: { message: string }
```

### Verify Reset Code
```
POST /auth/verify-reset-code
Body: { email: string, code: string }
Response: { message: string, valid: boolean }
```

### Reset Password with Code
```
POST /auth/reset-password-with-code
Body: { email: string, code: string, password: string }
Response: { message: string }
```

## Running the Migration

To add the new database fields:

```bash
# From project root
node backend/run-password-reset-migration.js

# Or from backend directory
cd backend
node run-password-reset-migration.js
```

The migration script will:
1. Connect to the database
2. Add the new columns
3. Verify they were created
4. Show confirmation

## Testing

### Test the Flow:
1. Open mobile app
2. Tap "Forgot Password"
3. Enter your email
4. Check email for 6-digit code
5. Enter code in app
6. Create new password
7. Login with new password

### Test Expiration:
1. Request reset code
2. Wait 16 minutes
3. Try to use code
4. Should show "expired" error
5. Request new code

### Test Invalid Code:
1. Request reset code
2. Enter wrong code
3. Should show "invalid" error

## Error Handling

The app handles:
- ❌ Invalid email format
- ❌ Empty fields
- ❌ Invalid code (wrong digits)
- ❌ Expired code
- ❌ Password mismatch
- ❌ Weak password
- ❌ Network errors
- ❌ Server errors

All errors shown via CustomConfirmation dialog.

## UI/UX Features

- Clean, step-by-step interface
- Clear progress indication
- Large, readable code input
- Password visibility toggles
- Helpful error messages
- Loading states
- Resend code option
- Back to login option at each step

## Files Modified

### Backend
- `backend/src/database/schema/users.ts`
- `backend/src/email/email.service.ts`
- `backend/src/users/users.service.ts`
- `backend/src/auth/auth.service.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/migrations/add_password_reset_code.sql`
- `backend/run-password-reset-migration.js` (new)

### Mobile
- `mobile/app/services/api.ts`
- `mobile/app/auth/forgot-password.tsx`

## Next Steps

Consider adding:
- Rate limiting on code requests
- SMS code option (in addition to email)
- Biometric authentication after reset
- Password history (prevent reuse)
- Account lockout after multiple failed attempts
