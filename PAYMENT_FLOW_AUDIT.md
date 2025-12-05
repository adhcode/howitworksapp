# Payment Flow Audit - Critical Review

## Current Flow Analysis

### 1. Payment Initialization
**Mobile App → Backend Controller → Paystack Service**

```
Mobile sends: 244530 (Naira)
↓
Controller receives: 244530 (Naira)
↓
Paystack Service: 244530 * 100 = 24,453,000 (kobo)
↓
Paystack API receives: 24,453,000 kobo = ₦244,530 ✅
```

**Database Record Created:**
- `amount`: "244530" (Naira) ✅
- `amountPaid`: "0" ✅
- `status`: "pending" ✅

### 2. Payment Verification
**Paystack → Backend → Database Update**

```
Paystack returns: 24,453,000 kobo (but API might return already divided)
↓
Backend receives: Could be 244530 kobo OR 24,453,000 kobo (ISSUE!)
↓
We divide by 100: Gets wrong amount
↓
Database stores wrong amountPaid
```

**PROBLEM IDENTIFIED:**
The issue is we don't know if Paystack's API returns:
- Option A: 24,453,000 kobo (needs /100)
- Option B: 244530 kobo (already divided, wrong!)

**SOLUTION:**
Use the original `payment.amount` from our database instead of Paystack's returned amount.

### 3. Balance Calculation
```
totalExpected = monthsDue * monthlyRent
totalPaid = SUM(amountPaid from paid payments)
totalDue = totalExpected - totalPaid
```

**This is correct IF amountPaid is correct** ✅

### 4. Landlord Wallet Credit
```
Amount credited = amountPaid from payment record
```

**This is correct IF amountPaid is correct** ✅

## Critical Issues Found

### Issue 1: Paystack Amount Inconsistency ❌
**Problem:** Paystack's verification API returns inconsistent amounts
**Impact:** Wrong amount stored in `amountPaid`
**Fix:** Use `payment.amount` instead of `paystackData.amount`

### Issue 2: No Amount Validation ❌
**Problem:** No check that Paystack charged the correct amount
**Impact:** Could charge wrong amount without detection
**Fix:** Add validation to compare amounts

### Issue 3: No Idempotency ❌
**Problem:** Same payment could be processed twice
**Impact:** Double charging
**Fix:** Check payment status before updating

## Recommended Fixes

### Fix 1: Validate Paystack Amount
```typescript
// In updatePaymentStatus
const expectedAmountInKobo = parseFloat(payment.amount) * 100;
const paystackAmountInKobo = paystackData.amount;

// Allow 1% tolerance for rounding
const tolerance = expectedAmountInKobo * 0.01;
const difference = Math.abs(expectedAmountInKobo - paystackAmountInKobo);

if (difference > tolerance) {
  this.logger.error(`Amount mismatch! Expected: ${expectedAmountInKobo}, Got: ${paystackAmountInKobo}`);
  throw new Error('Payment amount mismatch');
}
```

### Fix 2: Add Idempotency Check
```typescript
// In updatePaymentStatus
if (payment.status === 'paid') {
  this.logger.warn(`Payment already processed: ${paystackReference}`);
  return payment; // Don't process again
}
```

### Fix 3: Use Original Amount
```typescript
// Already implemented ✅
amountPaid = payment.amount;
```

## Testing Checklist

- [ ] Test with ₦100 payment
- [ ] Test with ₦1,000 payment  
- [ ] Test with ₦10,000 payment
- [ ] Test with ₦100,000 payment
- [ ] Test with ₦1,000,000 payment
- [ ] Verify totalDue decreases correctly
- [ ] Verify landlord wallet increases correctly
- [ ] Verify payment history shows correct amount
- [ ] Test duplicate verification (should not double-credit)
- [ ] Test failed payment (should not credit)

## Current Status

✅ Payment initialization: CORRECT
✅ Database storage: CORRECT
✅ Amount calculation: FIXED (using payment.amount)
⚠️ Amount validation: MISSING (should add)
⚠️ Idempotency: MISSING (should add)
✅ Wallet credit: CORRECT (uses amountPaid)
✅ Balance calculation: CORRECT

## Recommendation

The current fix (using `payment.amount`) is CORRECT and will work, but we should add:
1. Amount validation for security
2. Idempotency check to prevent double-processing
