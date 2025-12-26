import { inArray } from "drizzle-orm";

import { ROLES_NAMES } from "#libs/constants/common.constants.ts";
import encrypterService from "#libs/encryption/encrypter.service.ts";
import { users } from "#modules/users/users.model.ts";

/**
 * Seed users table with initial data
 *
 * @param {import("drizzle-orm/postgres-js").PostgresJsDatabase} db - Drizzle database instance
 * @param {import("pino").Logger} [logger] - Optional logger instance
 */
export default async function seedUsers(db, logger) {
  // Initialize encrypter service (it doesn't need dependencies)
  const encrypter = encrypterService();
  const hashedPassword = await encrypter.getHash("password123");

  const seedUsers = [
    // Admins
    {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      password: hashedPassword,
      role: ROLES_NAMES.admin,
    },
    {
      email: "superadmin@example.com",
      firstName: "Super",
      lastName: "Admin",
      password: hashedPassword,
      role: ROLES_NAMES.admin,
    },
    {
      email: "manager@example.com",
      firstName: "Manager",
      lastName: "User",
      password: hashedPassword,
      role: ROLES_NAMES.admin,
    },
    {
      email: "admin.johnson@example.com",
      firstName: "Admin",
      lastName: "Johnson",
      password: hashedPassword,
      role: ROLES_NAMES.admin,
    },
    {
      email: "admin.smith@example.com",
      firstName: "Admin",
      lastName: "Smith",
      password: hashedPassword,
      role: ROLES_NAMES.admin,
    },
    // Regular users
    {
      email: "user@example.com",
      firstName: "Regular",
      lastName: "User",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "bob.johnson@example.com",
      firstName: "Bob",
      lastName: "Johnson",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "alice.brown@example.com",
      firstName: "Alice",
      lastName: "Brown",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "charlie.wilson@example.com",
      firstName: "Charlie",
      lastName: "Wilson",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "diana.martinez@example.com",
      firstName: "Diana",
      lastName: "Martinez",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "emma.davis@example.com",
      firstName: "Emma",
      lastName: "Davis",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "frank.miller@example.com",
      firstName: "Frank",
      lastName: "Miller",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "grace.lee@example.com",
      firstName: "Grace",
      lastName: "Lee",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "henry.taylor@example.com",
      firstName: "Henry",
      lastName: "Taylor",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "iris.anderson@example.com",
      firstName: "Iris",
      lastName: "Anderson",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "jack.thomas@example.com",
      firstName: "Jack",
      lastName: "Thomas",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "kate.jackson@example.com",
      firstName: "Kate",
      lastName: "Jackson",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "liam.white@example.com",
      firstName: "Liam",
      lastName: "White",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "mia.harris@example.com",
      firstName: "Mia",
      lastName: "Harris",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "noah.martin@example.com",
      firstName: "Noah",
      lastName: "Martin",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "olivia.thompson@example.com",
      firstName: "Olivia",
      lastName: "Thompson",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "peter.garcia@example.com",
      firstName: "Peter",
      lastName: "Garcia",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "quinn.martinez@example.com",
      firstName: "Quinn",
      lastName: "Martinez",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "rachel.robinson@example.com",
      firstName: "Rachel",
      lastName: "Robinson",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "samuel.clark@example.com",
      firstName: "Samuel",
      lastName: "Clark",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "tina.rodriguez@example.com",
      firstName: "Tina",
      lastName: "Rodriguez",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "victor.lewis@example.com",
      firstName: "Victor",
      lastName: "Lewis",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
    {
      email: "wendy.walker@example.com",
      firstName: "Wendy",
      lastName: "Walker",
      password: hashedPassword,
      role: ROLES_NAMES.user,
    },
  ];

  // Check if seed users already exist by email and only insert new ones
  const seedEmails = seedUsers.map((user) => user.email);
  const existingUsers = await db.select({ email: users.email }).from(users).where(inArray(users.email, seedEmails));
  const existingEmails = new Set(existingUsers.map((u) => u.email));

  // Filter out users that already exist
  const newUsers = seedUsers.filter((user) => !existingEmails.has(user.email));

  if (newUsers.length === 0) {
    const message = `All ${seedUsers.length} seed users already exist, skipping insert`;
    if (logger) {
      logger.info(message);
    }
    return;
  }

  await db.insert(users).values(newUsers);
  const message = `✓ Seeded ${newUsers.length} new users (${existingUsers.length} already existed)`;
  if (logger) {
    logger.info(message);
  }
}
