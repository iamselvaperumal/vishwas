DO $$ BEGIN
 CREATE TYPE "public"."transaction_status" AS ENUM('pending_approval', 'approved', 'rejected', 'payment_pending', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" SET DATA TYPE transaction_status;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "status" SET DEFAULT 'pending_approval';--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "buyer_message" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "farmer_note" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "requested_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "completed_at" timestamp;