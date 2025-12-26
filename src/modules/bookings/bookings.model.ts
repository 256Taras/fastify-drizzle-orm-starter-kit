import type { UUID } from "node:crypto";

import { getTableColumns } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { omit } from "rambda";

import { BOOKING_STATUS } from "./bookings.constants.ts";

import { TABLE_NAMES } from "#infra/database/table-names.ts";
import { services } from "#modules/services/services.model.ts";
import { users } from "#modules/users/users.model.ts";

export const bookingStatusEnum = pgEnum("booking_status", BOOKING_STATUS);

export const bookings = pgTable(
  TABLE_NAMES.bookings,
  {
    id: uuid("id").$type<UUID>().primaryKey().notNull().defaultRandom(),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    startAt: timestamp("start_at", { mode: "string" }).notNull(),
    endAt: timestamp("end_at", { mode: "string" }).notNull(),
    status: bookingStatusEnum("status").notNull().default("pending"),
    totalPrice: integer("total_price").notNull(),
    cancellationReason: text("cancellation_reason"),
    cancelledAt: timestamp("cancelled_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("bookings_service_id_idx").on(table.serviceId),
    index("bookings_user_id_idx").on(table.userId),
    index("bookings_status_idx").on(table.status),
    index("bookings_start_at_idx").on(table.startAt),
  ],
);

export const BOOKING_PUBLIC_COLUMNS = omit([], getTableColumns(bookings));
