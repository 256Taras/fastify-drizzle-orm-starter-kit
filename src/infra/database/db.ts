import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Sql } from "postgres";

import { databaseLogger, logger } from "#libs/logging/logger.service.ts";

import type { Configs } from "#types/config.types.d.ts";

type DatabaseManagerOptions = {
  configs: Configs;
};

type InitializeOptions = {
  initialDelay?: number;
  maxRetries?: number;
};

export class DatabaseManager {
  databaseUrl?: string;

  drizzle: PostgresJsDatabase<typeof import("./db-schema.ts").schema>;

  isInitialized = false;

  postgres: Sql;

  /**
   * Initializes a new instance of the DatabaseManager.
   */
  constructor({ configs }: DatabaseManagerOptions) {
    const { APP_CONFIG, DB_CONFIG } = configs;
    this.databaseUrl = DB_CONFIG?.databaseUrl;

    this.postgres = postgres(this.databaseUrl, {
      idle_timeout: DB_CONFIG.timeout,
      onclose: this.handleClose,
      onnotice: this.handleNotice,
    });

    this.drizzle = drizzle(this.postgres, {
      logger: APP_CONFIG?.isEnabledDbLogging ? databaseLogger : false,
    });
  }

  /** Disconnects the database connection if initialized. */
  async disconnect(): Promise<void> {
    if (this.isInitialized) {
      await this.postgres.end();
    }
  }

  /**
   * Handles unexpected connection closures by logging and throwing an error.
   */
  handleClose = (connId: number): void => {
    logger.info(`Connection ${connId} closed unexpectedly.`);
  };

  /**
   * Handles PostgreSQL notices by logging them and optionally throwing an error for severe notices.
   */
  handleNotice = (notice: { message?: string; severity?: string }): void => {
    if (notice.severity === "ERROR" || notice.severity === "FATAL") {
      logger.error("Database notice:", notice);
      throw new Error(`Database error: ${notice.message || "Unknown database error"}`);
    } else {
      logger.warn("Database notice:", notice);
    }
  };

  /**
   * Initializes database connection asynchronously with retry logic
   */
  async initialize(options: InitializeOptions = {}): Promise<DatabaseManager> {
    if (this.isInitialized) {
      return this;
    }

    const maxRetries = options.maxRetries ?? 5;
    const initialDelay = options.initialDelay ?? 1000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await this.testConnection();
        logger.info("Database connection established successfully.");
        this.isInitialized = true;
        Object.freeze(this);
        return this;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isLastAttempt = attempt === maxRetries - 1;

        if (isLastAttempt) {
          logger.error(`Database initialization failed after ${maxRetries} attempts: ${errorMessage}`);
          throw error;
        }

        const delay = initialDelay * Math.pow(2, attempt);
        logger.warn(`Database connection attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error("Database initialization failed: unexpected error");
  }

  /** Performs a simple database query to test the connection. */
  async testConnection(): Promise<void> {
    try {
      await this.postgres`SELECT 1`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Database connection failed: ${errorMessage}`);
      throw new Error(`Failed to connect to the database: ${errorMessage}`);
    }
  }
}
