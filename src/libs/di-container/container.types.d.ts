/** @file Core dependency injection container types */

import type { FastifyInstance } from "fastify";

import type { schema } from "#infra/database/db-schema.ts";
import type { JWTNamespace } from "#libs/auth/jwt.types.d.ts";

import type { Configs } from "#types/config.types.d.ts";

/**
 * Core dependencies - always available in container
 */
declare module "@fastify/awilix" {
  interface Cradle {
    app: FastifyInstance;
    configs: Configs;
    db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema>;
    jwtService: JWTNamespace;
    logger: import("pino").Logger;
  }
}
