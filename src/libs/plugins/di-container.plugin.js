import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { diContainer, fastifyAwilixPlugin } from "@fastify/awilix";
import * as awilix from "awilix";
import fp from "fastify-plugin";

import { logger } from "#libs/services/logger.service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const basePath = path.resolve(__dirname, "../../");

const patterns = {
  services: "libs/services/**/*.{service,service.js}",
  modules: "modules/**/*.{service,repository,use-case}.{js,ts}",
};

/**
 * Dynamically generate patterns for awilix to load modules
 * @param {string} basePath
 * @param {object} subPaths
 */
const generateModulePatterns = (basePath, subPaths) =>
  Object.values(subPaths).map((pattern) => path.join(basePath, pattern));

/** @type {import("@fastify/type-provider-typebox").FastifyPluginAsyncTypebox<import("#@types/fastify.js").FastifyGlobalOptionConfig> } */
const diContainerPlugin = async (app, opts) => {
  diContainer.register({
    app: awilix.asValue(app),
    configs: awilix.asValue(opts.configs),
    logger: awilix.asValue(logger),
    db: awilix.asValue(opts.database.drizzle),
    // @ts-ignore
    jwtService: awilix.asValue(app.jwt),
  });

  const modulesToLoad = generateModulePatterns(basePath, patterns);

  await diContainer.loadModules(modulesToLoad, {
    cwd: __dirname,
    resolverOptions: {
      lifetime: awilix.Lifetime.SINGLETON,
      injectionMode: awilix.InjectionMode.PROXY,
      register: awilix.asFunction,
    },
    formatName: "camelCase",
    esModules: true,
  });

  app.register(fastifyAwilixPlugin, {
    disposeOnClose: true,
    disposeOnResponse: false,
  });
};

export default fp(diContainerPlugin, { name: "di-container" });
