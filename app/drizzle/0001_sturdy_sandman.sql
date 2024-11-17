CREATE TABLE IF NOT EXISTS "token" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"unregistered" timestamp
);
--> statement-breakpoint
INSERT INTO "token" ("token") SELECT DISTINCT "token" FROM "subscription";
--> statement-breakpoint
UPDATE "subscription" SET "token" = "token"."id" FROM "token" WHERE "subscription"."token" = "token"."token";
--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "token" SET DATA TYPE integer USING "token"::integer;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subscription" ADD CONSTRAINT "subscription_token_token_id_fk" FOREIGN KEY ("token") REFERENCES "public"."token"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
