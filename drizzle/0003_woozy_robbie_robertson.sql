CREATE TABLE IF NOT EXISTS "building" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "building_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "department" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "department_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_username_student_index_fk";
--> statement-breakpoint
ALTER TABLE "employee" ADD COLUMN "department_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_entry" ADD COLUMN "building_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_entry" ADD COLUMN "creator" text NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_exit" ADD COLUMN "building_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "employee_exit" ADD COLUMN "creator" text NOT NULL;--> statement-breakpoint
ALTER TABLE "student" ADD COLUMN "department_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "student_entry" ADD COLUMN "building_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "student_entry" ADD COLUMN "creator" text NOT NULL;--> statement-breakpoint
ALTER TABLE "student_exit" ADD COLUMN "building_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "student_exit" ADD COLUMN "creator" text NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employee" ADD CONSTRAINT "employee_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employee_entry" ADD CONSTRAINT "employee_entry_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employee_entry" ADD CONSTRAINT "employee_entry_creator_user_username_fk" FOREIGN KEY ("creator") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employee_exit" ADD CONSTRAINT "employee_exit_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employee_exit" ADD CONSTRAINT "employee_exit_creator_user_username_fk" FOREIGN KEY ("creator") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_entry" ADD CONSTRAINT "student_entry_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_entry" ADD CONSTRAINT "student_entry_creator_user_username_fk" FOREIGN KEY ("creator") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_exit" ADD CONSTRAINT "student_exit_building_id_building_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."building"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_exit" ADD CONSTRAINT "student_exit_creator_user_username_fk" FOREIGN KEY ("creator") REFERENCES "public"."user"("username") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
