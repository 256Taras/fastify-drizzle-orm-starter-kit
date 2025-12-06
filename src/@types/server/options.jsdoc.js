/**
 * @file
 * Server options types
 */

import { DatabaseManager } from "#infra/database/db.js";

/**
 * Options for RestApiServer constructor
 * Contains all configurations and database manager instance
 * @typedef {object} RestApiServerOptions
 * @property {import("../config/common.jsdoc.js").Configs} configs - All application configurations
 * @property {DatabaseManager} database - Database manager instance with drizzle and postgres connections
 */

/**
 * Configuration object for Fastify plugins
 * This is the same structure as RestApiServerOptions but used for plugin options
 * The database property is passed as-is from DatabaseManager, which has a drizzle property
 * @typedef {object} FastifyGlobalOptionConfig
 * @property {import('fastify').FastifyInstance} app - Fastify instance (not used in options, but kept for compatibility)
 * @property {import("../config/common.jsdoc.js").Configs} configs - All application configurations
 * @property {DatabaseManager} database - Database manager instance (plugins access database.drizzle)
 */

export {};

