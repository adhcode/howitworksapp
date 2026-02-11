# Delete Account Feature Implementation

## Overview
Added self-service account deletion for both landlords and tenants with password confirmation for security.

## Backend Changes

### 1. Auth Controller (`backend/src/auth/auth.controller.ts`)
- Added `DELETE /auth/account` endpoint
- Requires JWT authentication
- Accepts password in request body for confirmation

### 2. Auth Service (`backend/src/auth/auth.service.ts`)
- Added `deleteAccount(userId, password)` method
- Verifies user password before deletion
- Calls `usersService.delete()` to remove account

## Mobile App Changes

### 1. API Service (`mobile/app/services/api.ts`)
- Added `deleteAccount(password)` method
- Makes DELETE request to `/auth/account`

### 2. Landlord Profile (`mobile/app/screens/landlord/EnhancedProfileScreen.tsx`)
- Added "Delete Account" button below logout
- Shows confirmation alert with password prompt
- Logs out and redirects to login after successful deletion

### 3. Tenant Settings (`mobile/app/tenant/tabs/settings.tsx`)
- Added "Delete Account" button below logout
- Same confirmation flow as landlord
- Logs out and redirects to login after successful deletion

## User Flow

1. User clicks "Delete Account" button
2. First confirmation alert: "Are you sure?"
3. Second prompt: "Enter your password to confirm"
4. Password is sent to backend for verification
5. If correct, account is permanently deleted
6. User is logged out and redirected to login screen

## Security Features

- Password confirmation required
- JWT authentication required
- Cannot be undone
- User is immediately logged out after deletion

## UI/UX

- Red delete button (darker than logout)
- Clear warning messages
- Two-step confirmation process
- Error handling for incorrect password

## Testing

To test:
1. Login as landlord or tenant
2. Go to Profile/Settings
3. Scroll to bottom
4. Click "Delete Account"
5. Confirm and enter password
6. Verify account is deleted and redirected to login

## API Endpoint

```
DELETE /auth/account
Authorization: Bearer {token}
Body: { "password": "user_password" }

Response: { "message": "Your account has been permanently deleted" }
```

## Notes

- Account deletion is permanent and cannot be undone
- All user data is removed from the database
- Related data (properties, tenants, etc.) should be handled by database cascading rules
