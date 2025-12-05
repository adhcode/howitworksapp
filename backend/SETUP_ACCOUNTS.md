# Account Setup Guide

This guide explains how to create admin and facilitator accounts for the Howitworks platform.

## Prerequisites

- Backend server must be configured with a valid `DATABASE_URL` in `.env`
- Database must be migrated and running

## Setup Methods

### Method 1: Quick Setup (Recommended for Development)

Creates default admin and facilitator accounts with preset credentials:

```bash
cd backend
npm run setup:quick
```

**Default Accounts Created:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@howitworks.app | Admin@123 |
| Facilitator | facilitator@howitworks.app | Facilitator@123 |

⚠️ **Important:** Change these passwords immediately in production!

### Method 2: Interactive Setup (Recommended for Production)

Create custom accounts with your own credentials:

```bash
cd backend
npm run setup:accounts
```

This will launch an interactive wizard where you can:
1. Create an admin account
2. Create a facilitator account
3. Create both accounts
4. Exit

You'll be prompted to enter:
- First Name
- Last Name
- Email
- Phone Number
- Password (minimum 6 characters)

### Method 3: Create Admin Only

If you only need to create an admin account:

```bash
cd backend
npm run create:admin
```

This creates a default admin account at `admin@howitworks.app`.

## After Setup

### Login to Admin Dashboard

1. Start the admin dashboard:
   ```bash
   cd admin-dashboard
   npm run dev
   ```

2. Open browser to: `http://localhost:3001`

3. Login with your credentials

### Login via API

You can also login programmatically:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@howitworks.app",
    "password": "Admin@123"
  }'
```

## Account Roles

### Admin
- Full access to admin dashboard
- Can manage all users, properties, and facilitators
- Can view analytics and reports
- Can assign facilitators to properties

### Facilitator
- Can manage assigned properties
- Can view tenants and maintenance requests
- Can communicate with landlords and tenants
- Limited access compared to admin

## Troubleshooting

### "User already exists" Error

If you see this error, the account already exists in the database. You can:
1. Use a different email address
2. Login with existing credentials
3. Reset the password via the forgot password flow

### Database Connection Error

Ensure your `.env` file has the correct `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/howitworks
```

### Permission Denied

Make sure the scripts have execute permissions:

```bash
chmod +x backend/setup-accounts.ts
chmod +x backend/quick-setup.ts
```

## Security Best Practices

1. **Change Default Passwords:** Always change default passwords in production
2. **Use Strong Passwords:** Minimum 8 characters with uppercase, lowercase, numbers, and symbols
3. **Secure Storage:** Store credentials in a password manager
4. **Regular Updates:** Rotate passwords periodically
5. **Monitor Access:** Review admin and facilitator access logs regularly

## Next Steps

After creating accounts:

1. **Admin:** Login to dashboard and configure system settings
2. **Facilitator:** Admin should assign properties to facilitators
3. **Test:** Verify login works for both account types
4. **Secure:** Change default passwords if using quick setup

## Support

For issues or questions, contact the development team or check the main README.md file.
