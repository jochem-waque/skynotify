CREATE TABLE IF NOT EXISTS "account" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"token" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subscription" (
	"account" text NOT NULL,
	"target" text NOT NULL,
	CONSTRAINT "subscription_account_target_pk" PRIMARY KEY("account","target")
);
