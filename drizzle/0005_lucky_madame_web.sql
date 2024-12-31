CREATE TABLE IF NOT EXISTS "person" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"type" text NOT NULL,
	"fname" text NOT NULL,
	"lname" text NOT NULL,
	"department" text NOT NULL,
	CONSTRAINT "person_identifier_unique" UNIQUE("identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "person_entry" (
	"person_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"building" text NOT NULL,
	"creator" text NOT NULL,
	CONSTRAINT "person_entry_person_id_timestamp_pk" PRIMARY KEY("person_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "person_exit" (
	"person_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"building" text NOT NULL,
	"creator" text NOT NULL,
	CONSTRAINT "person_exit_person_id_timestamp_pk" PRIMARY KEY("person_id","timestamp")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person" ADD CONSTRAINT "person_department_department_name_fk" FOREIGN KEY ("department") REFERENCES "public"."department"("name") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_entry" ADD CONSTRAINT "person_entry_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_entry" ADD CONSTRAINT "person_entry_building_building_name_fk" FOREIGN KEY ("building") REFERENCES "public"."building"("name") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_entry" ADD CONSTRAINT "person_entry_creator_user_username_fk" FOREIGN KEY ("creator") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_exit" ADD CONSTRAINT "person_exit_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_exit" ADD CONSTRAINT "person_exit_building_building_name_fk" FOREIGN KEY ("building") REFERENCES "public"."building"("name") ON DELETE restrict ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person_exit" ADD CONSTRAINT "person_exit_creator_user_username_fk" FOREIGN KEY ("creator") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
-- CUSTOM: Insert employees into the person table
INSERT INTO "person" ("identifier", "type", "fname", "lname", "department")
SELECT "identifier", 'Employee' as "type", "fname", "lname", "department"
FROM "employee"
--> statement-breakpoint
-- CUSTOM: Insert employee entries into person_entry table
WITH employee_entries AS (
  SELECT p."id" AS "person_id", ee."timestamp", ee."building", ee."creator"
  FROM "employee_entry" ee
  JOIN "employee" e ON e."id" = ee."employee_id"
  JOIN "person" p ON p."identifier" = e."identifier"
)
INSERT INTO "person_entry" ("person_id", "timestamp", "building", "creator")
SELECT "person_id", "timestamp", "building", "creator"
FROM employee_entries;
--> statement-breakpoint
-- CUSTOM: Insert employee exits into person_exit table
WITH employee_exits AS (
  SELECT p."id" AS "person_id", ee."timestamp", ee."building", ee."creator"
  FROM "employee_exit" ee
  JOIN "employee" e ON e."id" = ee."employee_id"
  JOIN "person" p ON p."identifier" = e."identifier"
)
INSERT INTO "person_exit" ("person_id", "timestamp", "building", "creator")
SELECT "person_id", "timestamp", "building", "creator"
FROM employee_exits;
--> statement-breakpoint
-- CUSTOM: Insert students into the person table
INSERT INTO "person" ("identifier", "type", "fname", "lname", "department")
SELECT "identifier", 'Student' as "type", "fname", "lname", "department"
FROM "student"
--> statement-breakpoint
-- CUSTOM: Insert student entries into person_entry table
WITH student_entries AS (
  SELECT p."id" AS "person_id", se."timestamp", se."building", se."creator"
  FROM "student_entry" se
  JOIN "student" s ON s."id" = se."student_id"
  JOIN "person" p ON p."identifier" = s."identifier"
)
INSERT INTO "person_entry" ("person_id", "timestamp", "building", "creator")
SELECT "person_id", "timestamp", "building", "creator"
FROM student_entries;
--> statement-breakpoint
-- CUSTOM: Insert student exits into person_exit table
WITH student_exits AS (
  SELECT p."id" AS "person_id", se."timestamp", se."building", se."creator"
  FROM "student_exit" se
  JOIN "student" s ON s."id" = se."student_id"
  JOIN "person" p ON p."identifier" = s."identifier"
)
INSERT INTO "person_exit" ("person_id", "timestamp", "building", "creator")
SELECT "person_id", "timestamp", "building", "creator"
FROM student_exits;
