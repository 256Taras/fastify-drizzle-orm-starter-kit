import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { databaseLogger, logger } from "#libs/logging/logger.service.js";

export class DatabaseManager {
  /** @type {import('drizzle-orm/postgres-js').PostgresJsDatabase} */
  drizzle;

  isInitialized = false;

  /** @type {import('postgres').Sql} */
  postgres;

  /**
   * Initializes a new instance of the DatabaseManager.
   * @param {{configs: import("#@types/index.jsdoc.js").Configs}} configs - The configuration object.
   */
  constructor({ configs }) {
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

    // @ts-ignore
    return this.testConnection()
      .then(() => {
        logger.info("Database connection established successfully.");
        this.isInitialized = true;
        Object.freeze(this);
        return this;
      })
      .catch((error) => {
        logger.error(error.message);
        return this;
      });
  }

  /**
   * Disconnects the database connection if initialized.
   */
  async disconnect() {
    if (this.isInitialized) {
      await this.postgres.end();
    }
  }

  /**
   * Handles unexpected connection closures by logging and throwing an error.
   * @param {number} connId - The connection ID that was unexpectedly closed.
   */
  handleClose(connId) {
    logger.info(`Connection ${connId} closed unexpectedly.`);
  }

  /**
   * Handles PostgreSQL notices by logging them and optionally throwing an error for severe notices.
   * @param {object} notice - The notice object from PostgreSQL.
   */
  handleNotice(notice) {
    if (notice.severity === "ERROR" || notice.severity === "FATAL") {
      logger.error("Database notice:", notice);
      throw new Error(`Database error: ${notice.message || "Unknown database error"}`);
    } else {
      logger.warn("Database notice:", notice);
    }
  }

  /**
   * Performs a simple database query to test the connection.
   */
  async testConnection() {
    try {
      await this.postgres`SELECT 1`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Database connection failed: ${errorMessage}`);
      throw new Error(`Failed to connect to the database: ${errorMessage}`);
    }
  }
}
