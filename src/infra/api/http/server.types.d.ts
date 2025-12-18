/** @file Server options types */

import type { FastifyInstance } from "fastify";

import type { DatabaseManager } from "#infra/database/db.ts";

import type { Configs } from "#types/config.types.d.ts";

/**
 * Configuration object for Fastify plugins
 * This is the same structure as RestApiServerOptions but used for plugin options
 * The database property is passed as-is from DatabaseManager, which has a drizzle property
 */
export interface FastifyGlobalOptionConfig {
  /** Fastify instance (not used in options, but kept for compatibility) */
  app: FastifyInstance;
  /** All application configurations */
  configs: Configs;
  /** Database manager instance (plugins access database.drizzle) */
  database: DatabaseManager;
}

/**
 * Options for RestApiServer constructor
 * Contains all configurations and database manager instance
 */
export interface RestApiServerOptions {
  /** All application configurations */
  configs: Configs;
  /** Database manager instance with drizzle and postgres connections */
  database: DatabaseManager;
}
