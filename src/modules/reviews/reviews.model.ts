import type { UUID } from "node:crypto";

import { getTableColumns } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { omit } from "rambda";

import { TABLE_NAMES } from "#infra/database/table-names.ts";
import { bookings } from "#modules/bookings/bookings.model.ts";
import { services } from "#modules/services/services.model.ts";
import { users } from "#modules/users/users.model.ts";
import type { DateTimeString } from "#types/brands.ts";

export const reviews = pgTable(
  TABLE_NAMES.reviews,
  {
    id: uuid("id").$type<UUID>().primaryKey().notNull().defaultRandom(),
    bookingId: uuid("booking_id")
      .notNull()
      .unique()
      .references(() => bookings.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { mode: "string" }).$type<DateTimeString>().defaultNow().notNull(),
  },
  (table) => [
    index("reviews_service_id_idx").on(table.serviceId),
    index("reviews_user_id_idx").on(table.userId),
    index("reviews_rating_idx").on(table.rating),
  ],
);

export const REVIEW_PUBLIC_COLUMNS = omit([], getTableColumns(reviews));
