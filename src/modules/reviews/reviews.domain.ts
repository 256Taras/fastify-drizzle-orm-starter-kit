import { BOOKING_STATUS } from "#modules/bookings/bookings.contracts.ts";
import type { Booking } from "#modules/bookings/bookings.types.d.ts";

const RATING_PRECISION = 10;

export const canLeaveReview = (booking: Booking, userId: string): boolean => {
  return booking.status === BOOKING_STATUS.completed && booking.userId === userId;
};

export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * RATING_PRECISION) / RATING_PRECISION;
};
