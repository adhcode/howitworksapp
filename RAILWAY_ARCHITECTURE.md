# Railway Architecture

## Current Setup

```
┌─────────────────────────────────────────────────────────────┐
│                     Railway Project                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Service 1: Backend (NestJS)                       │    │
│  │  ├─ Port: 3000                                     │    │
│  │  ├─ URL: https://backend.railway.app              │    │
│  │  ├─ Database: Neon PostgreSQL (external)          │    │
│  │  └─ APIs: /auth, /landlord, /tenant, etc.        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## After Adding Admin Dashboard

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Railway Project                                │
│                                                                       │
│  ┌────────────────────────────────────────────────────────┐         │
│  │  Service 1: Backend (NestJS)                           │         │
│  │  ├─ Port: 3000                                         │         │
│  │  ├─ URL: https://backend.railway.app                  │         │
│  │  ├─ Database: Neon PostgreSQL (external)              │         │
│  │  └─ APIs: /auth, /landlord, /tenant, etc.            │         │
│  └────────────────────────────────────────────────────────┘         │
│                            ▲                                          │
│                            │ API Calls                                │
│                            │                                          │
│  ┌────────────────────────────────────────────────────────┐         │
│  │  Service 2: Admin Dashboard (React + Vite)            │         │
│  │  ├─ Port: Dynamic (Railway assigns)                   │         │
│  │  ├─ URL: https://admin.railway.app                    │         │
│  │  ├─ Build: npm run build                              │         │
│  │  ├─ Serve: vite preview                               │         │
│  │  └─ Env: VITE_API_URL → Backend URL                  │         │
│  └────────────────────────────────────────────────────────┘         │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────┐
│   Admin     │         │   Admin          │         │   Backend    │
│   User      │────────▶│   Dashboard      │────────▶│   API        │
│  (Browser)  │  HTTPS  │  (Railway)       │  HTTPS  │  (Railway)   │
└─────────────┘         └──────────────────┘         └──────────────┘
                                                             │
                                                             │
                                                             ▼
                                                      ┌──────────────┐
                                                      │   Neon DB    │
                                                      │ (PostgreSQL) │
                                                      └──────────────┘
```

## Mobile App Flow (Unchanged)

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Mobile    │         │   Backend    │         │   Neon DB    │
│   App       │────────▶│   API        │────────▶│ (PostgreSQL) │
│  (Android)  │  HTTPS  │  (Railway)   │         └──────────────┘
└─────────────┘         └──────────────┘
```

## Deployment Strategy

### Option 1: Separate Services (Recommended) ✅

**Pros:**
- Independent scaling
- Separate domains
- Better resource management
- Easier debugging
- Can deploy independently

**Cons:**
- Uses more Railway resources
- Slightly more complex setup

### Option 2: Monorepo (Single Service)

**Pros:**
- Single service = less resources
- Simpler deployment
- One domain

**Cons:**
- Backend and frontend coupled
- Must redeploy both together
- Harder to scale independently

## Resource Usage

### Separate Services
```
Backend:         ~512MB RAM, 1 vCPU
Admin Dashboard: ~256MB RAM, 0.5 vCPU
Total:           ~768MB RAM, 1.5 vCPU
Cost:            ~$10-15/month
```

### Single Service (Monorepo)
```
Backend + Admin: ~512MB RAM, 1 vCPU
Total:           ~512MB RAM, 1 vCPU
Cost:            ~$5-8/month
```

## Domain Setup

### Development
```
Backend:  https://backend-production-xxxx.railway.app
Admin:    https://admin-production-yyyy.railway.app
```

### Production (Custom Domains)
```
Backend:  https://api.yourdomain.com
Admin:    https://admin.yourdomain.com
```

## Environment Variables

### Backend Service
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
PAYSTACK_SECRET_KEY=sk_...
FRONTEND_URL=https://admin.railway.app
```

### Admin Dashboard Service
```bash
VITE_API_URL=https://backend.railway.app
VITE_APP_NAME=Homezy Admin
```

## Security

### CORS Configuration
Backend must allow admin dashboard domain:

```typescript
// backend/src/main.ts
app.enableCors({
  origin: [
    'http://localhost:3001',           // Local dev
    'https://admin.railway.app',       // Railway
    'https://admin.yourdomain.com',    // Custom domain
  ],
  credentials: true,
});
```

### Authentication Flow
```
1. Admin logs in via dashboard
2. Dashboard sends credentials to backend
3. Backend validates and returns JWT
4. Dashboard stores JWT in localStorage
5. All API calls include JWT in Authorization header
6. Backend validates JWT on each request
```

## Monitoring

### Railway Dashboard
- View logs for each service
- Monitor resource usage
- Check deployment status
- View metrics

### Health Checks
Add to both services:

**Backend:**
```typescript
@Get('health')
health() {
  return { status: 'ok', timestamp: new Date() };
}
```

**Admin Dashboard:**
Check if it can reach backend API

## Scaling

### Horizontal Scaling
Railway can run multiple instances:
- Backend: Scale based on API load
- Admin: Usually 1 instance is enough

### Vertical Scaling
Increase resources per instance:
- More RAM for heavy operations
- More CPU for faster builds

## Backup Strategy

### Database
- Neon handles automatic backups
- Can export manually if needed

### Code
- Git repository is source of truth
- Railway deploys from Git

### Environment Variables
- Export from Railway dashboard
- Store securely (1Password, etc.)

## Disaster Recovery

If something breaks:

1. **Check Railway logs**
2. **Rollback deployment** (Railway keeps history)
3. **Redeploy from Git** (specific commit)
4. **Restore database** (from Neon backup)

## Cost Optimization

### Free Tier ($5/month credit)
- 1 backend service
- 1 admin dashboard service
- Should be enough for development

### Pro Tier ($20/month)
- Unlimited services
- More resources
- Better for production

### Tips to Save Money
- Use monorepo approach (single service)
- Optimize build sizes
- Use caching
- Scale down when not in use

## Summary

**Recommended Setup:**
- ✅ Separate services for backend and admin
- ✅ Custom domains for production
- ✅ Auto-deploy from main branch
- ✅ Environment variables in Railway
- ✅ CORS properly configured
- ✅ Monitoring and logging enabled
