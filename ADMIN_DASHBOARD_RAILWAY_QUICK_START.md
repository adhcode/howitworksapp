# Admin Dashboard Railway Deployment - Quick Start

## What We're Doing

Deploying your admin dashboard as a **separate Railway service** alongside your existing backend.

## Files Created

✅ `admin-dashboard/railway.json` - Railway config
✅ `admin-dashboard/nixpacks.toml` - Build instructions  
✅ `admin-dashboard/.railwayignore` - Files to exclude
✅ `admin-dashboard/.env.example` - Environment template
✅ Updated `admin-dashboard/vite.config.ts` - Production settings

## Quick Deploy (3 Steps)

### 1. Push Code

```bash
chmod +x deploy-admin-dashboard.sh
./deploy-admin-dashboard.sh
```

Or manually:
```bash
git add admin-dashboard/
git commit -m "Add Railway deployment config"
git push
```

### 2. Create Service in Railway

Go to https://railway.app → Your Project → **+ New** → **GitHub Repo**

**Important Settings:**
- Repository: Select your repo
- **Root Directory**: `admin-dashboard` ⚠️ Don't forget this!
- Branch: `main`

### 3. Add Environment Variable

In Railway dashboard for the new service:

**Settings** → **Variables** → **+ New Variable**

```
VITE_API_URL=https://your-backend.railway.app
```

Replace `your-backend.railway.app` with your actual backend URL.

## That's It!

Railway will:
1. Detect it's a Vite app
2. Run `npm install`
3. Run `npm run build`
4. Start preview server
5. Give you a URL

## Get Your URLs

### Backend URL
In Railway dashboard → Backend service → Settings → Domains

### Admin Dashboard URL  
In Railway dashboard → Admin Dashboard service → Settings → Domains

## Update Backend CORS

Your backend needs to allow requests from the admin dashboard domain.

In `backend/src/main.ts`, update CORS:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3001',
    'https://your-admin-dashboard.railway.app', // Add this
  ],
  credentials: true,
});
```

## Verify Deployment

1. Visit your admin dashboard URL
2. Try logging in
3. Check browser console for errors
4. Verify API calls work

## Common Issues

### "Cannot connect to backend"
- Check VITE_API_URL is set correctly in Railway
- Check backend CORS allows your admin domain
- Check backend is running

### "404 on page refresh"
- Should work automatically with our config
- If not, check vite.config.ts preview settings

### "Build failed"
- Check Railway logs
- Verify ROOT_DIRECTORY is set to `admin-dashboard`
- Check package.json exists in admin-dashboard/

## Cost

Railway Free Tier:
- $5 credit/month
- Enough for 2 small services (backend + admin)

If you need more, upgrade to Pro ($20/month).

## Alternative: Single Service

If you want to save resources, you can serve the admin dashboard from your backend:

```bash
# Build admin dashboard
cd admin-dashboard
npm run build

# Copy to backend
cp -r dist ../backend/public/admin

# Access at: https://your-backend.railway.app/admin
```

But separate services are better for production!

## Next Steps

After deployment:
- [ ] Set up custom domain (admin.yourdomain.com)
- [ ] Configure auto-deploy on push
- [ ] Set up monitoring
- [ ] Add health checks

## Quick Reference

```bash
# View logs
railway logs

# Redeploy
railway up

# Open in browser
railway open

# Check service status
railway status
```

## Need Help?

Check the full guide: `RAILWAY_ADMIN_DASHBOARD_DEPLOYMENT.md`
