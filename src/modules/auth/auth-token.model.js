import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const authTokens = pgTable("auth_tokens", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  ppid: text("ppid").notNull(),
  userId: uuid("user_id").notNull(),
});
