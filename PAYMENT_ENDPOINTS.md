# Payment System - Available Endpoints

## ✅ Backend Payment Endpoints (Paystack Integration)

### Landlord Wallet & Withdrawals

1. **GET `/payments/wallet/balance`**
   - Get landlord's wallet balance
   - Roles: LANDLORD, ADMIN

2. **GET `/payments/wallet/transactions`**
   - Get wallet transaction history
   - Roles: LANDLORD, ADMIN

3. **POST `/payments/wallet/withdraw`**
   - Request withdrawal to bank account
   - Body: `{ amount: number, reason?: string }`
   - Roles: LANDLORD

### Bank Account Management

4. **GET `/payments/banks`**
   - Get list of Nigerian banks
   - Roles: LANDLORD, TENANT, ADMIN

5. **POST `/payments/landlord/setup-bank`**
   - Setup bank account for payouts
   - Body: `{ bankCode: string, accountNumber: string }`
   - Roles: LANDLORD, ADMIN

### Landlord Balance & Payouts

6. **GET `/payments/landlord/balance`**
   - Get available balance for payout
   - Roles: LANDLORD, ADMIN

7. **GET `/payments/landlord/escrow`**
   - Get escrow balance (yearly payouts)
   - Roles: LANDLORD, ADMIN

8. **POST `/payments/landlord/request-payout`**
   - Request payout to bank account
   - Body: `{ amount: number, reason?: string }`
   - Roles: LANDLORD

### Payment History

9. **GET `/payments/history`**
   - Get payment history
   - Roles: TENANT, LANDLORD, ADMIN

10. **GET `/payments/upcoming`**
    - Get upcoming payments
    - Roles: TENANT, LANDLORD, ADMIN

### Tenant Payments

11. **POST `/payments/initialize`**
    - Initialize payment
    - Roles: TENANT, ADMIN

12. **GET `/payments/verify/:reference`**
    - Verify payment status
    - Roles: TENANT, ADMIN

## 🔧 What Needs to be Done

### Frontend (Mobile App)

The mobile app needs to implement:

1. **Wallet Screen** - Show balance and transactions
2. **Bank Setup Screen** - Add/manage bank accounts
3. **Withdrawal Screen** - Request withdrawals
4. **Payment History** - View all transactions

### Current Issue

The error `/payments/landlord-payments` suggests the mobile app is calling an old endpoint that doesn't exist. Need to update the API service to use the correct endpoints above.

## 📝 Next Steps

1. Update `mobile/app/services/api.ts` with correct payment endpoints
2. Create wallet/payment screens in mobile app
3. Implement bank account setup flow
4. Add withdrawal request functionality
