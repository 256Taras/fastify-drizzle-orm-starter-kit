export type { Configs, Env } from "./config.types.d.ts";

export type { FastifyPluginAsyncTypebox as FastifyPluginTypebox } from "@fastify/type-provider-typebox";

// Re-export server types
export type { FastifyGlobalOptionConfig, RestApiServerOptions } from "#infra/api/http/server.types.d.ts";
// Alias types for backward compatibility
export type { RestApiServerOptions as ServerOptions } from "#infra/api/http/server.types.d.ts";

export type { FastifyGlobalOptionConfig as PluginOptions } from "#infra/api/http/server.types.d.ts";
// Re-export Fastify types for convenience
export type { FastifyInstance, FastifyPluginAsync } from "fastify";
