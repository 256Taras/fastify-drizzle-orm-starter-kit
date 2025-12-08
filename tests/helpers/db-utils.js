/**
 * @file Database utilities for testing
 */

import { sql } from "drizzle-orm";

import { ENV_CONFIG } from "#configs/env.config.js";
import { logger } from "#libs/logging/logger.service.js";

/**
 * Cleans all data from the database
 * @param {import('drizzle-orm/postgres-js').PostgresJsDatabase} db - Drizzle database instance
 * @returns {Promise<void>}
 */
export async function cleanUp(db) {
  const isTestEnvironment = ENV_CONFIG.ENV_NAME === "test" || ENV_CONFIG.ENV_NAME === "development";

  if (!isTestEnvironment) {
    throw new Error("It's forbidden to clean non-test DB!");
  }

  try {
    const tables = await db.execute(
      sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE '__drizzle%'`,
    );

    if (tables.length > 0) {
      const tableNames = tables.map((t) => `"${t.tablename}"`).join(", ");
      await db.execute(sql.raw(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`));
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error cleaning database:", errorMessage);
    throw error;
  }
}

/**
 * Seeds a single table with the provided data
 * @param {import('drizzle-orm/postgres-js').PostgresJsDatabase} db - Drizzle database instance
 * @param {any} table - Drizzle table instance
 * @param {any[]} data - The data to seed the table with
 * @returns {Promise<void>}
 */
export async function seed(db, table, data) {
  if (!data || data.length === 0) {
    return;
  }

  try {
    await db.insert(table).values(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Error seeding table:", errorMessage);
    throw error;
  }
}

export const dbUtils = {
  cleanUp,
  seed,
};
