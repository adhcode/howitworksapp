/**
 * HOMEZY BUSINESS RULES
 * 
 * This file contains all core business logic constants.
 * Centralizing these values makes the system maintainable and easy to update.
 */ "use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "BUSINESS_RULES", {
    enumerable: true,
    get: function() {
        return BUSINESS_RULES;
    }
});
const BUSINESS_RULES = {
    /**
   * TRANSITION PERIODS FOR EXISTING TENANTS
   * 
   * When existing tenants (those with active leases elsewhere) join the platform,
   * they need to start making payments X months before their current lease expires.
   * 
   * - MONTHLY_PAYOUT: Tenant starts paying 3 months before current lease expiry
   * - YEARLY_PAYOUT: Tenant starts paying 6 months before current lease expiry
   * 
   * If the transition period has already passed (e.g., current lease expires in 2 months
   * but should have started 3 months ago), payment starts immediately.
   */ TRANSITION_PERIODS: {
        MONTHLY_PAYOUT: 3,
        YEARLY_PAYOUT: 6
    },
    /**
   * PAYMENT DUE DATES
   * 
   * All payments are due on the 1st of each month.
   */ PAYMENT_DUE_DAY: 1,
    /**
   * PAYMENT GRACE PERIOD
   * 
   * Tenants have 3 days after the due date to make payment before it's marked overdue.
   * Example: Payment due on 1st, grace until 3rd, overdue from 4th.
   */ PAYMENT_GRACE_DAYS: 3,
    /**
   * PAYMENT REMINDER SCHEDULE
   * 
   * When to send payment reminders:
   * - EARLY_REMINDER: 3 days before due date (e.g., on the 28th for payment due on 1st)
   * - DUE_TODAY: On the due date (1st of month)
   * - OVERDUE_REMINDERS: On these days after due date [1, 3, 7, 14 days overdue]
   */ PAYMENT_REMINDERS: {
        EARLY_REMINDER_DAYS: 3,
        DUE_TODAY_REMINDER: true,
        OVERDUE_REMINDER_DAYS: [
            1,
            3,
            7,
            14
        ]
    },
    /**
   * ESCROW RULES FOR YEARLY PAYOUT
   * 
   * When landlord chooses yearly payout:
   * - Tenant payments accumulate in escrow
   * - Auto-release after 12 months of accumulation
   * - OR when contract expires (whichever comes first)
   */ ESCROW: {
        AUTO_RELEASE_MONTHS: 12,
        RELEASE_ON_CONTRACT_EXPIRY: true,
        GRACE_DAYS_AFTER_EXPIRY: 7
    },
    /**
   * NOTIFICATION CHANNELS
   * 
   * Priority order for sending notifications:
   * 1. Push notifications (mobile app)
   * 2. Email (all notifications)
   * 3. SMS (overdue payments only)
   */ NOTIFICATION_CHANNELS: {
        PUSH: {
            enabled: true,
            priority: 1,
            allNotifications: true
        },
        EMAIL: {
            enabled: true,
            priority: 2,
            allNotifications: true
        },
        SMS: {
            enabled: true,
            priority: 3,
            overdueOnly: true
        }
    },
    /**
   * CONTRACT STATUS TRANSITIONS
   * 
   * Valid status transitions:
   * pending → active (when tenant accepts and makes first payment)
   * active → expired (when lease end date is reached)
   * active → terminated (early termination)
   * expired → terminated (cleanup)
   */ CONTRACT_STATUS: {
        PENDING: 'pending',
        ACTIVE: 'active',
        EXPIRED: 'expired',
        TERMINATED: 'terminated'
    },
    /**
   * LANDLORD PAYOUT TYPES
   */ PAYOUT_TYPES: {
        MONTHLY: 'monthly',
        YEARLY: 'yearly'
    }
};

//# sourceMappingURL=business-rules.constant.js.map