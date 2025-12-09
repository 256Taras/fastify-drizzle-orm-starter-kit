import * as configs from "#configs/index.js";
import { RestApiServer } from "#infra/api/http/fastify-server.js";
import { DatabaseManager } from "#infra/database/db.js";
import { logger } from "#libs/logging/logger.service.js";

/**
 * @param {object} [options]
 * @param {import("#@types/index.jsdoc.js").Configs} [options.configs]
 * @param {DatabaseManager} [options.database]
 * @returns {Promise<{ app: import("fastify").FastifyInstance; database: DatabaseManager; teardown: () => Promise<void> }>}
 */
export async function createTestingApp(options = {}) {
  const testConfigs = options.configs || configs;

  let testDatabase = options.database;

  const shouldCreateDatabase = !testDatabase;

  if (shouldCreateDatabase) {
    testDatabase = new DatabaseManager({ configs: testConfigs });

    await testDatabase.initialize();
  }

  // TypeScript guard: ensure testDatabase is defined
  if (!testDatabase) {
    throw new Error("Database initialization failed");
  }

  const server = new RestApiServer({
    configs: testConfigs,
    database: testDatabase,
  });

  await server.buildServerApp();

  const app = server.getFastifyInstance();

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
