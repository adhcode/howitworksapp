# 🚀 Quick Notification Setup

## ✅ Status Check

- [x] Mobile dependencies installed
- [x] NotificationProvider already wrapped in _layout.tsx
- [ ] Backend dependency (run command below)
- [ ] Database migration (run command below)

## Step 1: Install Backend Dependency

```bash
cd backend
npm install expo-server-sdk
cd ..
```

## Step 2: Run Database Migration

Your database credentials from .env:
- **Host**: yamanote.proxy.rlwy.net
- **Port**: 34012
- **Database**: railway
- **User**: postgres
- **Password**: IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH

### Option A: Using psql directly
```bash
cd backend
PGPASSWORD=IcdtLaWOtASJiwDEDAhlNhLIiHhIrWxH psql -h yamanote.proxy.rlwy.net -p 34012 -U postgres -d railway -f create_notifications_tables.sql
```

### Option B: Using the script
```bash
cd backend
chmod +x run-notification-migration.sh
./run-notification-migration.sh
```

### Option C: Manual SQL (if psql not available)
1. Connect to your Railway database using their web interface or any PostgreSQL client
2. Copy the contents of `backend/create_notifications_tables.sql`
3. Run it in the SQL query window

## Step 3: Restart Backend

```bash
cd backend
npm run start:dev
```

## Step 4: Test on Device

```bash
cd mobile
npx expo start
```

Then:
1. Scan QR code with Expo Go app
2. Login to the app
3. Check console for:
   - ✅ Got push token: ExponentPushToken[...]
   - ✅ Push token registered with backend

## Step 5: Test Notifications

1. **As Tenant**: Create a maintenance request
2. **Check**: Landlord/Facilitator should receive notification
3. **As Landlord**: Update the status
4. **Check**: Tenant should receive notification

## Troubleshooting

### If migration fails:
- Check if you can connect to the database
- Verify the database URL in .env is correct
- Try using Railway's web SQL editor

### If notifications don't work:
- Make sure you're using a physical device (not simulator)
- Check that notification permissions are granted
- Verify backend is running
- Check backend logs for errors

## Quick Test Command

After everything is set up, test with this curl command:

```bash
# Get your JWT token from the app (check network tab or login response)
curl -X POST http://localhost:3003/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "your-user-id",
    "title": "Test Notification",
    "body": "This is a test notification",
    "type": "general"
  }'
```

## ✅ You're Ready!

Once you complete these steps, your notification system will be fully operational!
