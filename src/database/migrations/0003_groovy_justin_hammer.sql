CREATE INDEX "landlord_escrow_balances_landlord_released_idx" ON "landlord_escrow_balances" USING btree ("landlord_id","is_released");--> statement-breakpoint
CREATE INDEX "landlord_escrow_balances_release_date_status_idx" ON "landlord_escrow_balances" USING btree ("expected_release_date","is_released");--> statement-breakpoint
CREATE INDEX "landlord_escrow_balances_pending_releases_idx" ON "landlord_escrow_balances" USING btree ("is_released","expected_release_date","landlord_id");--> statement-breakpoint
CREATE INDEX "landlord_escrow_balances_lookup_idx" ON "landlord_escrow_balances" USING btree ("landlord_id","contract_id","is_released","total_escrowed");--> statement-breakpoint
CREATE INDEX "payment_notifications_status_scheduled_idx" ON "payment_notifications" USING btree ("status","scheduled_for");--> statement-breakpoint
CREATE INDEX "payment_notifications_tenant_status_idx" ON "payment_notifications" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "payment_notifications_contract_status_idx" ON "payment_notifications" USING btree ("contract_id","status");--> statement-breakpoint
CREATE INDEX "payment_notifications_pending_idx" ON "payment_notifications" USING btree ("status","scheduled_for","tenant_id");--> statement-breakpoint
CREATE INDEX "payment_notifications_type_scheduled_idx" ON "payment_notifications" USING btree ("notification_type","scheduled_for","status");--> statement-breakpoint
CREATE INDEX "payment_notifications_processing_idx" ON "payment_notifications" USING btree ("status","scheduled_for","contract_id","tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_landlord_status_idx" ON "tenant_rent_contracts" USING btree ("landlord_id","status");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_tenant_status_idx" ON "tenant_rent_contracts" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_status_payment_due_idx" ON "tenant_rent_contracts" USING btree ("status","next_payment_due");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_landlord_payout_type_idx" ON "tenant_rent_contracts" USING btree ("landlord_id","landlord_payout_type");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_property_unit_idx" ON "tenant_rent_contracts" USING btree ("property_id","unit_id");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_active_payment_due_idx" ON "tenant_rent_contracts" USING btree ("status","next_payment_due","tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_expiring_idx" ON "tenant_rent_contracts" USING btree ("status","expiry_date","landlord_payout_type");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_lookup_idx" ON "tenant_rent_contracts" USING btree ("id","tenant_id","landlord_id","status");