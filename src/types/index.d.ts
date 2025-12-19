/** @file Global type exports */

import type { IncomingMessage, ServerResponse } from "node:http";

import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import type { FastifyBaseLogger, FastifyInstance, RawServerDefault } from "fastify";

// Config types
export type { Configs, Env } from "./config.types.d.ts";

// Server types
export type { PluginOptions, ServerOptions } from "#infra/api/http/server.types.d.ts";

// FastifyInstance with TypeBox type provider
export type FastifyTypeboxInstance = FastifyInstance<
  RawServerDefault,
  IncomingMessage,
  ServerResponse,
  FastifyBaseLogger,
  TypeBoxTypeProvider
>;
