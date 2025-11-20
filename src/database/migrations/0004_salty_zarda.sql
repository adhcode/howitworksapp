DROP INDEX "landlord_escrow_balances_landlord_id_idx";--> statement-breakpoint
DROP INDEX "landlord_escrow_balances_contract_id_idx";--> statement-breakpoint
DROP INDEX "landlord_escrow_balances_is_released_idx";--> statement-breakpoint
DROP INDEX "landlord_escrow_balances_expected_release_date_idx";--> statement-breakpoint
DROP INDEX "landlord_escrow_balances_landlord_released_idx";--> statement-breakpoint
DROP INDEX "landlord_escrow_balances_release_date_status_idx";--> statement-breakpoint
DROP INDEX "landlord_escrow_balances_pending_releases_idx";--> statement-breakpoint
DROP INDEX "landlord_escrow_balances_lookup_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_contract_id_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_tenant_id_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_status_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_scheduled_for_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_status_scheduled_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_tenant_status_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_contract_status_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_pending_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_type_scheduled_idx";--> statement-breakpoint
DROP INDEX "payment_notifications_processing_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_tenant_id_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_landlord_id_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_status_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_next_payment_due_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_expiry_date_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_landlord_status_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_tenant_status_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_status_payment_due_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_landlord_payout_type_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_property_unit_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_active_payment_due_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_expiring_idx";--> statement-breakpoint
DROP INDEX "tenant_rent_contracts_lookup_idx";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "paystack_authorization_code" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "paystack_card_last4" varchar(4);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "paystack_card_brand" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "paystack_card_bank" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "paystack_recipient_code" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_account_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_account_number" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bank_code" varchar(10);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;