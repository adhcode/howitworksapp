# Paystack Banks API - Debug Guide 🔍

## Issue
Getting "No banks available, please try again" error when trying to fetch banks list.

---

## ✅ What I've Done

### 1. **Added Better Logging**
- Backend now logs Paystack API calls
- Shows number of banks returned
- Logs errors with details

### 2. **Improved Error Handling**
- Better error messages
- Passes Paystack errors to frontend
- Checks for empty responses

### 3. **Created Test Script**
- Direct Paystack API test
- Verifies credentials
- Shows detailed output

---

## 🧪 Testing Steps

### Step 1: Test Paystack API Directly

Run this command in the backend folder:

```bash
cd backend
npx ts-node test-paystack-banks.ts
```

**Expected Output**:
```
🧪 Testing Paystack Banks API...

✅ Paystack secret key found
   Key: sk_test_b685e7...

📡 Making request to Paystack...
   URL: https://api.paystack.co/bank
   Params: { country: "nigeria", perPage: 100 }

✅ Request successful!
   Status: 200
   Status Text: OK

🏦 Banks received: 25

📋 First 10 banks:
   1. Access Bank (044)
   2. GTBank (058)
   3. First Bank (011)
   ...

✅ Paystack banks API is working correctly!
```

**If it fails**, you'll see detailed error information.

---

### Step 2: Test Backend Endpoint

With backend running, test the endpoint:

```bash
# Get your auth token first (login)
TOKEN="your_jwt_token_here"

# Test banks endpoint
curl -X GET http://172.20.10.6:3003/payments/banks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Access Bank",
      "code": "044",
      "active": true
    },
    ...
  ]
}
```

---

### Step 3: Check Backend Logs

When you make the request, check backend console for:

```
🏦 Fetching banks list from Paystack (country: nigeria)
✅ Paystack returned 25 banks
```

Or if there's an error:
```
❌ Paystack banks API error: [error message]
   Status: [status code]
   Data: [error details]
```

---

## 🔍 Common Issues & Solutions

### Issue 1: Invalid Paystack Key

**Symptoms**:
- 401 Unauthorized error
- "Invalid key" message

**Solution**:
```bash
# Verify key in backend/.env
cat backend/.env | grep PAYSTACK_SECRET_KEY

# Should show:
PAYSTACK_SECRET_KEY="sk_test_..."

# Make sure it starts with sk_test_ (test mode) or sk_live_ (live mode)
```

---

### Issue 2: Network/Firewall Block

**Symptoms**:
- Timeout errors
- Connection refused
- No response

**Solution**:
1. Check internet connection
2. Try accessing Paystack directly:
   ```bash
   curl https://api.paystack.co/bank?country=nigeria
   ```
3. Check if firewall is blocking Paystack
4. Try from different network

---

### Issue 3: Paystack API Down

**Symptoms**:
- 500 server errors
- Service unavailable

**Solution**:
1. Check Paystack status: https://status.paystack.com
2. Wait and retry
3. Contact Paystack support if persistent

---

### Issue 4: Wrong Country Parameter

**Symptoms**:
- Empty array returned
- No banks in response

**Solution**:
```typescript
// Ensure country is 'nigeria' (lowercase)
await this.paystackService.listBanks('nigeria');
```

---

### Issue 5: Rate Limiting

**Symptoms**:
- 429 Too Many Requests
- Rate limit exceeded

**Solution**:
1. Wait a few minutes
2. Implement caching (future enhancement)
3. Reduce API calls

---

## 📊 Backend Logs to Watch

### Successful Request:
```
[Nest] INFO [PaystackService] 🏦 Fetching banks list from Paystack (country: nigeria)
[Nest] INFO [PaystackService] ✅ Paystack returned 25 banks
[Nest] INFO [HTTP] GET /payments/banks 200 - 1234ms
```

### Failed Request:
```
[Nest] ERROR [PaystackService] ❌ Paystack banks API error: Request failed
[Nest] ERROR [PaystackService]    Status: 401
[Nest] ERROR [PaystackService]    Data: {"status":false,"message":"Invalid key"}
[Nest] ERROR [HTTP] GET /payments/banks 400 - 234ms
```

---

## 🔧 Quick Fixes

### Fix 1: Restart Backend
```bash
# Stop backend (Ctrl+C)
# Start again
cd backend
npm run start:dev
```

### Fix 2: Verify Environment Variables
```bash
cd backend
cat .env | grep PAYSTACK
```

Should show:
```
PAYSTACK_SECRET_KEY="sk_test_b685e7de44470c76ae9aee0e9af61ee2c9c5dd96"
PAYSTACK_PUBLIC_KEY="pk_test_e9935687215fbe899d2f7442b6a63824b4e23afe"
```

### Fix 3: Test Paystack Credentials
Visit: https://dashboard.paystack.com/#/settings/developer

Verify:
- Test Secret Key matches .env
- API is enabled
- No restrictions on your IP

---

## 📱 Mobile App Debugging

### Check Console Logs:

When you open bank setup, you should see:

```
🏦 Fetching banks list...
🌐 API: Fetching banks from /payments/banks
📥 API: Banks response: {...}
✅ API: Banks data found: 25 banks
✅ Banks loaded successfully: 25
```

### If You See Errors:

```
❌ Error loading banks: [error]
❌ Error message: [details]
```

This tells you:
1. If it's a network error (can't reach backend)
2. If it's an API error (backend returned error)
3. If it's a data error (empty response)

---

## 🎯 Testing Checklist

- [ ] Run test script: `npx ts-node test-paystack-banks.ts`
- [ ] Verify Paystack key in .env
- [ ] Check backend is running
- [ ] Test endpoint with curl
- [ ] Check backend logs
- [ ] Test from mobile app
- [ ] Check mobile console logs

---

## 💡 Alternative: Use Mock Data (Temporary)

If Paystack is down or blocked, you can temporarily use mock data:

```typescript
// In backend/src/core/payments/paystack.service.ts
async listBanks(country: string = 'nigeria') {
  // Temporary mock data
  return {
    status: true,
    data: [
      { id: 1, name: 'Access Bank', code: '044', active: true },
      { id: 2, name: 'GTBank', code: '058', active: true },
      { id: 3, name: 'First Bank', code: '011', active: true },
      { id: 4, name: 'Zenith Bank', code: '057', active: true },
      { id: 5, name: 'UBA', code: '033', active: true },
      // ... add more banks
    ]
  };
}
```

**Note**: Remove mock data once Paystack is working!

---

## 📞 Next Steps

1. **Run the test script** to verify Paystack connection
2. **Check backend logs** when making requests
3. **Test the endpoint** with curl
4. **Check mobile logs** for API errors
5. **Report findings** so we can fix the specific issue

---

## 🔗 Useful Links

- Paystack API Docs: https://paystack.com/docs/api/
- Banks List Endpoint: https://paystack.com/docs/api/miscellaneous/#bank
- Paystack Status: https://status.paystack.com
- Paystack Dashboard: https://dashboard.paystack.com

---

**Status**: 🟡 DEBUGGING IN PROGRESS

Run the test script and share the output to identify the exact issue!
