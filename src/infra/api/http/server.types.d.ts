import type { FastifyInstance } from "fastify";

import type { DatabaseManager } from "#infra/database/db.ts";
import type { Configs } from "#types/config.types.d.ts";

export interface PluginOptions {
  app: FastifyInstance;
  configs: Configs;
  database: DatabaseManager;
}

export interface ServerOptions {
  configs: Configs;
  database: DatabaseManager;
}
