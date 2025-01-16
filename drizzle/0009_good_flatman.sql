CREATE TABLE IF NOT EXISTS "university" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "university_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "person" DROP CONSTRAINT "person_identifier_unique";--> statement-breakpoint
ALTER TABLE "person" ALTER COLUMN "department" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "person" ADD COLUMN "university" text;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person" ADD CONSTRAINT "person_university_university_name_fk" FOREIGN KEY ("university") REFERENCES "public"."university"("name") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_identifier_university_id_unique" UNIQUE NULLS NOT DISTINCT("identifier","university");