import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Table to track executed seed files Similar to __drizzle_migrations table for migrations This is a system table used only
 * by the seed script, not part of the main application schema
 */
export const seedTracking = pgTable("__drizzle_seeds", {
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  environment: varchar("environment", { length: 50 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull().primaryKey(),
});
