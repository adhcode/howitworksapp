CREATE INDEX "landlord_escrow_balances_landlord_id_idx" ON "landlord_escrow_balances" USING btree ("landlord_id");--> statement-breakpoint
CREATE INDEX "landlord_escrow_balances_contract_id_idx" ON "landlord_escrow_balances" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "landlord_escrow_balances_is_released_idx" ON "landlord_escrow_balances" USING btree ("is_released");--> statement-breakpoint
CREATE INDEX "landlord_escrow_balances_expected_release_date_idx" ON "landlord_escrow_balances" USING btree ("expected_release_date");--> statement-breakpoint
CREATE INDEX "payment_notifications_contract_id_idx" ON "payment_notifications" USING btree ("contract_id");--> statement-breakpoint
CREATE INDEX "payment_notifications_tenant_id_idx" ON "payment_notifications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "payment_notifications_status_idx" ON "payment_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payment_notifications_scheduled_for_idx" ON "payment_notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_tenant_id_idx" ON "tenant_rent_contracts" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_landlord_id_idx" ON "tenant_rent_contracts" USING btree ("landlord_id");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_status_idx" ON "tenant_rent_contracts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_next_payment_due_idx" ON "tenant_rent_contracts" USING btree ("next_payment_due");--> statement-breakpoint
CREATE INDEX "tenant_rent_contracts_expiry_date_idx" ON "tenant_rent_contracts" USING btree ("expiry_date");