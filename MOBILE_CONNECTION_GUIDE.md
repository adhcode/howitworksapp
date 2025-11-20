# Mobile App Connection Guide

## Quick Fix

Your mobile app is now configured to connect to: `http://192.168.1.6:3003`

## Steps to Test

### 1. Make Sure Backend is Running
```bash
cd backend
npm run start:dev
```

Wait for: `[Nest] Application successfully started`

### 2. Test Backend Connection
```bash
chmod +x test-backend-connection.sh
./test-backend-connection.sh
```

### 3. Restart Mobile App
```bash
cd mobile
npm start
```

Press `r` to reload the app.

## Common Issues & Solutions

### Issue 1: "Request Aborted" or "Network Error"

**Cause**: Mobile device can't reach backend

**Solutions**:
1. **Check same WiFi network**
   - Mac and mobile device must be on the same WiFi
   - Not mobile data, not different WiFi

2. **Check firewall**
   ```bash
   # macOS: Allow incoming connections on port 3003
   # System Settings → Network → Firewall → Options
   # Add Node.js or allow port 3003
   ```

3. **Verify IP address**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
   ```
   
   If IP changed, update `mobile/app/services/api.ts`:
   ```typescript
   baseURL: 'http://YOUR_NEW_IP:3003'
   ```

### Issue 2: Backend Not Starting

**Solutions**:
```bash
cd backend
npm install
npm run start:dev
```

Check for TypeScript errors and fix them.

### Issue 3: "Cannot connect to localhost"

**Cause**: Using `localhost` instead of IP address

**Solution**: 
Mobile devices can't access `localhost` on your Mac. Always use your Mac's IP address.

### Issue 4: IP Address Keeps Changing

**Cause**: DHCP assigns different IPs

**Solutions**:
1. **Set static IP on Mac**
   - System Settings → Network → WiFi → Details → TCP/IP
   - Configure IPv4: Manually
   - Set a static IP (e.g., 192.168.1.100)

2. **Or update mobile config when IP changes**
   ```bash
   # Get new IP
   ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
   
   # Update mobile/app/services/api.ts
   ```

## Testing Connection

### Test 1: From Terminal
```bash
curl http://192.168.1.6:3003/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-08T..."
}
```

### Test 2: From Browser
Open: `http://192.168.1.6:3003/health`

Should see JSON response.

### Test 3: From Mobile App
1. Open app
2. Try to register or login
3. Check terminal for API logs

## Network Configuration

### Required Setup
```
Mac (Backend)          Mobile Device
192.168.1.6:3003  ←→  Same WiFi Network
```

### Port Requirements
- Backend runs on port **3003**
- Firewall must allow incoming connections on port 3003
- Router must allow local network communication

## Debugging Tips

### 1. Check Backend Logs
Watch the backend terminal for incoming requests:
```
[Nest] POST /auth/register
[Nest] POST /auth/login
```

### 2. Check Mobile Logs
Watch the mobile terminal for API calls:
```
[API] POST /auth/register
[API] ✅ Request successful
```

### 3. Enable Verbose Logging
In `mobile/app/services/api.ts`, logging is already enabled in development:
```typescript
enableLogging: true
```

### 4. Test with Postman/Insomnia
Test backend endpoints directly:
```
POST http://192.168.1.6:3003/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456",
  "firstName": "Test",
  "lastName": "User",
  "phoneNumber": "+2348012345678",
  "role": "tenant"
}
```

## Production Setup

For production, update the production URL in `mobile/app/services/api.ts`:
```typescript
production: {
  baseURL: 'https://your-production-api.com',
  timeout: 15000,
  enableLogging: false,
}
```

## Quick Reference

### Get Your IP
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

### Test Backend
```bash
curl http://$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1):3003/health
```

### Update Mobile Config
```bash
# Edit mobile/app/services/api.ts
# Change baseURL to your current IP
```

### Restart Everything
```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Mobile
cd mobile && npm start
```

## Success Indicators

✅ Backend shows: `Application successfully started`
✅ `curl http://192.168.1.6:3003/health` returns JSON
✅ Mobile app shows: `[API] ✅ Request successful`
✅ Registration/login works
✅ Emails are sent

## Still Having Issues?

1. Restart your Mac
2. Restart your mobile device
3. Reconnect to WiFi
4. Check router settings (allow local network communication)
5. Try a different WiFi network
6. Use a physical device instead of simulator (or vice versa)

---

**Current Configuration**: `http://192.168.1.6:3003`
**Last Updated**: 2025-11-08
