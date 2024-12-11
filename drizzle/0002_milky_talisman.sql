DO $$ BEGIN
 ALTER TABLE "user" ADD CONSTRAINT "user_username_student_index_fk" FOREIGN KEY ("username") REFERENCES "public"."student"("index") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
