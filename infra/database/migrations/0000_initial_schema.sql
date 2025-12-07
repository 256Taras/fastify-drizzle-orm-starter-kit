CREATE TYPE "public"."roles" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ppid" text NOT NULL,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"email" varchar(256) NOT NULL,
	"first_name" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"last_name" text NOT NULL,
	"password" text NOT NULL,
	"role" "roles" DEFAULT 'USER' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
