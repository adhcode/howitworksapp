# Deploy Admin Dashboard to Railway

## Overview

You'll deploy the admin dashboard as a **separate service** in the same Railway project as your backend. This gives you:

✅ Independent scaling
✅ Separate domains
✅ Better resource management
✅ Easier debugging

## Architecture

```
Railway Project: Howitworks
├── Service 1: Backend (NestJS) - api.yourdomain.com
├── Service 2: Admin Dashboard (React/Vite) - admin.yourdomain.com
└── Database: Neon PostgreSQL (external)
```

## Step-by-Step Deployment

### 1. Prepare the Code

The following files have been created for you:

- ✅ `admin-dashboard/railway.json` - Railway configuration
- ✅ `admin-dashboard/nixpacks.toml` - Build configuration
- ✅ `admin-dashboard/vite.config.ts` - Updated with preview server config

### 2. Push Changes to Git

```bash
git add admin-dashboard/railway.json admin-dashboard/nixpacks.toml admin-dashboard/vite.config.ts
git commit -m "Add Railway deployment config for admin dashboard"
git push
```

### 3. Create New Service in Railway

#### Option A: Via Railway Dashboard (Recommended)

1. Go to https://railway.app
2. Open your existing project (where backend is deployed)
3. Click **"+ New"** → **"GitHub Repo"**
4. Select your repository
5. Railway will detect it's a monorepo and ask which service to deploy
6. **Important**: Set the **Root Directory** to `admin-dashboard`
7. Click **"Deploy"**

#### Option B: Via Railway CLI

```bash
# Install Railway CLI if you haven't
npm install -g @railway/cli

# Login
railway login

# Link to your existing project
railway link

# Create new service
railway service create admin-dashboard

# Set root directory
railway variables set ROOT_DIRECTORY=admin-dashboard

# Deploy
railway up
```

### 4. Configure Environment Variables

In the Railway dashboard for the admin-dashboard service, add:

```bash
# Required
VITE_API_URL=https://your-backend.railway.app

# Optional (if you have them)
VITE_APP_NAME=Homezy Admin
```

**Important**: The `VITE_` prefix is required for Vite to expose these variables to the browser.

### 5. Configure Custom Domain (Optional)

1. In Railway dashboard, go to your admin-dashboard service
2. Click **"Settings"** → **"Domains"**
3. Click **"Generate Domain"** (gets you a railway.app subdomain)
4. Or add your custom domain (e.g., admin.yourdomain.com)

### 6. Update Admin Dashboard API URL

Make sure your `admin-dashboard/.env` or Railway environment variables point to your backend:

```bash
VITE_API_URL=https://your-backend-url.railway.app
```

## Verification

After deployment:

1. **Check Build Logs**
   - Go to Railway dashboard → admin-dashboard service → Deployments
   - Click on the latest deployment
   - Check logs for any errors

2. **Test the Dashboard**
   - Visit your Railway-provided URL
   - Try logging in
   - Check browser console for API connection errors

3. **Check API Connection**
   - Open browser DevTools → Network tab
   - Try logging in
   - Verify API calls are going to the correct backend URL

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
# Make sure package.json is in admin-dashboard/
# Check that ROOT_DIRECTORY is set correctly
```

**Error: "Out of memory"**
```bash
# In Railway dashboard, increase memory limit
# Or optimize build by removing unused dependencies
```

### Preview Server Won't Start

**Error: "Port already in use"**
```bash
# Railway automatically sets PORT environment variable
# Our vite.config.ts already handles this
```

**Error: "EADDRINUSE"**
```bash
# Make sure preview command uses --host 0.0.0.0
# Check nixpacks.toml start command
```

### Can't Connect to Backend

**CORS Errors**
```bash
# Update backend CORS settings to allow your admin dashboard domain
# In backend/src/main.ts, add your Railway domain to CORS origins
```

**API URL Wrong**
```bash
# Check VITE_API_URL in Railway environment variables
# Make sure it includes https:// and no trailing slash
```

### 404 on Refresh

Vite preview server should handle this, but if you get 404s on page refresh:

Add a `_redirects` file in `admin-dashboard/public/`:
```
/*    /index.html   200
```

## Alternative: Serve from Backend (Monorepo Approach)

If you prefer to serve the admin dashboard from your backend:

### 1. Build the Dashboard

```bash
cd admin-dashboard
npm run build
```

### 2. Copy Build to Backend

```bash
cp -r dist ../backend/public/admin
```

### 3. Update Backend to Serve Static Files

In `backend/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve admin dashboard
  app.useStaticAssets(join(__dirname, '..', 'public', 'admin'), {
    prefix: '/admin',
  });
  
  // ... rest of your config
}
```

Then access at: `https://your-backend.railway.app/admin`

## Cost Considerations

Railway pricing:
- **Free tier**: $5 credit/month (enough for small apps)
- **Pro plan**: $20/month (includes $20 credit)

Each service uses resources:
- Backend: ~512MB RAM, 1 vCPU
- Admin Dashboard: ~256MB RAM, 0.5 vCPU

**Tip**: The separate service approach is better for production, but if you're on free tier, consider the monorepo approach to save resources.

## Recommended Setup

For production:

```
Railway Project
├── Backend Service
│   ├── Domain: api.yourdomain.com
│   ├── Resources: 1GB RAM, 1 vCPU
│   └── Auto-deploy: main branch
│
├── Admin Dashboard Service
│   ├── Domain: admin.yourdomain.com
│   ├── Resources: 512MB RAM, 0.5 vCPU
│   └── Auto-deploy: main branch
│
└── Environment Variables
    ├── Backend: DATABASE_URL, JWT_SECRET, etc.
    └── Admin: VITE_API_URL
```

## Quick Commands

```bash
# Deploy admin dashboard
cd admin-dashboard
railway up

# View logs
railway logs

# Open in browser
railway open

# Check status
railway status
```

## Next Steps

After successful deployment:

1. ✅ Set up custom domain
2. ✅ Configure SSL (automatic with Railway)
3. ✅ Set up monitoring
4. ✅ Configure auto-deploy from GitHub
5. ✅ Add health checks

## Summary

```bash
# 1. Push code
git add admin-dashboard/
git commit -m "Add Railway deployment config"
git push

# 2. Create service in Railway dashboard
# - New service from GitHub repo
# - Set root directory: admin-dashboard
# - Add VITE_API_URL environment variable

# 3. Deploy!
# Railway auto-deploys on push to main branch
```

Your admin dashboard will be live at: `https://[service-name].railway.app`
