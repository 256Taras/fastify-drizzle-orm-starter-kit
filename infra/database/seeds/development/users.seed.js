import { inArray } from "drizzle-orm";

import { ROLES_NAMES } from "#libs/constants/common.constants.js";
import encrypterService from "#libs/encryption/encrypter.service.js";
import { users } from "#modules/users/users.model.js";

/**
 * Seed users table with initial data
 * @param {import('drizzle-orm/postgres-js').PostgresJsDatabase} db - Drizzle database instance
 * @param {import('pino').Logger} [logger] - Optional logger instance
 */
export default async function seedUsers(db, logger) {
  // Initialize encrypter service (it doesn't need dependencies)
  const encrypter = encrypterService();
  const hashedPassword = await encrypter.getHash("password123");

  const seedUsers = [
    {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      password: hashedPassword,
      role: ROLES_NAMES.admin,
    },
    {
      email: "user@example.com",
      firstName: "Regular",
      lastName: "User",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
  ];

  // Check if seed users already exist by email
  const seedEmails = seedUsers.map((user) => user.email);
  const existingUsers = await db.select({ email: users.email }).from(users).where(inArray(users.email, seedEmails));

  if (existingUsers.length > 0) {
    const existingEmails = existingUsers.map((u) => u.email).join(", ");
    const message = `Users with emails [${existingEmails}] already exist, skipping seed`;
    if (logger) {
      logger.info(message);
    }
    return;
  }

  await db.insert(users).values(seedUsers);
  const message = `✓ Seeded ${seedUsers.length} users`;
  if (logger) {
    logger.info(message);
  }
}
