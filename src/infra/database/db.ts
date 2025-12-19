import { setTimeout } from "node:timers/promises";

import { drizzle } from "drizzle-orm/postgres-js";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { Sql } from "postgres";

import { isAbortError } from "#libs/errors/lifecycle.errors.ts";
import { databaseLogger, logger } from "#libs/logging/logger.service.ts";
import type { Configs } from "#types/config.types.d.ts";

type DatabaseManagerOptions = {
  configs: Configs;
};

type InitializeOptions = {
  initialDelay?: number;
  maxRetries?: number;
  signal?: AbortSignal;
};

export class DatabaseManager {
  drizzle: PostgresJsDatabase<typeof import("./db-schema.ts").schema>;

  isInitialized = false;

  postgres: Sql;

  constructor({ configs }: DatabaseManagerOptions) {
    const { APP_CONFIG, DB_CONFIG } = configs;

    this.postgres = postgres(DB_CONFIG.databaseUrl, {
      idle_timeout: DB_CONFIG.timeout,
      onclose: (connId) => logger.info(`Connection ${connId} closed unexpectedly.`),
      onnotice: (notice) => this.#handleNotice(notice),
    });

    this.drizzle = drizzle(this.postgres, {
      logger: APP_CONFIG?.isEnabledDbLogging ? databaseLogger : false,
    });
  }

  async disconnect(): Promise<void> {
    if (!this.isInitialized) return;
    await this.postgres.end();
  }

  async initialize(options: InitializeOptions = {}): Promise<DatabaseManager> {
    if (this.isInitialized) return this;

    const { maxRetries = 5, initialDelay = 1000, signal } = options;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      signal?.throwIfAborted();

      const connected = await this.#tryConnect();
      if (connected) {
        logger.info("Database connection established.");
        this.isInitialized = true;
        return this;
      }

      if (attempt === maxRetries) break;

      const delayMs = initialDelay * Math.pow(2, attempt - 1);
      logger.warn(`Connection attempt ${attempt}/${maxRetries} failed. Retrying in ${delayMs}ms...`);
      await setTimeout(delayMs, undefined, { signal });
    }

    throw new Error(`Database initialization failed after ${maxRetries} attempts`);
  }

  #handleNotice(notice: { message?: string; severity?: string }): void {
    const isCritical = notice.severity === "ERROR" || notice.severity === "FATAL";

    if (isCritical) {
      logger.error("Database notice:", notice);
      throw new Error(`Database error: ${notice.message || "Unknown database error"}`);
    }

    logger.warn("Database notice:", notice);
  }

  async #tryConnect(): Promise<boolean> {
    try {
      await this.postgres`SELECT 1`;
      return true;
    } catch (error) {
      if (isAbortError(error)) throw error;

      logger.error({ error }, "Database connection failed");
      return false;
    }
  }
}
