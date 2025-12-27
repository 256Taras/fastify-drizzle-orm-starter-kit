import type { Static } from "@sinclair/typebox";

import type {
  BOOKING_CANCEL_INPUT_CONTRACT,
  BOOKING_CREATE_INPUT_CONTRACT,
  BOOKING_INSERT_CONTRACT,
  BOOKING_OUTPUT_CONTRACT,
  BOOKING_OUTPUT_LIST,
  BOOKING_STATUS,
} from "./bookings.contracts.ts";
import type bookingsMutations from "./bookings.mutations.ts";
import type bookingsQueries from "./bookings.queries.ts";
import type bookingsRepository from "./bookings.repository.ts";

import type { User } from "#modules/users/users.contracts.ts";

export type Booking = Static<typeof BOOKING_OUTPUT_CONTRACT>;

export type BookingCancelInput = Static<typeof BOOKING_CANCEL_INPUT_CONTRACT>;

export type BookingCreateInput = Static<typeof BOOKING_CREATE_INPUT_CONTRACT>;

export interface BookingEventPayload {
  booking: Booking;
  user: User;
}

export type BookingInsert = Static<typeof BOOKING_INSERT_CONTRACT>;

export type BookingsListResponse = Static<typeof BOOKING_OUTPUT_LIST>;

export type BookingStatus = keyof typeof BOOKING_STATUS;

declare module "@fastify/awilix" {
  interface Cradle {
    bookingsMutations: ReturnType<typeof bookingsMutations>;
    bookingsQueries: ReturnType<typeof bookingsQueries>;
    bookingsRepository: ReturnType<typeof bookingsRepository>;
  }
}
