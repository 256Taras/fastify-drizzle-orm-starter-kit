import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { TABLE_NAMES } from "#infra/database/table-names.ts";

export const authTokens = pgTable(
  TABLE_NAMES.authTokens,
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    ppid: text("ppid").notNull(),
    userId: uuid("user_id").notNull(),
  },
  (table) => [index("auth_tokens_ppid_user_id_idx").on(table.ppid, table.userId)],
);
