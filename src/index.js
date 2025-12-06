// application.js
import * as configs from "#configs/index.js";
import { APP_CONFIG, SERVER_CONFIG } from "#configs/index.js";
import { RestApiServer } from "#infra/api/http/fastify-server.js";
import { DatabaseManager } from "#infra/database/db.js";
import { logger } from "#libs/services/logger.service.js";

/**
 * @typedef {'idle' | 'starting' | 'running' | 'stopping' | 'stopped'} AppState
 */

/**
 * Application lifecycle manager
 * Handles initialization, graceful shutdown, and error handling
 */
class Application {
  /** Signals to listen for graceful shutdown */
  static SHUTDOWN_SIGNALS = ["SIGTERM", "SIGINT", "SIGHUP"];

  /**
   * Checks if application is running
   * @returns {boolean}
   */
  get isRunning() {
    return this.#state === "running";
  }

  /**
   * Gets current application state
   * @returns {AppState}
   */
  get state() {
    return this.#state;
  }

  /** @type {DatabaseManager | null} */
  #database = null;

  /** @type {NodeJS.Timeout | null} */
  #forceShutdownTimer = null;

  /** @type {boolean} */
  #isShuttingDown = false;

  /** @type {RestApiServer | null} */
  #restApi = null;

  /** @type {AppState} */
  #state = "idle";

  /**
   * Private constructor - use Application.create() instead
   */
  constructor() {
    this.#setupProcessHandlers();
  }

  /**
   * Creates and starts the application
   * @returns {Promise<Application>}
   */
  static async create() {
    const app = new Application();
    await app.start();
    return app;
  }

  /**
   * Starts the application
   * @returns {Promise<void>}
   */
  async start() {
    if (this.#state !== "idle") {
      throw new Error(`Cannot start application in ${this.#state} state`);
    }

    this.#state = "starting";
    logger.info(`[${APP_CONFIG.applicationName}] Starting application...`);

    try {
      // Initialize database
      this.#database = new DatabaseManager({ configs });

      // Initialize REST API
      this.#restApi = new RestApiServer({
        configs,
        database: this.#database,
      });

      // Initialize infrastructure (migrations, health checks, etc.)
      await this.#initInfrastructure();

      // Start REST API server
      await this.#restApi.start({
        ip: SERVER_CONFIG.ip,
        port: SERVER_CONFIG.port,
      });

      this.#state = "running";
      logger.info(`[${APP_CONFIG.applicationName}] Application running on ${SERVER_CONFIG.ip}:${SERVER_CONFIG.port}`);

      if (APP_CONFIG.env === "development") {
        logger.info(`[${APP_CONFIG.applicationName}] Documentation: ${APP_CONFIG.applicationUrl}/docs`);
      }
    } catch (error) {
      this.#state = "stopped";
      if (error instanceof Error) {
        logger.fatal({ error: error?.stack || error }, `[${APP_CONFIG.applicationName}] Failed to start application`);
      }

      throw error;
    }
  }

  /**
   * Gracefully stops the application
   * @returns {Promise<void>}
   */
  async stop() {
    // Prevent multiple shutdown attempts
    if (this.#isShuttingDown || this.#state === "stopped") {
      return;
    }

    this.#isShuttingDown = true;
    this.#state = "stopping";

    logger.info(`[${APP_CONFIG.applicationName}] Initiating graceful shutdown...`);

    // Set force shutdown timeout
    this.#forceShutdownTimer = setTimeout(() => {
      logger.warn(
        `[${APP_CONFIG.applicationName}] Shutdown timeout (${SERVER_CONFIG.shutdownTimeout}ms) exceeded, forcing exit`,
      );
      process.exit(1);
    }, SERVER_CONFIG.shutdownTimeout);

    try {
      // Stop infrastructure in reverse order of initialization
      await this.#stopInfrastructure();

      this.#state = "stopped";
      logger.info(`[${APP_CONFIG.applicationName}] Shutdown completed successfully`);

      this.#clearForceShutdown();
      process.exit(0);
    } catch (error) {
      if (error instanceof Error) {
        logger.error({ error: error?.stack || error }, `[${APP_CONFIG.applicationName}] Error during shutdown`);
      }

      this.#clearForceShutdown();
      process.exit(1);
    }
  }

  /**
   * Clears force shutdown timer
   */
  #clearForceShutdown() {
    if (this.#forceShutdownTimer) {
      clearTimeout(this.#forceShutdownTimer);
      this.#forceShutdownTimer = null;
    }
  }

  /**
   * Initializes application infrastructure
   * @returns {Promise<void>}
   */
  async #initInfrastructure() {
    logger.info(`[${APP_CONFIG.applicationName}] Initializing infrastructure...`);

    // Add infrastructure initialization here:
    // - Run database migrations
    // - Initialize caching layer
    // - Set up health check endpoints
    // - etc.

    logger.info(`[${APP_CONFIG.applicationName}] Infrastructure initialized`);
  }

  /**
   * Sets up process-level event handlers
   */
  #setupProcessHandlers() {
    // Handle shutdown signals
    for (const signal of Application.SHUTDOWN_SIGNALS) {
      process.once(signal, () => {
        logger.info(`[${APP_CONFIG.applicationName}] Received ${signal} signal`);
        this.stop().catch((error) => {
          logger.fatal({ error: error?.stack || error }, `[${APP_CONFIG.applicationName}] Error during signal handling`);
          process.exit(1);
        });
      });
    }

    // Handle uncaught exceptions
    process.once("uncaughtException", (error) => {
      logger.fatal(
        { error: error?.stack || error, type: "uncaughtException" },
        `[${APP_CONFIG.applicationName}] Uncaught exception`,
      );
      this.stop().catch(() => process.exit(1));
    });

    // Handle unhandled promise rejections
    process.once("unhandledRejection", (reason, promise) => {
      logger.fatal(
        {
          reason: reason instanceof Error ? reason.stack : String(reason),
          promise: String(promise),
          type: "unhandledRejection",
        },
        `[${APP_CONFIG.applicationName}] Unhandled rejection`,
      );
      this.stop().catch(() => process.exit(1));
    });

    // Log exit code
    process.once("exit", (code) => {
      const color = code === 0 ? "\u001B[32m" : "\u001B[31m"; // green or red
      // eslint-disable-next-line no-console
      console.log(`${color}[${APP_CONFIG.applicationName}] Process exiting with code: ${code}\u001B[0m`);
    });
  }

  /**
   * Stops all infrastructure components in reverse order
   * @returns {Promise<void>}
   */
  async #stopInfrastructure() {
    const errors = [];

    // Stop REST API server
    if (this.#restApi) {
      try {
        await this.#restApi.stop();
        logger.info(`[${APP_CONFIG.applicationName}] REST API stopped`);
      } catch (error) {
        errors.push({ component: "REST API", error });
        if (error instanceof Error) {
          logger.error({ error: error?.stack || error }, `[${APP_CONFIG.applicationName}] Failed to stop REST API`);
        }
      }
    }

    // Disconnect database
    if (this.#database?.isInitialized) {
      try {
        await this.#database.disconnect();
        logger.info(`[${APP_CONFIG.applicationName}] Database disconnected`);
      } catch (error) {
        errors.push({ component: "Database", error });
        if (error instanceof Error) {
          logger.error({ error: error?.stack || error }, `[${APP_CONFIG.applicationName}] Failed to disconnect database`);
        }
      }
    }

    // If there were errors, throw aggregate error
    if (errors.length > 0) {
      throw new Error(`Failed to stop ${errors.length} component(s): ${errors.map((e) => e.component).join(", ")}`);
    }
  }
}

// ============================================================================
// Bootstrap
// ============================================================================

/**
 * Application entry point
 */
try {
  await Application.create();
} catch (error) {
  if (error instanceof Error) {
    logger.fatal({ error: error?.stack || error }, `[${APP_CONFIG.applicationName}] Bootstrap failed`);
  }

  process.exit(1);
}
