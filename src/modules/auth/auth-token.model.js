// eslint-disable-next-line node/file-extension-in-import
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const authTokens = pgTable("auth_tokens", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  ppid: text("ppid").notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
