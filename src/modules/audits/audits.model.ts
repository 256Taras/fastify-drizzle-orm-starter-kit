import type { UUID } from "node:crypto";

import { getTableColumns, type InferSelectModel } from "drizzle-orm";
import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { AUDIT_ACTION } from "./audits.constants.ts";

import { TABLE_NAMES } from "#infra/database/table-names.ts";
import type { DateTimeString } from "#types/brands.ts";

export const auditActionEnum = pgEnum("audit_action", AUDIT_ACTION);

export const auditLogs = pgTable(
  TABLE_NAMES.auditLogs,
  {
    id: uuid("id").$type<UUID>().primaryKey().notNull().defaultRandom(),
    userId: uuid("user_id"),
    action: auditActionEnum("action").notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { mode: "string" }).$type<DateTimeString>().defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_user_id_idx").on(table.userId),
    index("audit_logs_action_idx").on(table.action),
    index("audit_logs_entity_type_idx").on(table.entityType),
    index("audit_logs_entity_id_idx").on(table.entityId),
    index("audit_logs_created_at_idx").on(table.createdAt),
  ],
);

export const AUDIT_LOG_COLUMNS = getTableColumns(auditLogs);

export type AuditLogRow = InferSelectModel<typeof auditLogs>;
