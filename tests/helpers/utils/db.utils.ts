import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { ENV_CONFIG } from "#configs/env.config.ts";
import { logger } from "#libs/logging/logger.service.ts";
import { authPasswordResetTokens } from "#modules/auth/auth-password-reset-token.model.ts";
import { authTokens } from "#modules/auth/auth-token.model.ts";
import { users } from "#modules/users/users.model.ts";
import type { SeedConfig } from "#tests/helpers/types/seed.types.ts";

const TEST_DB_NAME = "test_db";
const TEST_DB_PORT = "5434";

export const TABLE_NAMES = {
  authPasswordResetTokens: "AUTH_PASSWORD_RESET_TOKENS",
  authTokens: "AUTH_TOKENS",
  users: "USERS",
} as const;

const DRIZZLE_TABLES: Record<string, PgTable> = {
  [TABLE_NAMES.authPasswordResetTokens]: authPasswordResetTokens,
  [TABLE_NAMES.authTokens]: authTokens,
  [TABLE_NAMES.users]: users,
};

export function createDbHelper(drizzleDb: PostgresJsDatabase<any>) {
  return {
    async cleanUp(): Promise<void> {
      await validateTestDatabase(drizzleDb);

      const tables = await drizzleDb.execute(
        sql`
          SELECT tablename FROM pg_tables
          WHERE schemaname = 'public'
            AND tablename NOT LIKE '__drizzle%'
        `,
      );

      if (tables.length === 0) return;

      const tableNames = tables.map((t) => `"${String(t.tablename)}"`).join(", ");
      await drizzleDb.execute(sql.raw(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE`));
    },

    async seed(seedConfig: SeedConfig): Promise<void> {
      const { table, data } = seedConfig;

      if (!table) {
        throw new Error("table is required in seed config");
      }
      if (data.length === 0) return;

      // eslint-disable-next-line security/detect-object-injection
      const ormTable = DRIZZLE_TABLES[table];

      if (!ormTable) {
        throw new Error(`Table "${table}" not found in tables map`);
      }

      await drizzleDb.insert(ormTable).values(data as never);
    },

    async seedMany(seedConfigs: SeedConfig[]): Promise<void> {
      for (const config of seedConfigs) {
        await this.seed(config);
      }
    },

    async count(table: PgTable): Promise<number> {
      const [result] = await drizzleDb.select({ count: sql`COUNT(*)` }).from(table);
      return Number(result.count);
    },

    async withTransaction<T>(testFn: (db: PostgresJsDatabase) => Promise<T>): Promise<T> {
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

async function validateTestDatabase(db: PostgresJsDatabase): Promise<void> {
  if (ENV_CONFIG.ENV_NAME !== "test") {
    throw new Error(`Cleanup only allowed in test environment. Current: ${ENV_CONFIG.ENV_NAME}`);
  }

  const [result] = await db.execute(sql`SELECT current_database() as name`);
  const dbName = result?.name;

  if (dbName !== TEST_DB_NAME) {
    throw new Error(`Wrong database name: ${String(dbName)}. Expected: ${TEST_DB_NAME}`);
  }

  const dbUrl = new URL(ENV_CONFIG.DATABASE_URL);
  const port = dbUrl.port || (dbUrl.protocol === "postgresql:" ? "5432" : "");

  if (port !== TEST_DB_PORT) {
    throw new Error(`Wrong database port: ${port}. Expected: ${TEST_DB_PORT}`);
  }
}
