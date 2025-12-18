import * as configs from "#configs/index.ts";
import { APP_CONFIG, SERVER_CONFIG } from "#configs/index.ts";
import { RestApiServer } from "#infra/api/http/fastify-server.ts";
import { DatabaseManager } from "#infra/database/db.ts";
import { AbortError, isAbortError, isTimeoutError, TimeoutError } from "#libs/errors/lifecycle.errors.ts";
import { logger } from "#libs/logging/logger.service.ts";

const AppState = {
  IDLE: "idle",
  RUNNING: "running",
  STARTING: "starting",
  STOPPED: "stopped",
  STOPPING: "stopping",
} as const;

type AppStateValue = (typeof AppState)[keyof typeof AppState];

class Application {
  static readonly SHUTDOWN_SIGNALS = ["SIGTERM", "SIGINT", "SIGHUP"] as const;

  #abortController = new AbortController();

  #database?: DatabaseManager;

  #restApi?: RestApiServer;

  #shutdownTimeoutId?: NodeJS.Timeout;

  #state: AppStateValue = AppState.IDLE;

  constructor() {
    this.#registerProcessHandlers();
  }

  static async create(): Promise<Application> {
    const app = new Application();
    await app.#start();
    return app;
  }

  #createTimeoutPromise(ms: number): Promise<never> {
    const { promise, reject } = Promise.withResolvers<never>();
    this.#shutdownTimeoutId = setTimeout(() => reject(new TimeoutError()), ms);
    return promise;
  }

  #registerProcessHandlers(): void {
    for (const signal of Application.SHUTDOWN_SIGNALS) {
      process.once(signal, () => {
        logger.info(`[${APP_CONFIG.applicationName}] Received ${signal}`);
        this.#stop().catch(() => process.exit(1));
      });
    }

    process.once("uncaughtException", (error) => {
      logger.fatal({ error: error.stack, type: "uncaughtException" }, `[${APP_CONFIG.applicationName}] Uncaught exception`);
      this.#stop().catch(() => process.exit(1));
    });

    process.once("unhandledRejection", (reason) => {
      const message = reason instanceof Error ? reason.stack : String(reason);
      logger.fatal({ reason: message, type: "unhandledRejection" }, `[${APP_CONFIG.applicationName}] Unhandled rejection`);
      this.#stop().catch(() => process.exit(1));
    });

    process.once("exit", (code) => {
      const color = code === 0 ? "\u001B[32m" : "\u001B[31m";
      // eslint-disable-next-line no-console
      console.log(`${color}[${APP_CONFIG.applicationName}] Exiting with code: ${code}\u001B[0m`);
    });
  }

  async #shutdown(): Promise<void> {
    const errors: string[] = [];

    if (this.#restApi) {
      try {
        await this.#restApi.stop();
        logger.info(`[${APP_CONFIG.applicationName}] REST API stopped`);
      } catch (error) {
        logger.error({ error }, `[${APP_CONFIG.applicationName}] Failed to stop REST API`);
        errors.push("REST API");
      }
    }

    if (this.#database?.isInitialized) {
      try {
        await this.#database.disconnect();
        logger.info(`[${APP_CONFIG.applicationName}] Database disconnected`);
      } catch (error) {
        logger.error({ error }, `[${APP_CONFIG.applicationName}] Failed to disconnect database`);
        errors.push("Database");
      }
    }

    if (errors.length > 0) {
      throw new Error(`Failed to stop: ${errors.join(", ")}`);
    }
  }

  async #start(): Promise<void> {
    if (this.#state !== AppState.IDLE) {
      throw new Error(`Cannot start in ${this.#state} state`);
    }

    this.#state = AppState.STARTING;
    const { signal } = this.#abortController;

    logger.info(`[${APP_CONFIG.applicationName}] Starting...`);

    this.#database = new DatabaseManager({ configs });
    await this.#database.initialize({ signal });
    signal.throwIfAborted();

    this.#restApi = new RestApiServer({ configs, database: this.#database });
    await this.#restApi.start({ ip: SERVER_CONFIG.ip, port: SERVER_CONFIG.port });

    this.#state = AppState.RUNNING;

    logger.info(`[${APP_CONFIG.applicationName}] Running on ${SERVER_CONFIG.ip}:${SERVER_CONFIG.port}`);
    if (APP_CONFIG.isDev) {
      logger.info(`[${APP_CONFIG.applicationName}] Docs: ${APP_CONFIG.applicationUrl}/docs`);
    }
  }

  async #stop(): Promise<void> {
    const alreadyStopping = this.#state === AppState.STOPPED || this.#state === AppState.STOPPING;
    if (alreadyStopping) return;

    this.#state = AppState.STOPPING;
    logger.info(`[${APP_CONFIG.applicationName}] Shutting down...`);
    this.#abortController.abort(new AbortError("Shutdown"));

    const shutdownPromise = this.#shutdown();
    const timeoutPromise = this.#createTimeoutPromise(SERVER_CONFIG.shutdownTimeout);

    try {
      await Promise.race([shutdownPromise, timeoutPromise]);
      this.#state = AppState.STOPPED;
      logger.info(`[${APP_CONFIG.applicationName}] Shutdown complete`);
      process.exit(0);
    } catch (error) {
      if (isTimeoutError(error)) {
        logger.warn(`[${APP_CONFIG.applicationName}] Shutdown timeout, forcing exit`);
      } else {
        logger.error({ error }, `[${APP_CONFIG.applicationName}] Shutdown error`);
      }
      process.exit(1);
    } finally {
      clearTimeout(this.#shutdownTimeoutId);
    }
  }
}

try {
  await Application.create();
} catch (error) {
  if (isAbortError(error)) {
    logger.info(`[${APP_CONFIG.applicationName}] Startup cancelled`);
    process.exit(0);
  }

  logger.fatal({ error }, `[${APP_CONFIG.applicationName}] Bootstrap failed`);
  process.exit(1);
}
