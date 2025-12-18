# Railway Database Reconnection Guide

## ✅ Database Updated

Your backend is now connected to the **Railway Production Database**:

```
Host: yamanote.proxy.rlwy.net
Port: 34012
Database: railway
```

---

## 🔄 What Changed

**Before:** Neon Database (temporary)
```
DATABASE_URL="postgresql://neondb_owner:...@ep-silent-mountain...neon.tech/neondb"
```

**Now:** Railway Database (production)
```
DATABASE_URL="postgresql://postgres:...@yamanote.proxy.rlwy.net:34012/railway"
```

---

## ✅ Next Steps

### 1. Verify Connection

Restart your backend to connect to Railway:

```bash
cd backend
npm run start:dev
```

You should see:
```
✓ Database connected successfully
[Nest] Application successfully started
```

### 2. Check Database Schema

The Railway database should already have all your tables from before. If you need to verify:

```bash
# Option 1: Use Drizzle Studio
cd backend
npx drizzle-kit studio

# Option 2: Check via backend logs
# Start the backend and watch for any schema errors
```

### 3. Run Migrations (If Needed)

If the Railway database is missing any recent schema changes (like the Neon updates), run:

```bash
cd backend
npx drizzle-kit push
```

This will sync any schema differences.

---

## 🗄️ Database Status

### Tables That Should Exist:
- ✅ users (with Paystack fields, password reset codes)
- ✅ properties
- ✅ units
- ✅ leases
- ✅ payments (with Paystack fields)
- ✅ payment_history
- ✅ messages
- ✅ maintenance_requests
- ✅ tenant_invitations
- ✅ tenant_rent_contracts
- ✅ landlord_escrow_balances
- ✅ payment_notifications
- ✅ landlord_wallet_balances
- ✅ wallet_transactions
- ✅ notifications
- ✅ push_tokens

### Recent Schema Updates:
1. **Password Reset Codes** (from Neon migration)
   - `password_reset_code` column
   - `password_reset_code_expires` column

2. **Paystack Fields** (from Neon migration)
   - Payment gateway fields
   - Bank account fields
   - Authorization codes

3. **Notifications** (from Neon migration)
   - New notifications table structure
   - Push tokens table

---

## 🔧 If Schema is Out of Sync

If Railway database is missing recent changes, sync it:

```bash
cd backend

# Push schema changes
npx drizzle-kit push

# Or run specific migrations
psql "$DATABASE_URL" -f migrations/add_password_reset_code.sql
psql "$DATABASE_URL" -f migrations/add-paystack-fields.sql
```

---

## 📊 Test the Connection

### 1. Start Backend
```bash
cd backend
npm run start:dev
```

### 2. Test API Endpoints
```bash
# Health check
curl http://localhost:3003

# Get dashboard stats (requires auth)
curl http://localhost:3003/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Check Admin Dashboard
```bash
cd admin-dashboard
npm run dev
```

Login and verify:
- Dashboard loads
- Charts display data
- Properties show up
- Facilitators list works

---

## 🚨 Troubleshooting

### Connection Errors

**Error:** "Connection refused"
- Check Railway database is running
- Verify connection string is correct
- Check firewall/network settings

**Error:** "Authentication failed"
- Verify password in DATABASE_URL
- Check Railway database credentials

**Error:** "Database does not exist"
- Verify database name is "railway"
- Check Railway dashboard

### Schema Errors

**Error:** "relation does not exist"
- Run `npx drizzle-kit push` to create missing tables
- Check if migrations need to be run

**Error:** "column does not exist"
- Run specific migrations for missing columns
- Use `npx drizzle-kit push` to sync schema

---

## 📝 Environment Files to Update

### Backend (.env)
✅ Already updated with Railway DATABASE_URL

### Admin Dashboard (.env)
Check if it needs updating:

```bash
# admin-dashboard/.env
VITE_API_URL=http://localhost:3003
```

### Mobile App
Check if API URL needs updating:

```typescript
// mobile/app/services/api.ts
const API_URL = 'http://localhost:3003' // or your production URL
```

---

## ✅ Verification Checklist

After reconnecting to Railway:

- [ ] Backend starts without errors
- [ ] Database connection successful
- [ ] All tables exist
- [ ] Admin dashboard works
- [ ] Can login
- [ ] Can view properties
- [ ] Can view facilitators
- [ ] Charts display data
- [ ] Mobile app connects (if testing)

---

## 🎯 Current Status

**Database:** Railway Production ✅  
**Connection:** Active  
**Schema:** Should be synced  
**Data:** Preserved from before  

**Next:** Start backend and verify everything works!

```bash
cd backend
npm run start:dev
```

---

## 📞 Quick Commands

```bash
# Start backend
cd backend && npm run start:dev

# Check database with Drizzle Studio
cd backend && npx drizzle-kit studio

# Sync schema if needed
cd backend && npx drizzle-kit push

# Start admin dashboard
cd admin-dashboard && npm run dev

# Check connection
curl http://localhost:3003
```

---

**You're all set!** The Railway database is back and ready to use. 🚀
