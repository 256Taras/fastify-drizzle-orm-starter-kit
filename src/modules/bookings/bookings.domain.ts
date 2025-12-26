import { BOOKING_STATUS } from "./bookings.contracts.ts";
import type { Booking } from "./bookings.types.d.ts";

import { SERVICE_STATUS } from "#modules/services/services.contracts.ts";
import type { Service } from "#modules/services/services.types.d.ts";

const HOURS_BEFORE_START_FOR_FREE_CANCELLATION = 24;
const CANCELLATION_FEE_PERCENTAGE = 0.2;
const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_MINUTE = 60 * 1000;

export const canCreateBooking = (service: Service, userId: string, providerUserId: string): boolean => {
  return service.status === SERVICE_STATUS.active && providerUserId !== userId;
};

export const canCancelBooking = (booking: Booking, userId: string): boolean => {
  const isCancellable = booking.status === BOOKING_STATUS.pending || booking.status === BOOKING_STATUS.confirmed;
  const isOwner = booking.userId === userId;
  return isCancellable && isOwner;
};

export const canConfirmBooking = (booking: Booking, providerUserId: string, serviceProviderUserId: string): boolean => {
  return booking.status === BOOKING_STATUS.pending && providerUserId === serviceProviderUserId;
};

export const canCompleteBooking = (
  booking: Booking,
  providerUserId: string,
  serviceProviderUserId: string,
  currentDate: Date,
): boolean => {
  const endAt = new Date(booking.endAt);
  return booking.status === BOOKING_STATUS.confirmed && providerUserId === serviceProviderUserId && currentDate >= endAt;
};

export const calculateCancellationFee = (booking: Booking, cancelledAt: Date): number => {
  const startAt = new Date(booking.startAt);
  const hoursBeforeStart = (startAt.getTime() - cancelledAt.getTime()) / MS_PER_HOUR;

  if (hoursBeforeStart >= HOURS_BEFORE_START_FOR_FREE_CANCELLATION) {
    return 0;
  }

  return Math.round(booking.totalPrice * CANCELLATION_FEE_PERCENTAGE);
};

export const hasTimeConflict = (
  existingBookings: Array<{ endAt: string; startAt: string }>,
  newStartAt: Date,
  newEndAt: Date,
): boolean => {
  return existingBookings.some((booking) => {
    const existingStart = new Date(booking.startAt);
    const existingEnd = new Date(booking.endAt);
    return newStartAt < existingEnd && newEndAt > existingStart;
  });
};

export const calculateEndTime = (startAt: Date, durationMinutes: number): Date => {
  return new Date(startAt.getTime() + durationMinutes * MS_PER_MINUTE);
};

export const isBookingInPast = (startAt: Date, currentDate: Date): boolean => {
  return startAt < currentDate;
};
