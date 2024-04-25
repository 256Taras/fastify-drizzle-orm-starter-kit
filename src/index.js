import { logger } from "#libs/services/logger.service.js";
import { DatabaseManager } from "#infra/db.js";
import { RestApiServer } from "#infra/api/http/fastify-server.js";
import { APP_CONFIG, SERVER_CONFIG } from "#configs/index.js";
import * as configs from "#configs/index.js";

class Application {
  #EXIT_SUCCESS = 0;
  #EXIT_FAILURE = 1;

  #restApi;

  #database;

  constructor() {
    // @ts-ignore
    return this.#start();
  }

  // stop all infrastructure: servers, db connections, storage connections (if exists), etc
  async #stopInfrastructure() {
    await this.#restApi.stop();
    if (this.#database.isInitialized) {
      await this.#database.disconnect();
    }
  }

  async #gracefulShutdown() {
    logger.info(`[${APP_CONFIG.applicationName}]: Stopping application on port ${SERVER_CONFIG.port}...`);

    const forceShutdown = setTimeout(() => {
      logger.info(`[${APP_CONFIG.applicationName}]: Application on port ${SERVER_CONFIG.port} stopped forcefully`);
      // eslint-disable-next-line no-process-exit
      process.exit(this.#EXIT_FAILURE);
    }, SERVER_CONFIG.shutdownTimeout);

    await this.#stopInfrastructure();

    logger.info(`[${APP_CONFIG.applicationName}]: Application successfully stopped`);
    clearTimeout(forceShutdown);
    // eslint-disable-next-line no-process-exit
    process.exit(this.#EXIT_SUCCESS);
  }

  #initStopHandlers() {
    const handleSignal = async (signal) => {
      logger.info(`[${APP_CONFIG.applicationName}]: ${signal} signal received`);
      await this.#gracefulShutdown();
    };

    // Subscribe to system signals
    ["SIGTERM", "SIGINT", "SIGHUP"].forEach((signal) => {
      process.on(signal, () => handleSignal(signal));
    });

    process.on("uncaughtException", (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      logger.fatal({
        type: "uncaughtException",
        error: error.stack,
      });
    });
  }

  async #initInfrastructure() {
    logger.info(`[${APP_CONFIG.applicationName}]: Initializing infrastructure...`);
    try {
      //    await AppDataSource.initialize();
    } catch (error) {
      logger.error(error);
    }
    logger.info(`[${APP_CONFIG.applicationName}]: Infrastructure initialized`);

    if (APP_CONFIG.env === "development") {
      logger.info(`[${APP_CONFIG.applicationName}]: See the documentation on ${APP_CONFIG.applicationUrl}/docs`);
    }
  }

  async #start() {
    try {
      this.#database = new DatabaseManager({ configs });
      this.#restApi = new RestApiServer({ configs, database: this.#database });

      this.#initStopHandlers();
      await this.#initInfrastructure();
      // Run servers (all kind of transports: Rest API, WS, etc.)
      await this.#restApi.start({ ip: SERVER_CONFIG.ip, port: SERVER_CONFIG.port });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      // eslint-disable-next-line no-process-exit
      process.exit(this.#EXIT_FAILURE);
    }
  }
}

await new Application();

process.on("exit", (code) =>
  // eslint-disable-next-line no-console
  console.info(`\x1b[38;5;43m[${APP_CONFIG.applicationName}] Exit with code: ${code}.\x1b[0m`),
);
