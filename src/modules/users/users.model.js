// eslint-disable-next-line node/file-extension-in-import
import { pgTable, text, timestamp, varchar, uuid, pgEnum } from "drizzle-orm/pg-core";
import { getTableColumns } from "drizzle-orm";
import { omit } from "rambda";

import { ROLES_NAMES } from "#libs/common.constants.js";

export const roleEnum = pgEnum("roles", [ROLES_NAMES.user, ROLES_NAMES.admin]);
export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: varchar("email", { length: 256 }).notNull(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default(ROLES_NAMES.user),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "string" }),
});

export const NON_PASSWORD_COLUMNS = omit(["password"], getTableColumns(users));
