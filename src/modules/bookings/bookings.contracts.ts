import { Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { bookings } from "./bookings.model.ts";

import { paginationSchema } from "#libs/utils/schemas.ts";

export { BOOKING_STATUS } from "./bookings.constants.ts";

export const BOOKING_ENTITY_CONTRACT = createSelectSchema(bookings);
export const BOOKING_INSERT_CONTRACT = createInsertSchema(bookings);

export const BOOKING_OUTPUT_CONTRACT = BOOKING_ENTITY_CONTRACT;

export const BOOKING_CREATE_INPUT_CONTRACT = Type.Object({
  serviceId: Type.String({ format: "uuid" }),
  startAt: Type.String({ format: "date-time" }),
});

export const BOOKING_CANCEL_INPUT_CONTRACT = Type.Object({
  reason: Type.Optional(Type.String({ maxLength: 500 })),
});

export const BOOKING_OUTPUT_LIST = paginationSchema(BOOKING_OUTPUT_CONTRACT);
