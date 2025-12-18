# Password Reset Code Implementation

## Overview
Implemented code-based password reset for mobile app instead of email links, as links don't work well in mobile apps.

## Changes Made

### Backend Changes

#### 1. Database Schema Updates
- **File**: `backend/src/database/schema/users.ts`
- Added new fields:
  - `passwordResetCode`: 6-digit verification code
  - `passwordResetCodeExpires`: Expiration timestamp for the code

#### 2. Migration
- **File**: `backend/migrations/add_password_reset_code.sql`
- SQL migration to add the new columns to users table
- **File**: `backend/run-password-reset-migration.js`
- Node.js script to run the migration

#### 3. Email Service
- **File**: `backend/src/email/email.service.ts`
- Added `sendPasswordResetCodeEmail()` method
- Sends beautifully formatted email with 6-digit code
- Code expires in 15 minutes

#### 4. Users Service
- **File**: `backend/src/users/users.service.ts`
- Added `updatePasswordResetCode()` - Store reset code
- Added `findByPasswordResetCode()` - Find user by email and code
- Updated `clearPasswordResetToken()` - Also clears reset codes

#### 5. Auth Service
- **File**: `backend/src/auth/auth.service.ts`
- Updated `forgotPassword()` - Now generates 6-digit code instead of token
- Added `verifyResetCode()` - Verify the code is valid
- Added `resetPasswordWithCode()` - Reset password using code

#### 6. Auth Controller
- **File**: `backend/src/auth/auth.controller.ts`
- Added `POST /auth/verify-reset-code` - Verify reset code
- Added `POST /auth/reset-password-with-code` - Reset password with code

### Mobile App Changes

#### 1. API Service
- **File**: `mobile/app/services/api.ts`
- Added `verifyResetCode()` method
- Added `resetPasswordWithCode()` method

#### 2. Forgot Password Screen
- **File**: `mobile/app/auth/forgot-password.tsx`
- Complete redesign with 3-step flow:
  1. **Email Step**: Enter email to receive code
  2. **Code Step**: Enter 6-digit verification code
  3. **Password Step**: Create new password
- Features:
  - Code input with large, centered display
  - Resend code functionality
  - Password visibility toggle
  - Password confirmation
  - Proper validation at each step
  - Auto-redirect to login after success

#### 3. UI Fixes
- **Files**: `mobile/app/auth/login.tsx`, `mobile/app/auth/forgot-password.tsx`
- Fixed stretched placeholder text in password fields
- Added `letterSpacing: 0` to password input styles

#### 4. Tenant Management
- **File**: `mobile/app/landlord/tabs/tenants.tsx`
- Removed debug info section that was showing on screen

## How It Works

### Password Reset Flow

1. **User requests reset**:
   - Enters email address
   - Backend generates 6-digit code
   - Code stored in database with 15-minute expiration
   - Email sent with code

2. **User verifies code**:
   - Enters 6-digit code from email
   - Backend validates code and expiration
   - If valid, proceeds to password reset

3. **User sets new password**:
   - Enters new password twice
   - Backend validates code again
   - Updates password and clears reset code
   - User redirected to login

### Security Features

- Codes expire after 15 minutes
- Codes are single-use (cleared after successful reset)
- Email and code must match
- Password must be confirmed
- No information leaked about account existence

## Testing

### To Run Migration
```bash
node backend/run-password-reset-migration.js
```

### To Test Password Reset
1. Open mobile app
2. Go to login screen
3. Tap "Forgot Password?"
4. Enter email address
5. Check email for 6-digit code
6. Enter code in app
7. Create new password
8. Login with new password

## Email Template

The password reset email includes:
- Clear subject line: "Reset Your Password - HowitWorks"
- Large, centered 6-digit code
- Step-by-step instructions
- 15-minute expiration notice
- Security warning
- Professional branding

## API Endpoints

### POST /auth/forgot-password
Request password reset code
```json
{
  "email": "user@example.com"
}
```

### POST /auth/verify-reset-code
Verify reset code
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### POST /auth/reset-password-with-code
Reset password with code
```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "newpassword123"
}
```

## Notes

- Old token-based reset still works for web/admin dashboard
- Mobile app exclusively uses code-based reset
- Codes are more user-friendly for mobile users
- No need to open links in browser
- Better UX for mobile context
