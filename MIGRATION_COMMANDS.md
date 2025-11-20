# 🗄️ DATABASE MIGRATION - QUICK REFERENCE

## **CHOOSE YOUR DATABASE**

### **Option 1: Local Development Database**

```bash
psql postgresql://localhost:5432/homezy -f migrations/add-paystack-fields.sql
```

### **Option 2: Production Database (Direct)**

```bash
# Replace with your actual production database URL
psql "postgresql://user:password@prod-host.com:5432/homezy_prod" \
  -f migrations/add-paystack-fields.sql
```

### **Option 3: Using .env Variable**

```bash
# First, set your production database URL
export DATABASE_URL="postgresql://user:password@prod-host.com:5432/homezy_prod"

# Then run migration
psql $DATABASE_URL -f migrations/add-paystack-fields.sql
```

### **Option 4: Railway/Heroku/Render**

```bash
# Get your production database URL from your hosting dashboard
# Railway: Variables → DATABASE_URL
# Heroku: heroku config:get DATABASE_URL
# Then:
psql "your-production-database-url-here" -f migrations/add-paystack-fields.sql
```

---

## **VERIFY MIGRATION**

```bash
# Check if columns exist
psql $DATABASE_URL -c "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name LIKE 'paystack%';"

# Should output 5 columns:
# paystack_authorization_code
# paystack_card_last4
# paystack_card_brand
# paystack_card_bank
# paystack_recipient_code
```

---

## **ENVIRONMENT VARIABLES TO ADD**

Add these 5 variables to your `.env` file:

```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxx
PAYSTACK_WEBHOOK_SECRET=xxxxxxxxxxxxxx
PAYSTACK_CALLBACK_URL=http://localhost:3000/webhooks/payment/callback
FRONTEND_URL=http://localhost:3001
```

**Get keys from:** https://dashboard.paystack.com/settings/developer

---

## **PRODUCTION CHECKLIST**

- [ ] Run migration on **production database** (not local!)
- [ ] Add **LIVE** Paystack keys (sk_live_xxx, pk_live_xxx)
- [ ] Setup webhook URL: `https://yourdomain.com/webhooks/paystack`
- [ ] Test with small amount first

---

**That's it! Two simple steps:**

1. Run migration SQL on your database
2. Add 5 environment variables

**Questions?** See `PAYSTACK_SETUP_GUIDE.md` for detailed instructions.


