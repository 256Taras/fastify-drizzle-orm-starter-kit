import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { TABLE_NAMES } from "#infra/database/table-names.js";

export const authPasswordResetTokens = pgTable(
  TABLE_NAMES.authPasswordResetTokens,
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    email: text("email").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    token: text("token").notNull().unique(),
    used: timestamp("used_at"),
  },
  (table) => [
    index("auth_password_reset_tokens_email_idx").on(table.email),
    index("auth_password_reset_tokens_token_idx").on(table.token),
  ],
);
