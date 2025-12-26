import { eq, inArray } from "drizzle-orm";

import { bookings } from "#modules/bookings/bookings.model.ts";
import { reviews } from "#modules/reviews/reviews.model.ts";

/**
 * Seed reviews table with initial data
 *
 * @param {import("drizzle-orm/postgres-js").PostgresJsDatabase} db - Drizzle database instance
 * @param {import("pino").Logger} [logger] - Optional logger instance
 */
export default async function seedReviews(db, logger) {
  // Get completed bookings for reviews
  const completedBookings = await db
    .select({
      id: bookings.id,
      userId: bookings.userId,
      serviceId: bookings.serviceId,
    })
    .from(bookings)
    .where(eq(bookings.status, "completed"));

  if (completedBookings.length === 0) {
    if (logger) {
      logger.warn("No completed bookings found for reviews seed, skipping");
    }
    return;
  }

  // Check for existing reviews
  const existingReviews = await db
    .select({ bookingId: reviews.bookingId })
    .from(reviews)
    .where(
      inArray(
        reviews.bookingId,
        completedBookings.map((b) => b.id),
      ),
    );
  const existingBookingIds = new Set(existingReviews.map((r) => r.bookingId));

  const reviewComments = [
    "Excellent service! Highly recommended.",
    "Great experience, will definitely come back.",
    "Very professional and friendly staff.",
    "Good value for money.",
    "Amazing results, exceeded my expectations!",
  ];

  const newReviews = completedBookings
    .filter((b) => !existingBookingIds.has(b.id))
    .map((booking, index) => ({
      bookingId: booking.id,
      userId: booking.userId,
      serviceId: booking.serviceId,
      rating: Math.floor(Math.random() * 2) + 4, // Random rating 4-5
      comment: reviewComments[index % reviewComments.length],
    }));

  if (newReviews.length === 0) {
    if (logger) {
      logger.info(`All reviews already exist, skipping insert`);
    }
    return;
  }

  await db.insert(reviews).values(newReviews);
  if (logger) {
    logger.info(`✓ Seeded ${newReviews.length} reviews (${existingReviews.length} already existed)`);
  }
}
