// Export all tables and types
export * from './users';
export * from './properties';
export * from './leases';
export * from './payments';
export * from './messages';
export * from './tenant-invitations';
export * from './tenant-rent-contracts';
export * from './wallet';

// Import all tables for relations
import { users } from './users';
import { properties, units } from './properties';
import { leases } from './leases';
import { payments, paymentHistory } from './payments';
import { messages, maintenanceRequests } from './messages';
import { tenantInvitations } from './tenant-invitations';
import { tenantRentContracts, landlordEscrowBalances, paymentNotifications } from './tenant-rent-contracts';
import { landlordWalletBalances, walletTransactions } from './wallet';

// Export all tables as a single object for convenience
export const schema = {
  users,
  properties,
  units,
  leases,
  payments,
  paymentHistory,
  messages,
  maintenanceRequests,
  tenantInvitations,
  tenantRentContracts,
  landlordEscrowBalances,
  paymentNotifications,
  landlordWalletBalances,
  walletTransactions,
}; 