# Admin & Facilitator Account Setup - Complete! ✅

## What We Built

A complete self-service signup system for admin and facilitator accounts with email verification.

## Features Implemented

### 1. Signup Page (`/signup`)
- Beautiful, responsive signup form
- Fields: First Name, Last Name, Email, Phone, Password
- Client-side validation
- Password confirmation
- Role: Automatically set to 'admin'

### 2. Email Verification
- 6-digit verification code sent via email
- Code expires after 15 minutes
- Visual code input with auto-focus
- Resend code functionality
- Success redirect to login

### 3. Backend Support
- `/auth/register-admin` - Create admin account
- `/auth/verify-email-code` - Verify with 6-digit code
- `/auth/resend-verification` - Resend verification email
- Auto-verified accounts after code confirmation

### 4. Enhanced Login Page
- Link to signup page
- Success message after verification
- Support for both admin and facilitator roles

## Files Created/Modified

### New Files
```
admin-dashboard/src/pages/SignupPage.tsx
admin-dashboard/ADMIN_SIGNUP.md
backend/src/setup/setup.controller.ts
backend/src/setup/setup.service.ts
backend/src/setup/setup.module.ts
backend/setup-accounts.ts
backend/quick-setup.ts
backend/SETUP_ACCOUNTS.md
```

### Modified Files
```
admin-dashboard/src/App.tsx (added signup route)
admin-dashboard/src/pages/LoginPage.tsx (added signup link)
backend/src/app.module.ts (added SetupModule)
backend/package.json (added setup scripts)
```

## How to Use

### Option 1: Self-Service Signup (Recommended)

1. **Start the admin dashboard:**
   ```bash
   cd admin-dashboard
   npm run dev
   ```

2. **Navigate to signup:**
   - Open: `http://localhost:3001/signup`
   - Or click "Sign up" on login page

3. **Fill the form:**
   - Enter your details
   - Create a strong password
   - Submit

4. **Verify email:**
   - Check your email for 6-digit code
   - Enter code on verification screen
   - Click "Verify Email"

5. **Login:**
   - Redirected to login page
   - Sign in with your credentials
   - Access the dashboard!

### Option 2: Quick Setup Script (Development)

For quick testing with default accounts:

```bash
cd backend
npm run setup:quick
```

Creates:
- Admin: `admin@howitworks.app` / `Admin@123`
- Facilitator: `facilitator@howitworks.app` / `Facilitator@123`

### Option 3: Interactive Setup Script

For custom accounts via CLI:

```bash
cd backend
npm run setup:accounts
```

Follow the prompts to create accounts.

### Option 4: API Endpoint (Programmatic)

```bash
# Create admin account
curl -X POST http://localhost:3000/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Admin",
    "email": "john@example.com",
    "password": "SecurePass123",
    "phoneNumber": "+2348012345678",
    "role": "admin"
  }'

# Verify email
curl -X POST http://localhost:3000/auth/verify-email-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "123456"
  }'
```

## Account Types

### Admin Account
- Full dashboard access
- Manage all users and properties
- View analytics and reports
- Assign facilitators
- System configuration

### Facilitator Account
- Manage assigned properties
- View tenants and maintenance
- Handle property-specific tasks
- Limited admin access

## Security Features

✅ Password hashing with bcrypt (12 rounds)
✅ Email verification required
✅ 6-digit verification codes
✅ Code expiration (15 minutes)
✅ Resend code functionality
✅ Auto-verified after confirmation
✅ Role-based access control

## Testing Checklist

- [ ] Signup form validation works
- [ ] Email is sent with verification code
- [ ] Code verification works
- [ ] Invalid code shows error
- [ ] Resend code works
- [ ] Login after verification works
- [ ] Dashboard access granted
- [ ] Role permissions enforced

## Production Deployment

### Before Going Live:

1. **Update Environment Variables:**
   ```env
   NODE_ENV=production
   RESEND_API_KEY=your_production_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   FRONTEND_URL=https://admin.yourdomain.com
   ```

2. **Disable Quick Setup:**
   - Quick setup is auto-disabled in production
   - Only self-service signup will work

3. **Configure Email:**
   - Verify Resend domain
   - Test email delivery
   - Check spam filters

4. **Security Review:**
   - Enable HTTPS
   - Set secure JWT secrets
   - Configure CORS properly
   - Enable rate limiting

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify RESEND_API_KEY is valid
- Check backend logs for errors
- Ensure email domain is verified

### "User already exists"
- Email is already registered
- Try logging in instead
- Use password reset if needed

### Verification Code Invalid
- Code may have expired (15 min)
- Request new code
- Check for typos

### Build Errors
- Run `npm install` in both directories
- Clear node_modules and reinstall
- Check TypeScript errors

## Next Steps

1. **Create Your Admin Account:**
   - Go to `/signup`
   - Complete registration
   - Verify email
   - Login

2. **Create Facilitator Accounts:**
   - Use admin dashboard
   - Or use signup page
   - Assign to properties

3. **Configure System:**
   - Update settings
   - Add properties
   - Invite landlords
   - Set up notifications

## Support

For issues or questions:
- Check `admin-dashboard/ADMIN_SIGNUP.md`
- Check `backend/SETUP_ACCOUNTS.md`
- Review backend logs
- Contact development team

---

**Status:** ✅ Complete and Ready to Use!

**Last Updated:** November 26, 2024
