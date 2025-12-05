# Payment Reminder System - How It Works

## 🔍 What You're Seeing

You received an email: **"Welcome, Rent is Due Payment Overdue - 3 Days!"**

This is coming from the **automated payment reminder system** that runs daily via cron jobs.

## 📊 How It Calculates

### System Location
- **Scheduler**: `backend/src/core/notifications/notification.scheduler.ts`
- **Sender**: `backend/src/core/notifications/notification-sender.service.ts`
- **Rules**: `backend/src/shared/constants/business-rules.constant.ts`

### Calculation Logic

The system runs **two daily cron jobs**:

#### 1. Payment Reminders (9:00 AM Daily)
```typescript
@Cron('0 9 * * *')
```

Sends reminders for:
- **3 days before due date**: "Rent Payment Reminder - Due in 3 Days"
- **Due date (1st of month)**: "Rent Payment Due Today"

#### 2. Overdue Check (10:00 AM Daily)
```typescript
@Cron('0 10 * * *')
```

Checks for overdue payments and sends escalating reminders on:
- **1 day overdue**
- **3 days overdue** ← This is what you received
- **7 days overdue**
- **14 days overdue**

### Grace Period
- **Grace Period**: 3 days after due date
- **Example**: Payment due on 1st, grace until 3rd, overdue from 4th

### The Calculation

```typescript
// In notification-sender.service.ts (line 362-365)
if (daysUntilDue < 0) {
  // Overdue
  const daysOverdue = Math.abs(daysUntilDue);
  type = NotificationType.PAYMENT_OVERDUE;
  title = `Rent Payment Overdue - ${daysOverdue} Day${daysOverdue > 1 ? 's' : ''}`;
  message = `Your rent payment of ${amount} was due ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} ago...`;
}
```

## 🎯 Why You Got This Email

The system found a contract in your database where:
1. **Next payment due date** is 3 days in the past
2. **Contract status** is "active"
3. **Payment status** is not "paid"

The scheduler:
1. Queries `tenant_rent_contracts` table
2. Finds contracts with `nextPaymentDue` <= (today - 3 days grace period)
3. Calculates days overdue
4. Sends notification if days overdue matches [1, 3, 7, 14]

## 🔧 How to Fix/Configure

### Option 1: Disable Automated Reminders (Temporary)

Comment out the cron jobs in `backend/src/core/notifications/notification.scheduler.ts`:

```typescript
// @Cron('0 9 * * *')
// async sendPaymentReminders(): Promise<void> {
//   ...
// }

// @Cron('0 10 * * *')
// async checkOverduePayments(): Promise<void> {
//   ...
// }
```

### Option 2: Adjust Reminder Schedule

Edit `backend/src/shared/constants/business-rules.constant.ts`:

```typescript
PAYMENT_REMINDERS: {
  EARLY_REMINDER_DAYS: 7,  // Change from 3 to 7 days
  DUE_TODAY_REMINDER: false,  // Disable due today reminder
  OVERDUE_REMINDER_DAYS: [7, 14, 30],  // Only remind at 7, 14, 30 days
},
```

### Option 3: Increase Grace Period

```typescript
PAYMENT_GRACE_DAYS: 7,  // Change from 3 to 7 days
```

### Option 4: Fix Test Data

Check your database for test contracts with old due dates:

```sql
-- Find contracts with overdue payments
SELECT 
  id,
  tenant_id,
  next_payment_due,
  status,
  CURRENT_DATE - next_payment_due::date as days_overdue
FROM tenant_rent_contracts
WHERE status = 'active'
  AND next_payment_due < CURRENT_DATE - INTERVAL '3 days'
ORDER BY next_payment_due;

-- Update test contracts to have future due dates
UPDATE tenant_rent_contracts
SET next_payment_due = CURRENT_DATE + INTERVAL '25 days'
WHERE status = 'active'
  AND next_payment_due < CURRENT_DATE;
```

### Option 5: Disable Email Channel

Edit `backend/src/shared/constants/business-rules.constant.ts`:

```typescript
NOTIFICATION_CHANNELS: {
  EMAIL: {
    enabled: false,  // Disable email notifications
    priority: 2,
    allNotifications: true,
  },
}
```

## 📧 Email Template

The email is sent via Resend API using this template:

**From**: `backend/src/email/email.service.ts`

```typescript
await this.resend.emails.send({
  from: this.fromEmail,
  to: userEmail,
  subject: title,
  html: `
    <h2>${title}</h2>
    <p>${message}</p>
    ...
  `
});
```

## 🔍 Debug: Check What's Triggering

Run this query to see which contracts are triggering reminders:

```sql
-- Contracts that will trigger reminders today
SELECT 
  trc.id,
  trc.tenant_id,
  u.email,
  u.first_name,
  u.last_name,
  trc.next_payment_due,
  trc.monthly_amount,
  trc.status,
  CURRENT_DATE - trc.next_payment_due::date as days_overdue,
  CASE 
    WHEN CURRENT_DATE - trc.next_payment_due::date = 1 THEN 'Will send: 1 day overdue'
    WHEN CURRENT_DATE - trc.next_payment_due::date = 3 THEN 'Will send: 3 days overdue'
    WHEN CURRENT_DATE - trc.next_payment_due::date = 7 THEN 'Will send: 7 days overdue'
    WHEN CURRENT_DATE - trc.next_payment_due::date = 14 THEN 'Will send: 14 days overdue'
    ELSE 'No reminder today'
  END as reminder_status
FROM tenant_rent_contracts trc
JOIN users u ON u.id = trc.tenant_id
WHERE trc.status = 'active'
  AND trc.next_payment_due < CURRENT_DATE - INTERVAL '3 days'
ORDER BY days_overdue DESC;
```

## 🎯 Recommended Actions

### For Development/Testing:
1. **Disable cron jobs** temporarily
2. **Update test data** to have future due dates
3. **Test manually** using the manual trigger endpoint

### For Production:
1. **Keep cron jobs enabled** (they're valuable for users)
2. **Adjust reminder schedule** if needed
3. **Monitor email logs** to ensure they're helpful, not spammy

## 🧪 Manual Testing

You can manually trigger a reminder for testing:

```typescript
// In notification.scheduler.ts
async sendManualReminder(contractId: string): Promise<void> {
  // Manually send reminder for specific contract
}
```

Call via API or directly in code for testing.

## 📊 Current Configuration

```typescript
PAYMENT_DUE_DAY: 1,              // All payments due on 1st
PAYMENT_GRACE_DAYS: 3,           // 3 days grace period
EARLY_REMINDER_DAYS: 3,          // Remind 3 days before
DUE_TODAY_REMINDER: true,        // Remind on due date
OVERDUE_REMINDER_DAYS: [1, 3, 7, 14],  // Escalating reminders
```

## 🔄 Cron Schedule

- **9:00 AM**: Send early reminders and due today reminders
- **10:00 AM**: Check and send overdue reminders
- **11:00 AM (Sundays)**: Check expiring contracts

## ✅ Quick Fix for Your Issue

If you want to stop receiving these emails immediately:

```bash
# Option 1: Update the test contract
cd backend
psql -h yamanote.proxy.rlwy.net -p 34012 -U postgres -d railway -c "UPDATE tenant_rent_contracts SET next_payment_due = CURRENT_DATE + INTERVAL '25 days' WHERE status = 'active' AND next_payment_due < CURRENT_DATE;"

# Option 2: Temporarily disable email notifications
# Edit backend/src/shared/constants/business-rules.constant.ts
# Set EMAIL.enabled = false
```

## 📝 Summary

The email you received is **working as designed**. The system:
1. ✅ Correctly identified a contract 3 days overdue
2. ✅ Sent an email notification (as configured)
3. ✅ Used the correct calculation logic

The issue is likely **test data** with old due dates in your database. Update the test contracts to have future due dates, and the reminders will stop.
