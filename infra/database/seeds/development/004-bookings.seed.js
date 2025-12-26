import { isNull } from "drizzle-orm";

import { bookings } from "#modules/bookings/bookings.model.ts";
import { providers } from "#modules/providers/providers.model.ts";
import { services } from "#modules/services/services.model.ts";
import { users } from "#modules/users/users.model.ts";

/**
 * Seed bookings table with initial data
 *
 * @param {import("drizzle-orm/postgres-js").PostgresJsDatabase} db - Drizzle database instance
 * @param {import("pino").Logger} [logger] - Optional logger instance
 */
export default async function seedBookings(db, logger) {
  // Get active services
  const activeServices = await db
    .select({
      id: services.id,
      providerId: services.providerId,
      price: services.price,
      duration: services.duration,
      name: services.name,
    })
    .from(services)
    .where(isNull(services.deletedAt));

  if (activeServices.length === 0) {
    if (logger) {
      logger.warn("No services found for bookings seed, skipping");
    }
    return;
  }

  // Get provider user IDs to exclude them from being customers
  const providerRecords = await db.select({ userId: providers.userId }).from(providers);
  const providerUserIds = new Set(providerRecords.map((p) => p.userId));

  // Get users who are NOT providers (customers)
  const customers = await db.select({ id: users.id, email: users.email }).from(users).where(isNull(users.deletedAt));

  const customerUsers = customers.filter((u) => !providerUserIds.has(u.id));

  if (customerUsers.length === 0) {
    if (logger) {
      logger.warn("No customer users found for bookings seed, skipping");
    }
    return;
  }

  // Create bookings with different statuses
  const now = new Date();
  const seedBookings = [];

  // Past completed bookings
  for (let i = 0; i < 5; i++) {
    const service = activeServices[i % activeServices.length];
    const customer = customerUsers[i % customerUsers.length];
    const startAt = new Date(now.getTime() - (7 - i) * 24 * 60 * 60 * 1000);
    startAt.setHours(10 + i, 0, 0, 0);
    const endAt = new Date(startAt.getTime() + service.duration * 60 * 1000);

    seedBookings.push({
      serviceId: service.id,
      userId: customer.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      status: "completed",
      totalPrice: service.price,
    });
  }

  // Confirmed upcoming bookings
  for (let i = 0; i < 3; i++) {
    const service = activeServices[(i + 2) % activeServices.length];
    const customer = customerUsers[(i + 3) % customerUsers.length];
    const startAt = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
    startAt.setHours(14 + i, 0, 0, 0);
    const endAt = new Date(startAt.getTime() + service.duration * 60 * 1000);

    seedBookings.push({
      serviceId: service.id,
      userId: customer.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      status: "confirmed",
      totalPrice: service.price,
    });
  }

  // Pending bookings
  for (let i = 0; i < 2; i++) {
    const service = activeServices[(i + 4) % activeServices.length];
    const customer = customerUsers[(i + 5) % customerUsers.length];
    const startAt = new Date(now.getTime() + (i + 5) * 24 * 60 * 60 * 1000);
    startAt.setHours(11 + i, 0, 0, 0);
    const endAt = new Date(startAt.getTime() + service.duration * 60 * 1000);

    seedBookings.push({
      serviceId: service.id,
      userId: customer.id,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      status: "pending",
      totalPrice: service.price,
    });
  }

  // Cancelled booking
  const cancelledService = activeServices[0];
  const cancelledCustomer = customerUsers.at(-1);
  const cancelledStartAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  cancelledStartAt.setHours(15, 0, 0, 0);

  seedBookings.push({
    serviceId: cancelledService.id,
    userId: cancelledCustomer.id,
    startAt: cancelledStartAt.toISOString(),
    endAt: new Date(cancelledStartAt.getTime() + cancelledService.duration * 60 * 1000).toISOString(),
    status: "cancelled",
    totalPrice: cancelledService.price,
    cancellationReason: "Schedule conflict",
    cancelledAt: new Date(cancelledStartAt.getTime() - 24 * 60 * 60 * 1000).toISOString(),
  });

  // Check existing bookings count
  const existingCount = await db.select({ id: bookings.id }).from(bookings);

  if (existingCount.length > 0) {
    if (logger) {
      logger.info(`${existingCount.length} bookings already exist, skipping seed`);
    }
    return;
  }

  await db.insert(bookings).values(seedBookings);
  if (logger) {
    logger.info(`✓ Seeded ${seedBookings.length} bookings`);
  }
}
