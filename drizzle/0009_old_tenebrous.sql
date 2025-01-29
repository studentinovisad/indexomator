ALTER TABLE "user" RENAME COLUMN "active" TO "disabled";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "disabled" SET DEFAULT false;