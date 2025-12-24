import type { FastifyInstance } from "fastify";

import * as configs from "#configs/index.ts";
import { RestApiServer } from "#infra/api/http/fastify-server.ts";
import { DatabaseManager } from "#infra/database/db.ts";
import { logger } from "#libs/logging/logger.service.ts";
import type { TestContext } from "#tests/helpers/types/test-context.types.ts";
import { createDbHelper } from "#tests/helpers/utils/db.utils.ts";
import type { Configs } from "#types/config.types.d.ts";

interface CreateTestingAppOptions {
  configs?: Configs;
  database?: DatabaseManager;
}

interface TestingAppResult {
  app: FastifyInstance;
  database: DatabaseManager;
  teardown: () => Promise<void>;
}

export async function createTestContext(): Promise<TestContext> {
  const payload = await createTestingApp();
  const db = createDbHelper(payload.database.drizzle);

  return {
    app: payload.app,
    db,
    teardown: payload.teardown,
  };
}

export async function createTestingApp(options: CreateTestingAppOptions = {}): Promise<TestingAppResult> {
  const testConfigs = options.configs || configs;

  let testDatabase = options.database;

  const shouldCreateDatabase = !testDatabase;

  if (shouldCreateDatabase) {
    testDatabase = new DatabaseManager({ configs: testConfigs });

    await testDatabase.initialize();
  }

  if (!testDatabase) {
    throw new Error("Database initialization failed");
  }

  const server = new RestApiServer({
    configs: testConfigs,
    database: testDatabase,
  });

  await server.buildServerApp();

  const app = server.getFastifyInstance() as unknown as FastifyInstance;

  await app.ready();

  return {
    app,
    database: testDatabase,
    teardown: async () => {
      try {
        await server.stop();
        if (shouldCreateDatabase && testDatabase?.isInitialized) {
          await testDatabase.disconnect();
        }
        logger.debug("Test app successfully closed");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Error during test app teardown:", errorMessage);
      }
    },
  };
}
