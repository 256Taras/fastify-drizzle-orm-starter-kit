import { getTableColumns } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { omit } from "rambda";

import { ROLES_NAMES } from "#libs/common.constants.js";

export const roleEnum = pgEnum("roles", [ROLES_NAMES.user, ROLES_NAMES.admin]);

export const users = pgTable("users", {
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "string" }),
  email: varchar("email", { length: 256 }).notNull(),
  firstName: text("first_name").notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  lastName: text("last_name").notNull(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default(ROLES_NAMES.user),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const NON_PASSWORD_COLUMNS = omit(["password"], getTableColumns(users));
