# Admin Signup Guide

## Overview

The admin dashboard now includes a complete signup flow with email verification for creating new admin and facilitator accounts.

## Features

- Self-service admin account creation
- Email verification with 6-digit code
- Secure password requirements
- Automatic role assignment
- Resend verification code option

## How to Sign Up

### Step 1: Access Signup Page

Navigate to the signup page:
- Local: `http://localhost:3001/signup`
- Production: `https://your-domain.com/signup`

Or click "Sign up" link on the login page.

### Step 2: Fill Registration Form

Provide the following information:
- **First Name**: Your first name
- **Last Name**: Your last name
- **Email**: Your work email address
- **Phone Number**: Your phone number (format: +2348012345678)
- **Password**: Minimum 6 characters
- **Confirm Password**: Must match password

### Step 3: Email Verification

After submitting the form:
1. Check your email inbox for a verification code
2. Enter the 6-digit code on the verification screen
3. Click "Verify Email"

If you don't receive the code:
- Check your spam/junk folder
- Click "Resend" to get a new code
- Verification codes expire after 15 minutes

### Step 4: Login

After successful verification:
1. You'll be redirected to the login page
2. Sign in with your email and password
3. Access the admin dashboard

## Account Types

### Admin Account
- Full access to all dashboard features
- Can manage users, properties, and facilitators
- Can view analytics and reports
- Can assign facilitators to properties

### Facilitator Account
To create a facilitator account, use the same signup flow. The system will automatically assign the appropriate role based on your registration.

## API Endpoints Used

The signup flow uses these backend endpoints:

```
POST /auth/register-admin
POST /auth/verify-email-code
POST /auth/resend-verification
POST /auth/login
```

## Security Features

1. **Password Requirements**: Minimum 6 characters
2. **Email Verification**: Required before login
3. **Code Expiration**: Verification codes expire after 15 minutes
4. **Secure Storage**: Passwords are hashed with bcrypt
5. **Auto-verified**: Admin accounts are marked as verified after code confirmation

## Troubleshooting

### "User already exists" Error
- The email is already registered
- Try logging in instead
- Use a different email address

### "Invalid verification code" Error
- Code may have expired (15 minutes)
- Request a new code by clicking "Resend"
- Ensure you entered all 6 digits correctly

### Email Not Received
- Check spam/junk folder
- Verify email address is correct
- Click "Resend" to get a new code
- Contact support if issue persists

### "Access denied" on Login
- Only admin and facilitator roles can access the dashboard
- Verify your account was created with the correct role

## Development Notes

### Local Testing

1. Start the backend server:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Start the admin dashboard:
   ```bash
   cd admin-dashboard
   npm run dev
   ```

3. Access signup page: `http://localhost:3001/signup`

### Email Configuration

Ensure your backend `.env` has email settings configured:

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
FRONTEND_URL=http://localhost:3001
```

### Database

The signup process creates records in the `users` table with:
- `role`: 'admin' or 'facilitator'
- `isEmailVerified`: true (after verification)
- `isActive`: true
- `emailVerificationCode`: 6-digit code
- `emailVerificationCodeExpires`: timestamp

## Next Steps

After creating your admin account:

1. **Login**: Sign in to the dashboard
2. **Complete Profile**: Update your profile information
3. **Create Facilitators**: Add facilitator accounts for property management
4. **Assign Properties**: Link facilitators to properties
5. **Explore Features**: Familiarize yourself with the dashboard

## Support

For issues or questions:
- Check the main README.md
- Review backend logs for errors
- Contact the development team
