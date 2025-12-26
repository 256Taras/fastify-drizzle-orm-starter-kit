import { PAYMENT_STATUS } from "./payments.contracts.ts";
import type { Payment } from "./payments.types.d.ts";

import { BOOKING_STATUS } from "#modules/bookings/bookings.contracts.ts";
import type { Booking } from "#modules/bookings/bookings.types.d.ts";

export const canPayBooking = (booking: Booking, existingPayment: Payment | undefined): boolean => {
  const validBookingStatus = booking.status === BOOKING_STATUS.pending || booking.status === BOOKING_STATUS.confirmed;
  const noExistingPaidPayment = !existingPayment || existingPayment.status !== PAYMENT_STATUS.paid;
  return validBookingStatus && noExistingPaidPayment;
};
