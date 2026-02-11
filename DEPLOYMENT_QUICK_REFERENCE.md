# Deployment Quick Reference

## Your Current Setup

### Backend
- **Platform:** Railway
- **URL:** https://propertyhomecare-production.up.railway.app (update from howitworksapp)
- **Auto-deploys:** Yes, from GitHub main branch
- **Location:** `/backend` folder

### Admin Dashboard  
- **Platform:** Railway (separate service)
- **Auto-deploys:** Yes, from GitHub main branch
- **Location:** `/admin-dashboard` folder
- **Root Directory:** Set to `admin-dashboard` in Railway

## How to Deploy Changes

### Quick Deploy (Both Backend & Admin)
```bash
# Make your changes, then:
git add .
git commit -m "Your commit message"
git push
```

Railway will automatically:
1. Detect the push
2. Build backend (from `/backend`)
3. Build admin dashboard (from `/admin-dashboard`)
4. Deploy both services

### Deploy Artisan Directory Feature
```bash
chmod +x deploy-artisan-directory.sh
./deploy-artisan-directory.sh
```

This script will:
1. Stage all artisan-related files
2. Commit with a descriptive message
3. Push to GitHub
4. Remind you to run the database migration

## Database Migrations

### For Production (Railway)

**Option 1: Railway CLI**
```bash
cd backend
railway run node run-artisans-migration.js
```

**Option 2: Direct psql**
```bash
psql "$DATABASE_URL" -f migrations/create_artisans_table.sql
```

**Option 3: Railway Dashboard**
1. Go to Railway dashboard
2. Open your backend service
3. Go to "Variables" tab
4. Copy the DATABASE_URL
5. Run locally: `psql "COPIED_URL" -f migrations/create_artisans_table.sql`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Property HomeCare <noreply@propertyhomecare.com.ng>
ADMIN_DASHBOARD_URL=https://your-admin-dashboard.railway.app
```

### Admin Dashboard (.env)
```env
VITE_API_URL=https://propertyhomecare-production.up.railway.app
VITE_APP_NAME=Property HomeCare Admin
```

## Deployment Checklist

### Before Pushing
- [ ] Test locally (backend on :3003, admin on :5173)
- [ ] Check all imports are correct
- [ ] Verify environment variables
- [ ] Run TypeScript checks: `npm run build`

### After Pushing
- [ ] Wait for Railway to build (check dashboard)
- [ ] Run database migrations if needed
- [ ] Test production endpoints
- [ ] Verify admin dashboard loads
- [ ] Test public registration form

## Testing Production

### Backend Health Check
```bash
curl https://propertyhomecare-production.up.railway.app/health
```

### Test Artisan Registration (Public)
```bash
curl -X POST https://propertyhomecare-production.up.railway.app/artisans/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Artisan",
    "phoneNumber": "+2348012345678",
    "email": "test@example.com",
    "address": "123 Test St",
    "city": "Lagos",
    "state": "Lagos",
    "specialty": "Plumber",
    "yearsOfExperience": 5,
    "refereeName": "John Doe",
    "refereePhone": "+2348087654321"
  }'
```

### Test Admin Endpoints (Requires Auth)
```bash
# Login first to get token
curl -X POST https://propertyhomecare-production.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@propertyhomecare.app", "password": "YourPassword"}'

# Then use the token
curl https://propertyhomecare-production.up.railway.app/artisans/admin/all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Common Issues

### Issue: "Failed to load artisans"
**Solution:** Run the database migration on production

### Issue: "ref=undefined" in referral link
**Solution:** Fixed! Backend now uses `req.user.id` instead of `req.user.userId`

### Issue: Railway build fails
**Solution:** Check Railway logs in dashboard, usually missing dependencies or env vars

### Issue: Admin dashboard shows blank page
**Solution:** Check browser console, verify VITE_API_URL is set correctly

## Railway Dashboard Links

- **Backend Service:** Check your Railway dashboard
- **Admin Dashboard Service:** Check your Railway dashboard
- **Database:** Managed by Railway (PostgreSQL)

## Quick Commands

```bash
# Push all changes
git add . && git commit -m "Update" && git push

# Check Railway status
railway status

# View Railway logs
railway logs

# Run command on Railway
railway run <command>

# Link to Railway project
railway link
```

---

**Pro Tip:** Railway auto-deploys on every push to main branch. No manual deployment needed after the initial setup!
