CREATE TYPE "public"."contract_status" AS ENUM('active', 'expired', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."landlord_payout_type" AS ENUM('monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('reminder', 'overdue', 'success');--> statement-breakpoint
ALTER TYPE "public"."user_role" ADD VALUE 'facilitator';--> statement-breakpoint
CREATE TABLE "landlord_escrow_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"landlord_id" uuid NOT NULL,
	"contract_id" uuid NOT NULL,
	"total_escrowed" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"months_accumulated" integer DEFAULT 0 NOT NULL,
	"expected_release_date" timestamp NOT NULL,
	"is_released" boolean DEFAULT false NOT NULL,
	"released_at" timestamp,
	"released_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"contract_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"notification_type" "notification_type" NOT NULL,
	"scheduled_for" timestamp NOT NULL,
	"sent_at" timestamp,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" "notification_status" DEFAULT 'pending' NOT NULL,
	"expo_receipt_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_rent_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"landlord_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"unit_id" uuid NOT NULL,
	"monthly_amount" numeric(10, 2) NOT NULL,
	"expiry_date" timestamp NOT NULL,
	"landlord_payout_type" "landlord_payout_type" NOT NULL,
	"next_payment_due" timestamp NOT NULL,
	"transition_start_date" timestamp NOT NULL,
	"status" "contract_status" DEFAULT 'active' NOT NULL,
	"is_existing_tenant" boolean DEFAULT false NOT NULL,
	"original_expiry_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "facilitator_id" uuid;--> statement-breakpoint
ALTER TABLE "landlord_escrow_balances" ADD CONSTRAINT "landlord_escrow_balances_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landlord_escrow_balances" ADD CONSTRAINT "landlord_escrow_balances_contract_id_tenant_rent_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."tenant_rent_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_notifications" ADD CONSTRAINT "payment_notifications_contract_id_tenant_rent_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."tenant_rent_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_notifications" ADD CONSTRAINT "payment_notifications_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_rent_contracts" ADD CONSTRAINT "tenant_rent_contracts_tenant_id_users_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_rent_contracts" ADD CONSTRAINT "tenant_rent_contracts_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_rent_contracts" ADD CONSTRAINT "tenant_rent_contracts_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_rent_contracts" ADD CONSTRAINT "tenant_rent_contracts_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_facilitator_id_users_id_fk" FOREIGN KEY ("facilitator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;