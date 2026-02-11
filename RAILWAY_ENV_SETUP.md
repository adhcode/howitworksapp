# Railway Environment Variables Setup

## Required Environment Variable

Add this to your Railway backend service:

```
ADMIN_DASHBOARD_URL=https://app.howitworks.com.ng
```

## How to Add in Railway

1. Go to Railway dashboard
2. Select your backend service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add:
   - Name: `ADMIN_DASHBOARD_URL`
   - Value: `https://app.howitworks.com.ng`
6. Click "Add"
7. Railway will automatically redeploy

## What This Fixes

This environment variable is used to generate the artisan referral links for facilitators. Without it, the links default to `localhost:5173`, which won't work in production.

With this set, facilitators will get proper production URLs like:
```
https://app.howitworks.com.ng/register-artisan?ref={facilitatorId}
```

## Verification

After setting the variable and redeploying:
1. Login as a facilitator
2. Go to "My Artisans" page
3. Check the referral link - it should show the production URL
