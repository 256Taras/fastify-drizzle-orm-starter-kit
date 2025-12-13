CREATE INDEX "auth_tokens_ppid_user_id_idx" ON "auth_tokens" USING btree ("ppid","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_deleted_at_email_idx" ON "users" USING btree ("deleted_at","email");