import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { diContainer, fastifyAwilixPlugin } from "@fastify/awilix";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import * as awilix from "awilix";
import fp from "fastify-plugin";

import type { JWTNamespace } from "#libs/auth/jwt.types.d.ts";
import eventBusService from "#libs/events/event-bus.service.ts";
import { registerEventHandlers } from "#libs/events/register-event-handlers.ts";
import { logger } from "#libs/logging/logger.service.ts";

import type { PluginOptions } from "#types/index.d.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(__dirname, "../../");

const patterns = {
  modules: "modules/**/*.{repository,queries,mutations,service}.ts",
  services: "libs/{encryption,session-storage,pagination,persistence}/**/*.service.ts",
};

/**
 * Dynamically generate patterns for awilix to load modules
 */
const generateModulePatterns = (basePath: string, subPaths: Record<string, string>): string[] =>
  Object.values(subPaths).map((pattern) => path.join(basePath, pattern));

const diContainerPlugin: FastifyPluginAsyncTypebox<PluginOptions> = async (app, opts) => {
  diContainer.register({
    app: awilix.asValue(app),
    configs: awilix.asValue(opts.configs),
    db: awilix.asValue(opts.database.drizzle),
    eventBus: awilix.asFunction(eventBusService),
    jwtService: awilix.asValue(app.jwt as unknown as JWTNamespace),
    logger: awilix.asValue(logger),
  });

  const modulesToLoad = generateModulePatterns(basePath, patterns);

  await diContainer.loadModules(modulesToLoad, {
    cwd: __dirname,
    esModules: true,
    formatName: "camelCase",
    resolverOptions: {
      injectionMode: awilix.InjectionMode.PROXY,
      lifetime: awilix.Lifetime.SINGLETON,
      register: awilix.asFunction,
    },
  });

  await registerEventHandlers(diContainer.cradle);

  app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: false,
  });
};

export default fp(diContainerPlugin, { name: "di-container" });
