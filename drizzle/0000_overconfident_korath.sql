CREATE TABLE IF NOT EXISTS "employee" (
	"id" serial PRIMARY KEY NOT NULL,
	"fname" text NOT NULL,
	"lname" text NOT NULL,
	"personal_id" text NOT NULL,
	CONSTRAINT "employee_personal_id_unique" UNIQUE("personal_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employee_entry" (
	"employee_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_entry_employee_id_timestamp_pk" PRIMARY KEY("employee_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employee_exit" (
	"employee_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employee_exit_employee_id_timestamp_pk" PRIMARY KEY("employee_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student" (
	"id" serial PRIMARY KEY NOT NULL,
	"fname" text NOT NULL,
	"lname" text NOT NULL,
	"index" text NOT NULL,
	CONSTRAINT "student_index_unique" UNIQUE("index")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_entry" (
	"student_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_entry_student_id_timestamp_pk" PRIMARY KEY("student_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student_exit" (
	"student_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "student_exit_student_id_timestamp_pk" PRIMARY KEY("student_id","timestamp")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employee_entry" ADD CONSTRAINT "employee_entry_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "employee_exit" ADD CONSTRAINT "employee_exit_employee_id_employee_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employee"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_entry" ADD CONSTRAINT "student_entry_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student_exit" ADD CONSTRAINT "student_exit_student_id_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
