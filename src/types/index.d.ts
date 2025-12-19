import type { IncomingMessage, ServerResponse } from "node:http";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify";

export type { Configs, Env } from "./config.types.d.ts";

// FastifyInstance with TypeBox type provider for automatic type inference
export type FastifyTypeboxInstance = FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;

// Re-export server types
export type { FastifyGlobalOptionConfig, RestApiServerOptions } from "#infra/api/http/server.types.d.ts";
// Alias types for backward compatibility
export type { RestApiServerOptions as ServerOptions } from "#infra/api/http/server.types.d.ts";

export type { FastifyGlobalOptionConfig as PluginOptions } from "#infra/api/http/server.types.d.ts";

// Re-export Fastify types for convenience
export type { FastifyInstance, FastifyPluginAsync } from "fastify";
