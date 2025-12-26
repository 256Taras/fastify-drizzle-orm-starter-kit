import { inArray } from "drizzle-orm";

import { bookings } from "#modules/bookings/bookings.model.ts";
import { payments } from "#modules/payments/payments.model.ts";

/**
 * Seed payments table with initial data
 *
 * @param {import("drizzle-orm/postgres-js").PostgresJsDatabase} db - Drizzle database instance
 * @param {import("pino").Logger} [logger] - Optional logger instance
 */
export default async function seedPayments(db, logger) {
  // Get completed and confirmed bookings that should have payments
  const bookingsWithPayments = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      totalPrice: bookings.totalPrice,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .where(inArray(bookings.status, ["completed", "confirmed"]));

  if (bookingsWithPayments.length === 0) {
    if (logger) {
      logger.warn("No completed/confirmed bookings found for payments seed, skipping");
    }
    return;
  }

  // Check for existing payments
  const existingPayments = await db
    .select({ bookingId: payments.bookingId })
    .from(payments)
    .where(
      inArray(
        payments.bookingId,
        bookingsWithPayments.map((b) => b.id),
      ),
    );
  const existingBookingIds = new Set(existingPayments.map((p) => p.bookingId));

  const newPayments = bookingsWithPayments
    .filter((b) => !existingBookingIds.has(b.id))
    .map((booking) => ({
      bookingId: booking.id,
      amount: booking.totalPrice,
      status: "paid",
      paidAt: new Date(new Date(booking.createdAt).getTime() + 60 * 1000).toISOString(), // Paid 1 minute after booking
    }));

  if (newPayments.length === 0) {
    if (logger) {
      logger.info(`All payments already exist, skipping insert`);
    }
    return;
  }

  await db.insert(payments).values(newPayments);
  if (logger) {
    logger.info(`✓ Seeded ${newPayments.length} payments (${existingPayments.length} already existed)`);
  }
}
