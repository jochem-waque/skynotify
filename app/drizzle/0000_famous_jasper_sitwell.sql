CREATE TABLE IF NOT EXISTS "subscription" (
	"token" text NOT NULL,
	"target" text NOT NULL,
	"posts" boolean NOT NULL,
	"reposts" boolean NOT NULL,
	"replies" boolean NOT NULL,
	CONSTRAINT "subscription_token_target_pk" PRIMARY KEY("token","target")
);
