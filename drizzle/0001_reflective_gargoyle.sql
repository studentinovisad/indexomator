ALTER TABLE "employee" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "employee" ADD CONSTRAINT "employee_email_unique" UNIQUE("email");