# Email Verification Testing Guide

## ✅ Email Verification is Now Enforced

Users **MUST** verify their email before they can login. This is now properly enforced.

## 🧪 Testing Options

Since you're testing in Expo and email links go to localhost, here are 3 ways to verify emails for testing:

### Option 1: Manual Verify Button in App (Easiest)

1. Register a new user in the mobile app
2. You'll be redirected to the verification screen
3. Tap the **"🧪 Manual Verify (Testing)"** button
4. Email is verified instantly
5. Tap "Login" and you're in!

### Option 2: Command Line Script

```bash
# Make script executable
chmod +x manual-verify-email.sh

# Verify an email
./manual-verify-email.sh test@example.com
```

### Option 3: Direct API Call

```bash
curl -X POST http://localhost:3003/auth/manual-verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 📧 Real Email Verification (Production)

In production, users will:
1. Register
2. Receive verification email
3. Click link in email
4. Email verified
5. Login successfully

The email link format is:
```
http://YOUR_DOMAIN/auth/verify-email?token=abc123...
```

## 🔒 What Happens Without Verification

If you try to login without verifying:

```
❌ Error: "Please verify your email address before logging in. 
   Check your inbox for the verification link."
```

## 🎯 Testing Flow

### Complete Test Flow
```
1. Open mobile app
2. Tap "Sign Up"
3. Fill registration form
4. Submit
5. Redirected to verification screen
6. Tap "🧪 Manual Verify (Testing)"
7. Success! Email verified
8. Tap "Login"
9. Enter credentials
10. ✅ Login successful
```

### Test Unverified Login
```
1. Register a new user
2. DON'T verify email
3. Go back to login screen
4. Try to login
5. ❌ Should see error about email verification
6. Go to verification screen
7. Verify email
8. Try login again
9. ✅ Should work now
```

## 🚀 Production Setup

For production, you'll need to:

### 1. Configure Deep Linking

Update `app.json`:
```json
{
  "expo": {
    "scheme": "howitworks",
    "ios": {
      "associatedDomains": ["applinks:howitworks.com.ng"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "howitworks.com.ng",
              "pathPrefix": "/auth/verify-email"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### 2. Update Backend URL

In `backend/.env`:
```env
FRONTEND_URL="https://howitworks.com.ng"
```

### 3. Handle Deep Links in App

The verification screen already handles the token parameter, so deep links will work automatically.

## 🔐 Security Features

### Development Mode
- ✅ Manual verification available
- ✅ Test endpoints enabled
- ✅ Detailed error messages

### Production Mode
- ❌ Manual verification disabled
- ❌ Test endpoints disabled
- ✅ Only real email verification works
- ✅ Generic error messages

## 📱 Mobile App Features

### Verification Screen Shows:
- ✅ Email address being verified
- ✅ Resend verification email button
- ✅ Manual verify button (testing only)
- ✅ Back to login button
- ✅ Clear status messages

### After Verification:
- ✅ Welcome email sent
- ✅ Success message shown
- ✅ Login button appears
- ✅ User can login immediately

## 🐛 Troubleshooting

### "Email is already verified"
The email was already verified. Just login.

### "User not found"
Check the email address is correct.

### Manual verify button not showing
Make sure:
1. Backend is in development mode
2. Email parameter is passed to verification screen
3. Email is not already verified

### Still can't login after verification
1. Check backend logs for errors
2. Verify email was actually verified (check database)
3. Try resetting the app cache

## 📊 API Endpoints

### Verification Endpoints
```
POST /auth/register              - Register user (sends verification email)
GET  /auth/verify-email?token=   - Verify email with token
POST /auth/resend-verification   - Resend verification email
POST /auth/manual-verify         - Manual verify (dev only)
POST /auth/login                 - Login (requires verified email)
```

## ✨ Summary

- ✅ Email verification is now **required** for login
- ✅ Easy testing with manual verification
- ✅ Production-ready with real email verification
- ✅ Clear error messages
- ✅ Multiple verification options for testing

**For Testing**: Use the manual verify button in the app
**For Production**: Users will click the link in their email

---

**Current Status**: Email verification is ENABLED and ENFORCED ✅
