import { sql } from "drizzle-orm";

import { ENV_CONFIG } from "#configs/env.config.js";
import { logger } from "#libs/logging/logger.service.js";
import { users } from "#modules/users/users.model.js";

const TEST_DB_NAME = "test_db";
const TEST_DB_PORT = "5434";

export const TABLE_NAMES = {
  users: "USERS",
};

const DRIZZLE_TABLES = {
  [TABLE_NAMES.users]: users,
};

/** @param {import("drizzle-orm/postgres-js").PostgresJsDatabase} drizzleDb */
export function createDbHelper(drizzleDb) {
  return {
    /** @returns {Promise<void>} */
    async cleanUp() {
      await validateTestDatabase(drizzleDb);

      const tables = await drizzleDb.execute(
        sql`
          SELECT tablename FROM pg_tables
          WHERE schemaname = 'public'
            AND tablename NOT LIKE '__drizzle%'
        `,
      );

      if (tables.length === 0) return;

      const tableNames = tables.map((t) => `"${t.tablename}"`).join(", ");
      await drizzleDb.execute(sql.raw(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`));
    },

    /**
     * @param {{ table: string; data: Record<string, unknown>[] }} seedConfig - Seed configuration
     * @returns {Promise<void>}
     */
    async seed(seedConfig) {
      const { table, data } = seedConfig;

      if (!table) {
        throw new Error("table is required in seed config");
      }
      if (data.length === 0) return;

      // If table is a string, resolve it from tablesMap
      // eslint-disable-next-line security/detect-object-injection
      const ormTable = DRIZZLE_TABLES[table];

      if (!ormTable) {
        throw new Error(`Table "${table}" not found in tables map`);
      }

      // @ts-expect-error - Generic data array is cast to specific table schema at runtime
      await drizzleDb.insert(ormTable).values(data);
    },

    /**
     * @param {{ table: string; data: Record<string, unknown>[] }[]} seedConfigs - Масив { table, data }
     * @returns {Promise<void>}
     */
    async seedMany(seedConfigs) {
      for (const config of seedConfigs) {
        await this.seed(config);
      }
    },

    /**
     * @param {import("drizzle-orm").Table} table
     * @returns {Promise<number>}
     */
    async count(table) {
      const [result] = await drizzleDb.select({ count: sql`COUNT(*)` }).from(table);
      return Number(result.count);
    },

    /**
     * @template T - Return type of test function
     * @param {(db: import("drizzle-orm/postgres-js").PostgresJsDatabase) => Promise<T>} testFn - Test function
     * @returns {Promise<T>}
     */
    async withTransaction(testFn) {
      await validateTestDatabase(drizzleDb);

      const savepointId = `test_${Date.now()}_${Math.random().toString(36).slice(7)}`;

      try {
        await drizzleDb.execute(sql.raw(`SAVEPOINT ${savepointId}`));
        const result = await testFn(drizzleDb);
        await drizzleDb.execute(sql.raw(`ROLLBACK TO SAVEPOINT ${savepointId}`));
        return result;
      } catch (error) {
        try {
          await drizzleDb.execute(sql.raw(`ROLLBACK TO SAVEPOINT ${savepointId}`));
        } catch (rollbackError) {
          logger.error("Error during rollback:", rollbackError);
        }
        throw error;
      }
    },
  };
}

/** @param {import("drizzle-orm/postgres-js").PostgresJsDatabase} db */
async function validateTestDatabase(db) {
  if (ENV_CONFIG.ENV_NAME !== "test") {
    throw new Error(`Cleanup only allowed in test environment. Current: ${ENV_CONFIG.ENV_NAME}`);
  }

  const [result] = await db.execute(sql`SELECT current_database() as name`);
  const dbName = result?.name;

  if (dbName !== TEST_DB_NAME) {
    throw new Error(`Wrong database name: ${dbName}. Expected: ${TEST_DB_NAME}`);
  }

  const dbUrl = new URL(ENV_CONFIG.DATABASE_URL);
  const port = dbUrl.port || (dbUrl.protocol === "postgresql:" ? "5432" : "");

  if (port !== TEST_DB_PORT) {
    throw new Error(`Wrong database port: ${port}. Expected: ${TEST_DB_PORT}`);
  }
}
