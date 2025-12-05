# Landlord Debug Steps

## Test the APIs directly

### 1. Test Tenant Endpoint
```bash
# Replace YOUR_JWT with actual JWT token
curl -H "Authorization: Bearer YOUR_JWT" \
  http://192.168.1.7:3003/tenant-invitations/my-tenants
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "propertyId": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "monthlyRent": "50000",
      "property": { "name": "Property Name" },
      "unit": { "unitNumber": "A1" }
    }
  ]
}
```

### 2. Test Payment Stats Endpoint
```bash
curl -H "Authorization: Bearer YOUR_JWT" \
  http://192.168.1.7:3003/payments/landlord/stats
```

Expected response:
```json
{
  "success": true,
  "data": {
    "walletBalance": 0,
    "totalRentCollected": 0,
    "upcomingPayments": 0,
    "pendingPayments": 0,
    "recentTransactions": []
  }
}
```

## Debug Steps

1. **Check Backend Logs**: Look for any errors when calling these endpoints
2. **Check Mobile Logs**: Added console.log statements to see what data is received
3. **Verify Data**: Make sure there are actual tenants and payments in the database

## Quick Database Check

```sql
-- Check if there are any accepted tenant invitations
SELECT * FROM tenant_invitations WHERE status = 'accepted';

-- Check if there are any payments
SELECT * FROM payments WHERE landlord_id = 'YOUR_LANDLORD_ID';

-- Check if there are any wallet balances
SELECT * FROM landlord_wallet_balances WHERE landlord_id = 'YOUR_LANDLORD_ID';
```