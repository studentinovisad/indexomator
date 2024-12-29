ALTER TABLE "employee" RENAME COLUMN "email" TO "identifier";--> statement-breakpoint
ALTER TABLE "employee" DROP CONSTRAINT "employee_email_unique";--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_identifier_unique" UNIQUE("identifier");