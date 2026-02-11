# Email Delivery Debugging Guide

## Issue: Verification Emails Not Received Until Resend

### Possible Causes

1. **Email Service Not Initialized**
2. **Resend API Key Invalid**
3. **Domain Not Verified**
4. **Email Going to Spam**
5. **Silent Failure in Code**
6. **Rate Limiting**

## Quick Diagnosis

### Step 1: Test Email Service

```bash
cd backend
ts-node test-email-sending.ts
```

Replace `test@example.com` with your actual email address in the script.

### Step 2: Check Resend Dashboard

1. Go to https://resend.com/dashboard
2. Check "Logs" section
3. Look for failed sends
4. Check domain verification status

### Step 3: Check Backend Logs

```bash
# Start backend in dev mode
npm run start:dev

# Watch for email-related logs
# Look for:
# - "Verification email sent to..."
# - "Resend not configured..."
# - "Failed to send verification email..."
```

## Common Issues & Fixes

### Issue 1: Domain Not Verified

**Symptom**: Emails not sending at all

**Check**:
```bash
# In backend/.env
RESEND_FROM_EMAIL="HowitWorks <noreply@howitworks.com.ng>"
```

**Fix**:
1. Go to Resend Dashboard → Domains
2. Verify `howitworks.com.ng` domain
3. Add DNS records as instructed
4. Wait for verification (can take up to 48 hours)

**Temporary Workaround**:
Use Resend's test domain:
```env
RESEND_FROM_EMAIL="onboarding@resend.dev"
```

### Issue 2: Silent Failure in Registration

**Current Code** (auth.service.ts):
```typescript
try {
  await this.emailService.sendVerificationCodeEmail(...);
} catch (error) {
  console.error('Failed to send verification email:', error);
  // Don't fail registration if email fails, just log it
}
```

**Problem**: Registration succeeds even if email fails

**Fix**: Add better error handling

### Issue 3: Email in Spam Folder

**Check**:
- Gmail: Check "Spam" and "Promotions" folders
- Outlook: Check "Junk" folder

**Fix**:
1. Mark as "Not Spam"
2. Add sender to contacts
3. Improve email authentication (SPF, DKIM, DMARC)

### Issue 4: Rate Limiting

**Resend Free Tier Limits**:
- 100 emails/day
- 3,000 emails/month

**Check**: Resend Dashboard → Usage

**Fix**: Upgrade plan if needed

## Improved Error Handling

### Update auth.service.ts

```typescript
async register(registerDto: RegisterDto): Promise<{ message: string; email: string }> {
  // ... existing code ...

  // Send verification email with better error handling
  try {
    await this.emailService.sendVerificationCodeEmail(
      user.email,
      user.firstName,
      emailVerificationCode
    );
    
    this.logger.log(`✅ Verification email sent to ${user.email}`);
    
  } catch (error) {
    this.logger.error(`❌ Failed to send verification email to ${user.email}:`, error);
    
    // Log specific error details
    if (error.message) {
      this.logger.error(`Error message: ${error.message}`);
    }
    
    // Still allow registration to succeed
    // User can request resend later
  }

  return {
    message: 'Registration successful. Please check your email for the verification code.',
    email: user.email,
  };
}
```

### Update email.service.ts

Add better logging in `sendVerificationCodeEmail`:

```typescript
async sendVerificationCodeEmail(email: string, firstName: string, code: string): Promise<void> {
  if (!this.resend) {
    this.logger.error('❌ Resend not configured! Check RESEND_API_KEY in .env');
    throw new Error('Email service not configured');
  }

  this.logger.log(`📧 Attempting to send verification email to ${email}...`);

  try {
    const { data, error } = await this.resend.emails.send({
      from: this.configService.get('RESEND_FROM_EMAIL'),
      to: [email],
      subject: 'Verify Your Email Address - Property HomeCare',
      html: `...`
    });

    if (error) {
      this.logger.error(`❌ Resend API error:`, error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    this.logger.log(`✅ Verification email sent successfully! Message ID: ${data?.id}`);
    
  } catch (error) {
    this.logger.error(`❌ Failed to send verification email:`, error);
    throw error;
  }
}
```

## Testing Checklist

- [ ] Resend API key is valid
- [ ] Domain is verified in Resend
- [ ] Email service initializes without errors
- [ ] Backend logs show email sending attempts
- [ ] Check spam/junk folders
- [ ] Test with different email providers (Gmail, Outlook, etc.)
- [ ] Check Resend dashboard logs
- [ ] Verify rate limits not exceeded

## Manual Test

### 1. Register New User

```bash
curl -X POST http://localhost:3003/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "landlord"
  }'
```

### 2. Check Backend Logs

Look for:
```
[EmailService] 📧 Attempting to send verification email to test@example.com...
[EmailService] ✅ Verification email sent successfully! Message ID: xxx
```

### 3. Check Email Inbox

- Check primary inbox
- Check spam folder
- Check promotions tab (Gmail)
- Wait 1-2 minutes for delivery

### 4. If No Email, Resend

```bash
curl -X POST http://localhost:3003/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Resend Dashboard Check

1. Login to https://resend.com
2. Go to "Logs" section
3. Filter by:
   - Status: Failed
   - Date: Today
4. Check error messages

## Common Resend Errors

### "Domain not verified"
**Fix**: Verify domain in Resend dashboard

### "Invalid API key"
**Fix**: Check RESEND_API_KEY in .env

### "Rate limit exceeded"
**Fix**: Wait or upgrade plan

### "Invalid recipient"
**Fix**: Check email format

## Production Checklist

Before deploying to production:

- [ ] Domain verified in Resend
- [ ] SPF record added to DNS
- [ ] DKIM record added to DNS
- [ ] DMARC record added to DNS
- [ ] Test emails from production
- [ ] Monitor Resend logs
- [ ] Set up email alerts
- [ ] Configure proper error handling
- [ ] Add retry logic for failed sends

## Monitoring

### Add Email Monitoring

```typescript
// In email.service.ts
private emailStats = {
  sent: 0,
  failed: 0,
  lastError: null
};

async sendVerificationCodeEmail(...) {
  try {
    // ... send email ...
    this.emailStats.sent++;
  } catch (error) {
    this.emailStats.failed++;
    this.emailStats.lastError = error.message;
    throw error;
  }
}

getStats() {
  return this.emailStats;
}
```

### Add Health Check Endpoint

```typescript
// In auth.controller.ts
@Get('email-health')
async checkEmailHealth() {
  return this.emailService.getStats();
}
```

## Quick Fix Script

```bash
#!/bin/bash
# fix-email-delivery.sh

echo "🔍 Checking email configuration..."

# Check if RESEND_API_KEY is set
if grep -q "RESEND_API_KEY=" backend/.env; then
    echo "✅ RESEND_API_KEY found in .env"
else
    echo "❌ RESEND_API_KEY not found in .env"
    echo "Add: RESEND_API_KEY=your_key_here"
fi

# Check if domain is configured
if grep -q "RESEND_FROM_EMAIL=" backend/.env; then
    echo "✅ RESEND_FROM_EMAIL found in .env"
    grep "RESEND_FROM_EMAIL=" backend/.env
else
    echo "❌ RESEND_FROM_EMAIL not found in .env"
fi

# Test email sending
echo ""
echo "📧 Testing email sending..."
cd backend && ts-node test-email-sending.ts
```

## Summary

Most likely causes:
1. **Domain not verified** - Use `onboarding@resend.dev` temporarily
2. **Silent failure** - Check backend logs
3. **Spam folder** - Check all email folders

Run the test script to diagnose:
```bash
cd backend
ts-node test-email-sending.ts
```
