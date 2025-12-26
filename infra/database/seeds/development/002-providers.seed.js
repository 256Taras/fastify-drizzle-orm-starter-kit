import { inArray } from "drizzle-orm";

import { providers } from "#modules/providers/providers.model.ts";
import { users } from "#modules/users/users.model.ts";

/**
 * Seed providers table with initial data
 *
 * @param {import("drizzle-orm/postgres-js").PostgresJsDatabase} db - Drizzle database instance
 * @param {import("pino").Logger} [logger] - Optional logger instance
 */
export default async function seedProviders(db, logger) {
  // Get some users to be providers
  const providerUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(
      inArray(users.email, [
        "john.doe@example.com",
        "jane.smith@example.com",
        "bob.johnson@example.com",
        "alice.brown@example.com",
        "charlie.wilson@example.com",
      ]),
    );

  if (providerUsers.length === 0) {
    if (logger) {
      logger.warn("No users found for providers seed, skipping");
    }
    return;
  }

  const seedProviders = [
    {
      userId: providerUsers.find((u) => u.email === "john.doe@example.com")?.id,
      name: "John's Barbershop",
      description: "Premium men's grooming and haircuts with 10+ years of experience",
      isVerified: true,
      rating: "4.8",
      reviewsCount: 45,
    },
    {
      userId: providerUsers.find((u) => u.email === "jane.smith@example.com")?.id,
      name: "Jane's Beauty Studio",
      description: "Full-service beauty salon specializing in hair coloring and styling",
      isVerified: true,
      rating: "4.9",
      reviewsCount: 78,
    },
    {
      userId: providerUsers.find((u) => u.email === "bob.johnson@example.com")?.id,
      name: "Bob's Auto Detailing",
      description: "Professional car detailing and cleaning services",
      isVerified: false,
      rating: "4.5",
      reviewsCount: 23,
    },
    {
      userId: providerUsers.find((u) => u.email === "alice.brown@example.com")?.id,
      name: "Alice's Yoga Studio",
      description: "Relaxing yoga classes for all skill levels",
      isVerified: true,
      rating: "4.7",
      reviewsCount: 56,
    },
    {
      userId: providerUsers.find((u) => u.email === "charlie.wilson@example.com")?.id,
      name: "Charlie's Photography",
      description: "Professional photography for events and portraits",
      isVerified: false,
      rating: "4.6",
      reviewsCount: 34,
    },
  ].filter((p) => p.userId);

  // Check for existing providers
  const existingProviders = await db
    .select({ userId: providers.userId })
    .from(providers)
    .where(
      inArray(
        providers.userId,
        seedProviders.map((p) => p.userId),
      ),
    );
  const existingUserIds = new Set(existingProviders.map((p) => p.userId));

  const newProviders = seedProviders.filter((p) => !existingUserIds.has(p.userId));

  if (newProviders.length === 0) {
    if (logger) {
      logger.info(`All ${seedProviders.length} seed providers already exist, skipping insert`);
    }
    return;
  }

  await db.insert(providers).values(newProviders);
  if (logger) {
    logger.info(`✓ Seeded ${newProviders.length} new providers (${existingProviders.length} already existed)`);
  }
}
