# Admin Dashboard Deployment Checklist

## Pre-Deployment

- [ ] All code changes committed and pushed
- [ ] Admin dashboard works locally (`npm run dev`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Backend is already deployed on Railway
- [ ] You have Railway account and CLI access

## Deployment Files

- [x] `admin-dashboard/railway.json` created
- [x] `admin-dashboard/nixpacks.toml` created
- [x] `admin-dashboard/.railwayignore` created
- [x] `admin-dashboard/.env.example` created
- [x] `admin-dashboard/vite.config.ts` updated

## Step 1: Push Code

```bash
./deploy-admin-dashboard.sh
```

Or manually:
```bash
git add admin-dashboard/
git commit -m "Add Railway deployment config"
git push
```

- [ ] Code pushed to GitHub

## Step 2: Create Railway Service

### Via Dashboard
1. [ ] Go to https://railway.app
2. [ ] Open your project
3. [ ] Click "+ New" → "GitHub Repo"
4. [ ] Select your repository
5. [ ] **Set Root Directory to: `admin-dashboard`** ⚠️
6. [ ] Click "Deploy"

### Via CLI
```bash
cd admin-dashboard
railway link
railway up
```

- [ ] Service created in Railway

## Step 3: Configure Environment Variables

In Railway dashboard → Admin Dashboard service → Settings → Variables:

```bash
VITE_API_URL=https://your-backend.railway.app
```

- [ ] VITE_API_URL added
- [ ] URL points to your backend (check it!)

## Step 4: Wait for Build

- [ ] Build started (check logs)
- [ ] Build completed successfully
- [ ] Service is running

## Step 5: Get Your URL

Railway dashboard → Admin Dashboard service → Settings → Domains

- [ ] Railway domain generated (e.g., admin-production-xxxx.railway.app)
- [ ] URL copied

## Step 6: Update Backend CORS

In `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3001',
    'https://your-admin-dashboard.railway.app', // Add this!
  ],
  credentials: true,
});
```

- [ ] Backend CORS updated
- [ ] Backend redeployed

## Step 7: Test Deployment

Visit your admin dashboard URL:

- [ ] Dashboard loads
- [ ] No console errors
- [ ] Can see login page
- [ ] Can login successfully
- [ ] Dashboard data loads
- [ ] All pages work
- [ ] API calls succeed

## Step 8: Custom Domain (Optional)

If you have a custom domain:

1. [ ] Add domain in Railway (Settings → Domains)
2. [ ] Add DNS records (Railway provides instructions)
3. [ ] Wait for SSL certificate (automatic)
4. [ ] Update backend CORS with new domain
5. [ ] Test with custom domain

## Step 9: Configure Auto-Deploy

Railway dashboard → Admin Dashboard service → Settings:

- [ ] Auto-deploy enabled
- [ ] Branch set to `main`
- [ ] Deploy on push enabled

## Step 10: Final Checks

- [ ] Dashboard accessible via Railway URL
- [ ] Login works
- [ ] All features functional
- [ ] No console errors
- [ ] API calls working
- [ ] Performance acceptable

## Troubleshooting

### Build Fails

Check:
- [ ] ROOT_DIRECTORY is set to `admin-dashboard`
- [ ] package.json exists in admin-dashboard/
- [ ] All dependencies in package.json
- [ ] Build command is correct

### Can't Connect to Backend

Check:
- [ ] VITE_API_URL is correct
- [ ] Backend is running
- [ ] Backend CORS allows admin domain
- [ ] No typos in URL

### 404 on Page Refresh

Check:
- [ ] vite.config.ts has preview config
- [ ] Preview server is running
- [ ] Railway is using correct start command

## Post-Deployment

- [ ] Document URLs (backend + admin)
- [ ] Share with team
- [ ] Set up monitoring
- [ ] Configure alerts
- [ ] Plan for scaling

## URLs to Save

```
Backend:         https://_____________________.railway.app
Admin Dashboard: https://_____________________.railway.app
Database:        postgresql://_____________________.neon.tech
```

## Credentials to Save

```
Railway Account: _____________________
GitHub Repo:     _____________________
Admin Login:     _____________________
```

## Next Steps

- [ ] Set up staging environment
- [ ] Configure CI/CD
- [ ] Add health checks
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Plan for production launch

## Resources

- Railway Dashboard: https://railway.app
- Documentation: RAILWAY_ADMIN_DASHBOARD_DEPLOYMENT.md
- Quick Start: ADMIN_DASHBOARD_RAILWAY_QUICK_START.md
- Architecture: RAILWAY_ARCHITECTURE.md

## Support

If you get stuck:
1. Check Railway logs
2. Check browser console
3. Review documentation
4. Ask in Railway Discord
5. Check GitHub issues

## Success Criteria

✅ Admin dashboard is live
✅ Can login and use all features
✅ API calls work correctly
✅ No errors in console
✅ Performance is good
✅ Auto-deploy works

## Estimated Time

- Setup: 10 minutes
- Deployment: 5-10 minutes
- Testing: 10 minutes
- **Total: ~30 minutes**

Good luck! 🚀
