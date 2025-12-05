import { APP_CONFIG, SERVER_CONFIG } from "#configs/index.js";
import * as configs from "#configs/index.js";
import { RestApiServer } from "#infra/api/http/fastify-server.js";
import { DatabaseManager } from "#infra/db.js";
import { logger } from "#libs/services/logger.service.js";

class Application {
  #database;
  #EXIT_FAILURE = 1;

  #EXIT_SUCCESS = 0;

  #restApi;

  /**
   *
   */
  constructor() {
    // @ts-ignore
    return this.#start();
  }

  /**
   *
   */
  async #gracefulShutdown() {
    logger.info(`[${APP_CONFIG.applicationName}]: Stopping application on port ${SERVER_CONFIG.port}...`);

    const forceShutdown = setTimeout(() => {
      logger.info(`[${APP_CONFIG.applicationName}]: Application on port ${SERVER_CONFIG.port} stopped forcefully`);

      process.exit(this.#EXIT_FAILURE);
    }, SERVER_CONFIG.shutdownTimeout);

    await this.#stopInfrastructure();

    logger.info(`[${APP_CONFIG.applicationName}]: Application successfully stopped`);
    clearTimeout(forceShutdown);

    process.exit(this.#EXIT_SUCCESS);
  }

  /**
   *
   */
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

  /**
   *
   */
  #initStopHandlers() {
    /**
     *
     * @param {string} signal
     */
    const handleSignal = async (signal) => {
      logger.info(`[${APP_CONFIG.applicationName}]: ${signal} signal received`);
      await this.#gracefulShutdown();
    };

    // Subscribe to system signals
    for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"]) {
      process.on(signal, () => handleSignal(signal));
    }

    process.on("uncaughtException", (error) => {
      // eslint-disable-next-line no-console
      console.error(error);
      logger.fatal({
        error: error.stack,
        type: "uncaughtException",
      });
    });
  }

  /**
   *
   */
  async #start() {
    try {
      this.#database = new DatabaseManager({ configs });
      this.#restApi = new RestApiServer({ configs, database: this.#database });

      this.#initStopHandlers();
      await this.#initInfrastructure();
      // Run servers (all kind of transports: Rest API, WS, etc.)
      await this.#restApi.start({ ip: SERVER_CONFIG.ip, port: SERVER_CONFIG.port });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      process.exit(this.#EXIT_FAILURE);
    }
  }

  // stop all infrastructure: servers, db connections, storage connections (if exists), etc
  /**
   *
   */
  async #stopInfrastructure() {
    await this.#restApi.stop();
    if (this.#database.isInitialized) {
      await this.#database.disconnect();
    }
  }
}

await new Application();

process.on("exit", (code) =>
  // eslint-disable-next-line no-console
  console.info(`\u001B[38;5;43m[${APP_CONFIG.applicationName}] Exit with code: ${code}.\u001B[0m`),
);
