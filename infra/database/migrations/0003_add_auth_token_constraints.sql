-- Add foreign key constraint on auth_tokens.user_id
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

--> statement-breakpoint

-- Add index for token lookup by id and user_id (used in token revocation check)
CREATE INDEX "auth_tokens_id_user_id_idx" ON "auth_tokens" USING btree ("id", "user_id");
