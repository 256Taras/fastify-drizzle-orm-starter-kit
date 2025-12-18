import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { diContainer, fastifyAwilixPlugin } from "@fastify/awilix";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import * as awilix from "awilix";
import fp from "fastify-plugin";

import eventBusService from "#libs/events/event-bus.service.ts";
import { logger } from "#libs/logging/logger.service.ts";

import type { PluginOptions } from "#types/index.d.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(__dirname, "../../");

const patterns = {
  // Auto-load: repository, queries, mutations, services for domain modules
  modules: "modules/**/*.{repository,queries,mutations,service}.ts",
  // Libs services
  services: "libs/{encryption,session-storage,pagination}/**/*.service.ts",
};

/**
 * Dynamically generate patterns for awilix to load modules
 */
const generateModulePatterns = (basePath: string, subPaths: Record<string, string>): string[] =>
  Object.values(subPaths).map((pattern) => path.join(basePath, pattern));

const diContainerPlugin: FastifyPluginAsyncTypebox<PluginOptions> = async (app, opts) => {
  diContainer.register({
    // Type assertion: app and jwt will be extended with additional properties by plugins

    app: awilix.asValue(app as any),
    configs: awilix.asValue(opts.configs),
    db: awilix.asValue(opts.database.drizzle),
    eventBus: awilix.asFunction(eventBusService),

    jwtService: awilix.asValue(app.jwt as any),
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

  app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: false,
  });
};

export default fp(diContainerPlugin, { name: "di-container" });
