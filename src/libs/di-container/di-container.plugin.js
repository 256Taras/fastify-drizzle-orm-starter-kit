import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { diContainer, fastifyAwilixPlugin } from "@fastify/awilix";
import * as awilix from "awilix";
import fp from "fastify-plugin";

import eventBusService from "#libs/events/event-bus.service.js";
import { logger } from "#libs/logging/logger.service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(__dirname, "../../");

const patterns = {
  // Auto-load: repository, queries, mutations, services for domain modules
  modules: "modules/**/*.{repository,queries,mutations,service}.js",
  // Libs services
  services: "libs/{encryption,session-storage,pagination}/**/*.service.js",
};

/**
 * Dynamically generate patterns for awilix to load modules
 *
 * @param {string} basePath
 * @param {object} subPaths
 */
const generateModulePatterns = (basePath, subPaths) =>
  Object.values(subPaths).map((pattern) => path.join(basePath, pattern));

/**
 * @type {import("@fastify/type-provider-typebox").FastifyPluginAsyncTypebox<
 *   import("#@types/index.jsdoc.js").PluginOptions
 * >}
 */
const diContainerPlugin = async (app, opts) => {
  diContainer.register({
    app: awilix.asValue(app),
    configs: awilix.asValue(opts.configs),
    db: awilix.asValue(opts.database.drizzle),
    eventBus: awilix.asFunction(eventBusService),
    jwtService: awilix.asValue(app.jwt),
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
