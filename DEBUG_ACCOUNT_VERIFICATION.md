# Debug Account Verification 🔍

## Current Status

Account verification not working. Let's debug step by step.

---

## What I Added

### 1. Comprehensive Logging
Every step now logs to console:
- When you type each digit
- When conditions are met
- When verification is triggered
- When API is called
- When response is received

### 2. Manual Verify Button
- Icon is now clickable
- Can manually trigger verification
- Helps test if auto-verify or API is the issue

### 3. Helper Text
Shows "Tap the icon to verify account" when ready

---

## Testing Steps

### Step 1: Check Console While Typing

Type an account number and watch console for:

```
📝 Account number changed: 0 Length: 1
🏦 Selected bank: Access Bank 044
⏸️ Not auto-verifying yet:
   - Length: 1 (need 10)
   - Bank selected: true

📝 Account number changed: 01 Length: 2
...

📝 Account number changed: 0123456789 Length: 10
✅ Conditions met for auto-verify!
   - Account number length: 10
   - Bank selected: Access Bank
🔄 Triggering auto-verification...
⏰ Timeout fired, calling verifyAccount()
🔍 Verifying account: 0123456789 Bank: Access Bank, 044
```

**If you DON'T see these logs**, the auto-verify isn't triggering.

---

### Step 2: Try Manual Verification

1. Select a bank
2. Type 10-digit account number
3. **Click the checkmark icon**
4. Watch console for:

```
🖱️ Manual verify button clicked
🔍 Verifying account: 0123456789 Bank: Access Bank, 044
🔍 Verifying account: 0123456789 at bank: 044
📥 Verify response: {...}
✅ Account name: John Doe
```

**If manual works but auto doesn't**, it's the auto-trigger logic.
**If manual doesn't work**, it's the API call.

---

### Step 3: Check Backend Logs

When verification is triggered, backend should log:

```
[Nest] LOG [PaymentsController] 🔍 Resolving account: 0123456789 at bank: 044
[Nest] LOG [PaystackService] 🔍 Resolving account: 0123456789 at bank: 044
[Nest] LOG [PaystackService] ✅ Account resolved: John Doe
[Nest] LOG [PaymentsController] ✅ Account resolved successfully: John Doe
```

**If you DON'T see these logs**, the request isn't reaching the backend.

---

## Common Issues & Solutions

### Issue 1: No Logs at All

**Problem**: Console shows nothing when typing

**Possible Causes**:
- App not reloaded after code changes
- Console not visible
- Logs being filtered

**Solution**:
1. Reload the app (shake device → Reload)
2. Check console is open
3. Clear any filters

---

### Issue 2: Auto-Verify Not Triggering

**Symptoms**:
- See typing logs
- See "Not auto-verifying yet" messages
- Never see "Conditions met for auto-verify!"

**Possible Causes**:
- Bank not selected
- Account number not exactly 10 digits
- State not updating

**Solution**:
1. Make sure bank is selected FIRST
2. Type exactly 10 digits
3. Check console for exact length

---

### Issue 3: Verification Called But No Response

**Symptoms**:
- See "🔍 Verifying account..."
- Never see "✅ Verification response"
- No backend logs

**Possible Causes**:
- Backend not running
- Wrong API URL
- Network error
- Auth token expired

**Solution**:
1. Check backend is running
2. Verify API URL: `http://172.20.10.6:3003`
3. Check network connection
4. Try logging out and back in

---

### Issue 4: API Returns Error

**Symptoms**:
- See "❌ Verification error"
- Backend logs show error

**Possible Causes**:
- Invalid account number
- Wrong bank code
- Paystack API error

**Solution**:
1. Check backend error message
2. Verify account number is valid
3. Try different account number
4. Check Paystack status

---

## Manual Test Commands

### Test Backend Directly

```bash
# Get your auth token (from login)
TOKEN="your_jwt_token"

# Test resolve-account endpoint
curl -X POST http://172.20.10.6:3003/payments/resolve-account \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "0123456789",
    "bank_code": "044"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "account_number": "0123456789",
    "account_name": "John Doe",
    "bank_id": 1
  }
}
```

---

## What to Share for Debugging

If it still doesn't work, share:

1. **Console logs** when typing account number
2. **Console logs** when clicking verify icon
3. **Backend logs** (if any)
4. **Any error messages** shown
5. **Screenshots** of the screen

---

## Quick Checklist

Before reporting issue, verify:

- [ ] Backend is running
- [ ] Mobile app is connected to backend
- [ ] Bank is selected
- [ ] Account number is exactly 10 digits
- [ ] Console is open and visible
- [ ] App was reloaded after code changes
- [ ] Tried manual verification (click icon)
- [ ] Checked backend logs

---

## Expected Behavior

### When Working Correctly:

1. **Select bank** → "Access Bank" shows
2. **Type 1st digit** → Console: "Length: 1"
3. **Type 2nd-9th digits** → Console shows each
4. **Type 10th digit** → Console: "Conditions met!"
5. **Auto-verify triggers** → Spinner appears
6. **API calls backend** → Backend logs show
7. **Response received** → Account name appears
8. **Green checkmark** → Verification complete

### Visual Feedback:

```
Before typing:
[Enter 10-digit account number]

While typing (1-9 digits):
[012345678_]

At 10 digits (verifying):
[0123456789] ⏳

After verification:
[0123456789] ✅

Below input:
Account Name: John Doe
```

---

## Next Steps

1. **Try the app now** with the new logging
2. **Watch the console** carefully
3. **Try manual verification** by clicking icon
4. **Share the console output** if it still doesn't work

The detailed logs will tell us exactly where it's failing!

---

**Status**: 🟡 DEBUGGING MODE ACTIVE

All logging is in place. Let's see what the console tells us!
