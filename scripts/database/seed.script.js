#!/usr/bin/env node

/**
 * @file Database seeding script Runs seed files to populate database with initial data Uses OOP approach with class-based
 *   structure
 */

import { readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { and, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { ENV_CONFIG } from "#configs/env.config.js";
import { logger } from "#libs/logging/logger.service.js";

import { seedTracking } from "./seed-tracking.model.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");

// ==================== Constants ====================

const SEED_TABLE_NAME = "__drizzle_seeds";
const DEFAULT_ENVIRONMENT = "development";
const SEED_FILE_EXTENSIONS = [".js", ".mjs"];

const ERROR_MESSAGES = {
  NO_DATABASE_URL: "DATABASE_URL is not set in environment variables",
  /**
   * @param {string} fileName
   * @returns {string}
   */
  NO_SEED_FUNCTION: (fileName) => `Seed file ${fileName} does not export a default function or named 'seed' function`,
};

const LOG_MESSAGES = {
  /**
   * @param {string} env
   * @returns {string}
   */
  SEEDING_START: (env) => `Starting database seeding for environment: ${env}`,
  /**
   * @param {string} env
   * @returns {string}
   */
  SEEDING_COMPLETE: (env) => `✓ Database seeding completed successfully for environment: ${env}`,
  /**
   * @param {string} fileName
   * @returns {string}
   */
  SEED_RUNNING: (fileName) => `Running seed file: ${fileName}`,
  /**
   * @param {string} fileName
   * @returns {string}
   */
  SEED_COMPLETE: (fileName) => `✓ Completed seed file: ${fileName}`,
  /**
   * @param {string} fileName
   * @returns {string}
   */
  SEED_SKIPPED: (fileName) => `⏭ Skipping seed file ${fileName} (already executed)`,
  /**
   * @param {string} fileName
   * @returns {string}
   */
  SEED_FAILED: (fileName) => `✗ Failed to run seed file ${fileName}:`,
  /**
   * @param {string} dir
   * @returns {string}
   */
  NO_SEEDS_FOUND: (dir) => `No seed files found in ${dir}`,
  /**
   * @param {string} dir
   * @returns {string}
   */
  SEEDS_DIR_NOT_EXIST: (dir) => `Seeds directory ${dir} does not exist. Skipping seeding.`,
};

// ==================== Database Seeder ====================

/** Database seeding script class Handles running database seed files with tracking mechanism */
class DatabaseSeeder {
  /** @type {import("postgres").Sql | null} */
  #client = null;

  /** @type {import("drizzle-orm/postgres-js").PostgresJsDatabase | null} */
  #db = null;

  /**
   * Closes database connection and cleans up resources
   *
   * @returns {Promise<void>}
   */
  async close() {
    if (this.#client) {
      await this.#client.end();
      this.#client = null;
      this.#db = null;
    }
  }

  /**
   * Runs database seeding
   *
   * @param {string} environment - Environment name
   * @returns {Promise<void>}
   */
  async run(environment) {
    this.#logSeedingStart(environment);

    await this.#ensureSeedTrackingTable();
    const seedFiles = await this.#collectSeedFiles(environment);
    await this.#executeSeedFiles(seedFiles, environment);

    this.#logSeedingComplete(environment);
  }

  /**
   * Builds the full path to a seed file
   *
   * @param {string} fileName - Name of the seed file
   * @param {string} environment - Environment name
   * @returns {string}
   */
  #buildSeedFilePath(fileName, environment) {
    return join(this.#buildSeedsPath(environment), fileName);
  }

  /**
   * Builds the path to seeds directory for environment
   *
   * @param {string} environment - Environment name
   * @returns {string}
   */
  #buildSeedsPath(environment) {
    return join(rootDir, "infra/database/seeds", environment);
  }

  /**
   * Collects all seed files for the environment
   *
   * @param {string} environment - Environment name
   * @returns {Promise<string[]>}
   */
  async #collectSeedFiles(environment) {
    const seedsDir = this.#buildSeedsPath(environment);
    return this.#getSeedFilesFromDirectory(seedsDir);
  }

  /**
   * Ensures seed tracking table exists
   *
   * @returns {Promise<void>}
   */
  async #ensureSeedTrackingTable() {
    const db = await this.#getDatabase();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ${sql.identifier(SEED_TABLE_NAME)} (
        "file_name" varchar(255) PRIMARY KEY NOT NULL,
        "environment" varchar(50) NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `);
  }

  /**
   * Executes a single seed file if not already executed
   *
   * @param {string} filePath - Full path to the seed file
   * @param {string} fileName - Name of the seed file
   * @param {string} environment - Environment name
   * @returns {Promise<void>}
   */
  async #executeSeedFile(filePath, fileName, environment) {
    if (await this.#isSeedExecuted(fileName, environment)) {
      logger.info(LOG_MESSAGES.SEED_SKIPPED(fileName));
      return;
    }

    logger.info(LOG_MESSAGES.SEED_RUNNING(fileName));

    const seedFunction = await this.#loadSeedFunction(filePath, fileName);
    await this.#runSeedFunction(seedFunction);
    await this.#markSeedAsExecuted(fileName, environment);

    logger.info(LOG_MESSAGES.SEED_COMPLETE(fileName));
  }

  /**
   * Executes all seed files in order
   *
   * @param {string[]} seedFiles - Array of seed file names
   * @param {string} environment - Environment name
   * @returns {Promise<void>}
   */
  async #executeSeedFiles(seedFiles, environment) {
    for (const fileName of seedFiles) {
      await this.#processSeedFile(fileName, environment);
    }
  }

  /**
   * Filters files to include only seed files
   *
   * @param {string[]} files - Array of file names
   * @returns {string[]}
   */
  #filterSeedFiles(files) {
    return files.filter((file) => SEED_FILE_EXTENSIONS.some((ext) => file.endsWith(ext)));
  }

  /**
   * Gets the database connection (lazy initialization)
   *
   * @returns {Promise<import("drizzle-orm/postgres-js").PostgresJsDatabase>}
   */
  async #getDatabase() {
    if (this.#db) {
      return this.#db;
    }

    return this.#initializeDatabase();
  }

  /**
   * Gets database URL from config
   *
   * @returns {string}
   */
  #getDatabaseUrl() {
    const databaseUrl = ENV_CONFIG.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error(ERROR_MESSAGES.NO_DATABASE_URL);
    }

    return databaseUrl;
  }

  /**
   * Gets all seed files from the specified directory
   *
   * @param {string} seedsDir - Directory containing seed files
   * @returns {Promise<string[]>}
   */
  async #getSeedFilesFromDirectory(seedsDir) {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- seedsDir is validated and safe
      const files = await readdir(seedsDir);
      const seedFiles = this.#filterSeedFiles(files);

      if (seedFiles.length === 0) {
        logger.warn(LOG_MESSAGES.NO_SEEDS_FOUND(seedsDir));
      }

      return seedFiles.sort();
    } catch (error) {
      return this.#handleMissingDirectory(error instanceof Error ? error : new Error(String(error)), seedsDir);
    }
  }

  /**
   * Handles missing directory error
   *
   * @param {Error} error - Error object
   * @param {string} seedsDir - Directory path
   * @returns {string[]}
   */
  #handleMissingDirectory(error, seedsDir) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      logger.warn(LOG_MESSAGES.SEEDS_DIR_NOT_EXIST(seedsDir));
      return [];
    }
    throw error;
  }

  /**
   * Initializes database connection
   *
   * @returns {import("drizzle-orm/postgres-js").PostgresJsDatabase}
   */
  #initializeDatabase() {
    const databaseUrl = this.#getDatabaseUrl();

    this.#client = postgres(databaseUrl, { max: 1 });
    this.#db = drizzle(this.#client);

    return this.#db;
  }

  /**
   * Checks if seed file has already been executed
   *
   * @param {string} fileName - Name of the seed file
   * @param {string} environment - Environment name
   * @returns {Promise<boolean>}
   */
  async #isSeedExecuted(fileName, environment) {
    const db = await this.#getDatabase();
    const result = await db
      .select()
      .from(seedTracking)
      .where(and(eq(seedTracking.fileName, fileName), eq(seedTracking.environment, environment)))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Loads and validates seed function from file
   *
   * @param {string} filePath - Full path to the seed file
   * @param {string} fileName - Name of the seed file
   * @returns {Promise<Function>}
   */
  async #loadSeedFunction(filePath, fileName) {
    const seedModule = await import(`file://${filePath}`);
    const seedFunction = seedModule.default || seedModule.seed;

    if (typeof seedFunction !== "function") {
      throw new TypeError(ERROR_MESSAGES.NO_SEED_FUNCTION(fileName));
    }

    return seedFunction;
  }

  /**
   * Logs seeding complete message
   *
   * @param {string} environment - Environment name
   */
  #logSeedingComplete(environment) {
    logger.info(LOG_MESSAGES.SEEDING_COMPLETE(environment));
  }

  /**
   * Logs seeding start message
   *
   * @param {string} environment - Environment name
   */
  #logSeedingStart(environment) {
    logger.info(LOG_MESSAGES.SEEDING_START(environment));
  }

  /**
   * Marks seed file as executed
   *
   * @param {string} fileName - Name of the seed file
   * @param {string} environment - Environment name
   * @returns {Promise<void>}
   */
  async #markSeedAsExecuted(fileName, environment) {
    const db = await this.#getDatabase();
    await db.insert(seedTracking).values({ fileName, environment });
  }

  /**
   * Processes a single seed file
   *
   * @param {string} fileName - Name of the seed file
   * @param {string} environment - Environment name
   * @returns {Promise<void>}
   */
  async #processSeedFile(fileName, environment) {
    const filePath = this.#buildSeedFilePath(fileName, environment);

    try {
      await this.#executeSeedFile(filePath, fileName, environment);
    } catch (error) {
      logger.error(LOG_MESSAGES.SEED_FAILED(fileName), error);
      throw error;
    }
  }

  /**
   * Runs the seed function with database and logger
   *
   * @param {Function} seedFunction - Seed function to execute
   * @returns {Promise<void>}
   */
  async #runSeedFunction(seedFunction) {
    const db = await this.#getDatabase();
    await seedFunction(db, logger);
  }
}

// ==================== Main Execution ====================

const environment = process.argv[2] || DEFAULT_ENVIRONMENT;
const seeder = new DatabaseSeeder();

try {
  await seeder.run(environment);
  await seeder.close();
  logger.info("Seeding process completed");
  process.exit(0);
} catch (error) {
  logger.error("Seeding process failed:", error);
  await seeder.close();
  process.exit(1);
}
