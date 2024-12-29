ALTER TABLE "session" ADD COLUMN "timestamp" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "expires_at";