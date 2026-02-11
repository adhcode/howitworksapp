# Deploy Admin Dashboard to Railway - Summary

## What You're Doing

Adding your admin dashboard as a **second service** in Railway, alongside your existing backend.

## Why Separate Services?

✅ Independent scaling
✅ Separate domains  
✅ Deploy independently
✅ Better for production

## The Simple Way (3 Steps)

### 1. Push Code
```bash
chmod +x deploy-admin-dashboard.sh
./deploy-admin-dashboard.sh
```

### 2. Create Service in Railway
- Go to https://railway.app
- Click "+ New" → "GitHub Repo"
- **Set Root Directory: `admin-dashboard`** ⚠️
- Deploy!

### 3. Add Environment Variable
```bash
VITE_API_URL=https://your-backend.railway.app
```

## That's It!

Your admin dashboard will be live at a Railway URL in ~5 minutes.

## Don't Forget

Update backend CORS to allow your admin dashboard domain:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3001',
    'https://your-admin.railway.app', // Add this
  ],
});
```

## Files Created for You

- ✅ `railway.json` - Railway config
- ✅ `nixpacks.toml` - Build instructions
- ✅ `.railwayignore` - Exclude files
- ✅ Updated `vite.config.ts` - Production ready

## Documentation

- **Quick Start**: `ADMIN_DASHBOARD_RAILWAY_QUICK_START.md`
- **Full Guide**: `RAILWAY_ADMIN_DASHBOARD_DEPLOYMENT.md`
- **Checklist**: `ADMIN_DASHBOARD_DEPLOYMENT_CHECKLIST.md`
- **Architecture**: `RAILWAY_ARCHITECTURE.md`

## Need Help?

Check the docs above or Railway logs if something goes wrong.

## Cost

Railway Free Tier ($5/month) should cover both services for development.

---

**Ready?** Run `./deploy-admin-dashboard.sh` to get started! 🚀
