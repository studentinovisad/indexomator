ALTER TABLE "ratelimit" DROP CONSTRAINT "ratelimit_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "ratelimit" ADD CONSTRAINT "ratelimit_user_id_timestamp_pk" PRIMARY KEY("user_id","timestamp");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratelimit" ADD CONSTRAINT "ratelimit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
