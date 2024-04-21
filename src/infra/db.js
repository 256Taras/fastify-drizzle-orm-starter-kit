// eslint-disable-next-line node/file-extension-in-import
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export class DatabaseManager {
  /** @type {import('drizzle-orm/postgres-js').PostgresJsDatabase} */
  drizzle;

  /** @type {import('postgres').Sql} */
  postgres;

  isInitialized = false;

  constructor({ configs = {} }) {
    // @ts-ignore
    this.databaseUrl = configs?.DB_CONFIG?.databaseUrl;
    this.postgres = postgres(this.databaseUrl);
    this.drizzle = drizzle(this.postgres, { logger: true });
    this.isInitialized = true;
    Object.freeze(this);
  }

  async disconnect() {
    if (this.isInitialized) await this.postgres.end();
  }
}
