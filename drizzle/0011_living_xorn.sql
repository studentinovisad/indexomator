ALTER TABLE "user" ADD COLUMN "schedStart" text DEFAULT '00:00' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "schedEnd" text DEFAULT '24:00' NOT NULL;