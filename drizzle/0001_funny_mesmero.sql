ALTER TABLE "subscription" ADD COLUMN "posts" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "reposts" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "replies" boolean NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_account_account_id_fk" FOREIGN KEY ("account") REFERENCES "public"."account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
