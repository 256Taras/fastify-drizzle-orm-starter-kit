import type { UUID } from "node:crypto";

import { getTableColumns } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { omit } from "rambda";

import { SERVICE_STATUS } from "./services.constants.ts";

import { TABLE_NAMES } from "#infra/database/table-names.ts";
import { providers } from "#modules/providers/providers.model.ts";

export const serviceStatusEnum = pgEnum("service_status", SERVICE_STATUS);

export const services = pgTable(
  TABLE_NAMES.services,
  {
    id: uuid("id").$type<UUID>().primaryKey().notNull().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => providers.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 500 }),
    price: integer("price").notNull(),
    duration: integer("duration").notNull(),
    status: serviceStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { mode: "string" }),
  },
  (table) => [
    index("services_provider_id_idx").on(table.providerId),
    index("services_status_idx").on(table.status),
    index("services_deleted_at_idx").on(table.deletedAt),
  ],
);

export const SERVICE_PUBLIC_COLUMNS = omit(["deletedAt"], getTableColumns(services));
