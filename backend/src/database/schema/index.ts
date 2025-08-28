// Export all tables and types
export * from './users';
export * from './properties';
export * from './leases';
export * from './payments';
export * from './messages';
export * from './tenant-invitations';

// Import all tables for relations
import { users } from './users';
import { properties, units } from './properties';
import { leases } from './leases';
import { payments, paymentHistory } from './payments';
import { messages, maintenanceRequests } from './messages';
import { tenantInvitations } from './tenant-invitations';

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
}; 