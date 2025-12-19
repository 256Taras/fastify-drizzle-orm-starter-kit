/** @file Server and plugin options types */

import type { FastifyInstance } from "fastify";

import type { DatabaseManager } from "#infra/database/db.ts";

import type { Configs } from "#types/config.types.d.ts";

/**
 * Plugin options passed to Fastify plugins
 */
export interface PluginOptions {
  app: FastifyInstance;
  configs: Configs;
  database: DatabaseManager;
}

/**
 * Server options for RestApiServer constructor
 */
export interface ServerOptions {
  configs: Configs;
  database: DatabaseManager;
}
