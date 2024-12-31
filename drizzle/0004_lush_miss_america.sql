ALTER TABLE "student" RENAME COLUMN "index" TO "identifier";--> statement-breakpoint
ALTER TABLE "student" DROP CONSTRAINT "student_index_unique";--> statement-breakpoint
ALTER TABLE "student" ADD CONSTRAINT "student_identifier_unique" UNIQUE("identifier");