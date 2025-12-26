import type { UUID } from "node:crypto";

import { getTableColumns } from "drizzle-orm";
import { index, integer, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { omit } from "rambda";

import { PAYMENT_STATUS } from "./payments.constants.ts";

import { TABLE_NAMES } from "#infra/database/table-names.ts";
import { bookings } from "#modules/bookings/bookings.model.ts";

export const paymentStatusEnum = pgEnum("payment_status", PAYMENT_STATUS);

export const payments = pgTable(
  TABLE_NAMES.payments,
  {
    id: uuid("id").$type<UUID>().primaryKey().notNull().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .unique()
      .references(() => bookings.id),
    amount: integer("amount").notNull(),
    status: paymentStatusEnum("status").notNull().default("pending"),
    paidAt: timestamp("paid_at", { mode: "string" }),
    refundedAt: timestamp("refunded_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  },
  (table) => [index("payments_booking_id_idx").on(table.bookingId), index("payments_status_idx").on(table.status)],
);

export const PAYMENT_PUBLIC_COLUMNS = omit([], getTableColumns(payments));
