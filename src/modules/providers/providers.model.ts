import type { UUID } from "node:crypto";

import { getTableColumns } from "drizzle-orm";
import { boolean, decimal, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { omit } from "rambda";

import { TABLE_NAMES } from "#infra/database/table-names.ts";
import { users } from "#modules/users/users.model.ts";
import type { DateTimeString } from "#types/brands.ts";

export const providers = pgTable(
  TABLE_NAMES.providers,
  {
    id: uuid("id").$type<UUID>().primaryKey().notNull().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    logoUrl: varchar("logo_url", { length: 500 }),
    isVerified: boolean("is_verified").notNull().default(false),
    rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("0"),
    reviewsCount: integer("reviews_count").notNull().default(0),
    createdAt: timestamp("created_at", { mode: "string" }).$type<DateTimeString>().defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).$type<DateTimeString>().defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }).$type<DateTimeString>(),
  },
  (table) => [index("providers_user_id_idx").on(table.userId), index("providers_deleted_at_idx").on(table.deletedAt)],
);

export const PROVIDER_PUBLIC_COLUMNS = omit(["deletedAt"], getTableColumns(providers));
