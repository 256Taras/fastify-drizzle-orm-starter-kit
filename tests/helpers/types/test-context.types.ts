import type { PgTable } from "drizzle-orm/pg-core";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { FastifyInstance } from "fastify";

import type { SeedConfig } from "#tests/helpers/types/seed.types.ts";

export type TestApp = FastifyInstance;
export interface TestContext {
  app: TestApp;
  db: TestDb;
  teardown: TestTeardown;
}

export interface TestDb {
  cleanUp(): Promise<void>;
  count(table: PgTable): Promise<number>;
  seed(seedConfig: SeedConfig): Promise<void>;
  seedMany(seedConfigs: SeedConfig[]): Promise<void>;
  withTransaction<T>(testFn: (db: PostgresJsDatabase) => Promise<T>): Promise<T>;
}

export type TestTeardown = () => Promise<void>;
