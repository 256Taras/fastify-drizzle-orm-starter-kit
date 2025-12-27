import { Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { bookings } from "./bookings.model.ts";

import { cursorPaginationSchema, TypeDateTimeString, TypeUuid } from "#libs/utils/schemas.ts";

export { BOOKING_STATUS } from "./bookings.constants.ts";

export const BOOKING_ENTITY_CONTRACT = createSelectSchema(bookings);

export const BOOKING_INSERT_CONTRACT = createInsertSchema(bookings);

export const BOOKING_OUTPUT_CONTRACT = BOOKING_ENTITY_CONTRACT;

export const BOOKING_CREATE_INPUT_CONTRACT = Type.Object({
  serviceId: TypeUuid(),
  startAt: TypeDateTimeString(),
});

export const BOOKING_CANCEL_INPUT_CONTRACT = Type.Object({
  reason: Type.Optional(Type.String({ maxLength: 500 })),
});

export const BOOKING_OUTPUT_LIST = cursorPaginationSchema(BOOKING_OUTPUT_CONTRACT);
