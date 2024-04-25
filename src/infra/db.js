// eslint-disable-next-line node/file-extension-in-import
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { databaseLogger, logger } from "#libs/services/logger.service.js";

export class DatabaseManager {
  /** @type {import('drizzle-orm/postgres-js').PostgresJsDatabase} */
  drizzle;

  /** @type {import('postgres').Sql} */
  postgres;

  isInitialized = false;

  /**
   * Initializes a new instance of the DatabaseManager.
   * @param {{configs: import("#@types/common").Configs}} configs - The configuration object.
   */
  constructor({ configs }) {
    const { DB_CONFIG, APP_CONFIG } = configs;
    this.databaseUrl = DB_CONFIG?.databaseUrl;

    this.postgres = postgres(this.databaseUrl, {
      idle_timeout: DB_CONFIG.timeout,
      onnotice: this.handleNotice,
      onclose: this.handleClose,
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
   * Performs a simple database query to test the connection.
   */
  async testConnection() {
    try {
      await this.postgres`SELECT 1`;
    } catch (error) {
      // @ts-ignore
      throw new Error("Failed to connect to the database.");
    }
  }

  /**
   * Handles PostgreSQL notices by logging them and optionally throwing an error for severe notices.
   * @param {object} notice - The notice object from PostgreSQL.
   */
  handleNotice(notice) {
    logger.error("Database notice:", notice);
    if (notice.severity === "ERROR" || notice.severity === "FATAL") {
      throw new Error(`Database error: ${notice.message}`);
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
   * Disconnects the database connection if initialized.
   */
  async disconnect() {
    if (this.isInitialized) {
      await this.postgres.end();
    }
  }
}
