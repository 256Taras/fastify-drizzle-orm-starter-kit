import { getTableColumns } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { omit } from "rambda";

import { TABLE_NAMES } from "#infra/database/table-names.js";
import { ROLES_NAMES } from "#libs/constants/common.constants.js";

export const roleEnum = pgEnum("roles", [ROLES_NAMES.user, ROLES_NAMES.admin]);

export const users = pgTable(
  TABLE_NAMES.users,
  {
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
    email: varchar("email", { length: 256 }).notNull(),
    firstName: text("first_name").notNull(),
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    lastName: text("last_name").notNull(),
    password: text("password").notNull(),
    role: roleEnum("role").notNull().default(ROLES_NAMES.user),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique_idx").on(table.email),
    index("users_deleted_at_email_idx").on(table.deletedAt, table.email),
  ],
);

export const NON_PASSWORD_COLUMNS = omit(["password"], getTableColumns(users));
