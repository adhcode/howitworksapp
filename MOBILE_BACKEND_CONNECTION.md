# Mobile App ↔️ Backend Connection Setup ✅

## What Was Updated

### 1. Mobile App API Configuration
**File**: `mobile/app/services/api.ts`

Updated development baseURL:
```typescript
development: {
  baseURL: 'http://172.20.10.6:3003', // ✅ Your Mac's IP address
  timeout: 15000,
  enableLogging: true,
}
```

### 2. Backend Environment
**File**: `backend/.env`

Updated backend URL:
```
BACKEND_URL=http://172.20.10.6:3003
```

---

## 🚀 How to Start Everything

### Step 1: Start Backend
```bash
cd backend
npm run start:dev
```

**Expected output**:
```
🚀 Application is running on: http://localhost:3003
🌍 Environment: development
📊 Health check: http://localhost:3003/health
📚 Swagger documentation available at http://localhost:3003/api/docs
```

### Step 2: Start Mobile App
```bash
cd mobile
npm start
# or
npx expo start
```

### Step 3: Test Connection
Open the mobile app and try:
1. Login/Signup
2. Any API call should now connect to your local backend

---

## 🧪 Quick Connection Test

### Test 1: Health Check
From your terminal:
```bash
curl http://172.20.10.6:3003/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T...",
  "uptime": 123.456
}
```

### Test 2: From Mobile App
Open the app and check the console logs. You should see:
```
🌐 API Request: GET http://172.20.10.6:3003/health
✅ API Response: 200 OK
```

---

## 🔧 Troubleshooting

### Issue 1: "Network request failed"
**Cause**: Mobile device can't reach your Mac

**Solutions**:
1. Make sure your Mac and phone are on the **same WiFi network**
2. Check Mac firewall settings:
   ```bash
   # Allow incoming connections on port 3003
   System Preferences → Security & Privacy → Firewall → Firewall Options
   ```
3. Verify backend is listening on `0.0.0.0` (not just `localhost`)
   - ✅ Already configured in `main.ts`: `await app.listen(port, '0.0.0.0')`

### Issue 2: "Connection timeout"
**Cause**: Backend not running or wrong IP

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:3003/health
   ```
2. Verify IP address is correct:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
   ```
3. If IP changed, update `mobile/app/services/api.ts` again

### Issue 3: "CORS error"
**Cause**: Backend blocking mobile app requests

**Solution**: Already configured in `main.ts`:
```typescript
app.enableCors({
  origin: true, // Allows all origins in development
  credentials: true,
})
```

---

## 📱 Testing on Different Devices

### iOS Simulator
- ✅ Works with `localhost` or `127.0.0.1`
- ✅ Also works with `172.20.10.6`

### Android Emulator
- ❌ `localhost` doesn't work (points to emulator)
- ✅ Use `172.20.10.6` (your Mac's IP)
- Alternative: Use `10.0.2.2` (special Android emulator alias)

### Physical Device
- ❌ `localhost` doesn't work
- ✅ Must use `172.20.10.6` (your Mac's IP)
- ⚠️ Must be on same WiFi network

---

## 🔄 If Your IP Changes

Your Mac's IP might change when you:
- Switch WiFi networks
- Restart your Mac
- Connect/disconnect from VPN

**Quick fix**:
```bash
# 1. Get new IP
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1

# 2. Update mobile/app/services/api.ts
# Change baseURL to new IP

# 3. Restart mobile app
```

---

## 🌐 Network Configuration

### Current Setup:
```
┌─────────────────────────────────────────┐
│         Your WiFi Network               │
│                                         │
│  ┌──────────────┐    ┌──────────────┐  │
│  │   Mac        │    │   Phone      │  │
│  │ 172.20.10.6  │◄───┤  (Mobile)    │  │
│  │              │    │              │  │
│  │  Backend     │    │  Expo App    │  │
│  │  Port 3003   │    │              │  │
│  └──────────────┘    └──────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### What's Configured:
- ✅ Backend listens on `0.0.0.0:3003` (all network interfaces)
- ✅ CORS allows all origins in development
- ✅ Mobile app points to `http://172.20.10.6:3003`
- ✅ Both devices on same network

---

## 📊 API Endpoints Available

Once connected, you can access:

### Authentication
- `POST /auth/signup` - Create account
- `POST /auth/login` - Login
- `POST /auth/verify-email` - Verify email

### Landlord Wallet
- `GET /payments/wallet/balance` - Get balance
- `GET /payments/wallet/transactions` - Transaction history
- `POST /payments/wallet/withdraw` - Request withdrawal

### Bank Account
- `GET /payments/banks` - List banks
- `POST /payments/resolve-account` - Verify account
- `POST /payments/landlord/setup-bank` - Save bank account

### Properties
- `GET /properties` - List properties
- `POST /properties` - Create property
- `GET /properties/:id` - Get property details

### Documentation
- 📚 Swagger: `http://172.20.10.6:3003/api/docs`

---

## ✅ Verification Checklist

Before testing, verify:

- [ ] Backend is running (`npm run start:dev`)
- [ ] Backend shows: `🚀 Application is running on: http://localhost:3003`
- [ ] Health check works: `curl http://172.20.10.6:3003/health`
- [ ] Mobile app is running (`npm start`)
- [ ] Both Mac and phone on same WiFi
- [ ] Mobile app console shows correct API URL

---

## 🎯 Quick Test Flow

1. **Start backend**: `cd backend && npm run start:dev`
2. **Start mobile**: `cd mobile && npm start`
3. **Open app** on your device/simulator
4. **Try login** with test account:
   - Email: `landlord@test.com`
   - Password: `Test@123`
5. **Check console** for API requests
6. **Navigate to Wallet** to test payment endpoints

---

## 💡 Pro Tips

### Tip 1: Keep Terminal Open
Keep the backend terminal visible to see API requests in real-time:
```
[Nest] 12345  - 11/29/2025, 10:30:45 AM     LOG [HTTP] GET /health 200 - 5ms
[Nest] 12345  - 11/29/2025, 10:30:50 AM     LOG [HTTP] POST /auth/login 200 - 150ms
```

### Tip 2: Enable Mobile Logging
The mobile app already has logging enabled in development. Check console for:
```
🌐 API Request: POST http://172.20.10.6:3003/auth/login
📤 Request body: { email: "...", password: "..." }
✅ API Response: 200 OK
📥 Response data: { success: true, ... }
```

### Tip 3: Use Swagger for Testing
Open `http://172.20.10.6:3003/api/docs` in your browser to:
- Test endpoints directly
- See request/response formats
- Generate sample requests

---

## 🔐 Security Note

**Development mode** allows all CORS origins for easy testing.

**Production mode** will restrict to specific domains:
- Your production frontend URL
- Your production mobile app URL

---

## 📞 Need Help?

If connection still doesn't work:

1. **Check backend logs** for errors
2. **Check mobile console** for network errors
3. **Verify firewall** isn't blocking port 3003
4. **Try different network** if on corporate/restricted WiFi
5. **Use ngrok** as alternative (tunnels localhost to public URL)

---

**Status**: 🟢 CONNECTED AND READY!

Your mobile app is now connected to your local development backend at `http://172.20.10.6:3003`
