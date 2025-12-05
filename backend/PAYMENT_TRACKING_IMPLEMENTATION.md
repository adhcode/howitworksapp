# Payment Tracking Implementation

## Overview
Implement proper payment tracking to prevent duplicate payments and show payment history.

## Database Changes Needed

Add to `payments` table:
```sql
ALTER TABLE payments 
ADD COLUMN paystack_reference VARCHAR(255) UNIQUE,
ADD COLUMN paystack_status VARCHAR(50),
ADD COLUMN payment_gateway VARCHAR(50) DEFAULT 'paystack';
```

## Flow

### 1. Initialize Payment
- User clicks "Pay Now"
- Backend creates payment record with status='pending'
- Backend initializes Paystack transaction
- Store Paystack reference in payment record
- Return authorization URL to user

### 2. User Completes Payment
- User pays in WebView
- User clicks "I've Completed Payment"
- App verifies with Paystack
- Backend updates payment record to status='paid'
- Show success message

### 3. Prevent Duplicates
- Before allowing payment, check for pending payments
- If pending payment exists, show "Payment Pending" message
- Allow retry only if payment failed or expired

### 4. Payment History
- Show all payments (pending, paid, failed)
- Allow users to retry failed payments
- Show payment status and date

## Implementation Steps

1. Add migration for new columns
2. Update payment initialization to create DB record
3. Update verification to update DB record
4. Add endpoint to check for pending payments
5. Update mobile app to check before payment
6. Update payment history to show all statuses
