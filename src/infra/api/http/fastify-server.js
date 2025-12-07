//@ts-nocheck
import path from "node:path";

// Import necessary Fastify core and plugins.
import fastifyAutoLoad from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import fastifyFormBody from "@fastify/formbody";
import fastifyHelmet from "@fastify/helmet";
import fastifyMultipart from "@fastify/multipart";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyRequestContextPlugin from "@fastify/request-context";
import fastifyStatic from "@fastify/static";
import fastifySwaggerPlugin from "@fastify/swagger";
import fastifySwaggerUiPlugin from "@fastify/swagger-ui";
import Fastify from "fastify";
// eslint-disable-next-line import/order
import fastifyAuth from "@fastify/auth";

// Import custom modules and configurations.

import { FASTIFY_CORS_CONFIG } from "#configs/index.js";
import { globalHttpFastify404ErrorHandler, globalHttpFastifyErrorHandler } from "#infra/api/http/fastify-error-handler.js";
import defaultLogger, { logger } from "#libs/logging/logger.service.js";
import { paginationPlugin } from "#libs/pagination/index.js";
import { getDirName } from "#libs/utils/files.js";
import sharedHealthCheckRouter from "#modules/health-check/router.js";

export class RestApiServer {
  /** @type {import("#@types/index.jsdoc.js").Configs} */
  #configs;

  /** @type {import('@fastify/type-provider-typebox').FastifyInstanceTypebox} */
  #fastify;

  /** @type {import("#@types/index.jsdoc.js").ServerOptions} */
  #options;

  /**
   * Creates a new instance of RestApiServer
   * @param {import("#@types/index.jsdoc.js").ServerOptions} options - Server options containing configs and database
   */
  constructor(options = {}) {
    this.#configs = options.configs;
    this.#options = options;
    this.#fastify = Fastify(this.#configs.FASTIFY_CONFIG).withTypeProvider();
    Object.freeze(this);
  }

  /**
   * Builds and configures the Fastify server application
   * Registers all plugins, error handlers, and routes
   * @returns {Promise<void>}
   */
  async buildServerApp() {
    // Error handlers to handle 404 and other HTTP errors.
    this.#fastify.setErrorHandler(globalHttpFastifyErrorHandler);
    this.#fastify.setNotFoundHandler(globalHttpFastify404ErrorHandler);
    // Authentication plugin. Provides support for various authentication methods.
    this.#fastify.register(fastifyAuth);
    // Swagger plugin for API documentation.
    this.#fastify.register(fastifySwaggerPlugin, this.#configs.OPENAPI_CONFIG);
    this.#fastify.register(fastifySwaggerUiPlugin, this.#configs.OPENAPI_CONFIG);
    // RequestContext plugin provides context storage across async operations during request/response lifecycle.
    this.#fastify.register(fastifyRequestContextPlugin, { defaultStoreValues: { logger: defaultLogger } });
    // Register pagination plugin explicitly before autoload to ensure it's available for all routes
    this.#fastify.register(paginationPlugin);
    // Autoload plugin to load custom plugins from a directory.
    this.#autoLoadPlugins();
    // RateLimit plugin for limiting request rates.
    this.#fastify.register(fastifyRateLimit, this.#configs.FASTIFY_RATE_LIMIT_CONFIG);
    // Helmet plugin for securing the app with important HTTP headers.
    this.#fastify.register(fastifyHelmet, this.#configs.FASTIFY_HELMET_CONFIG);
    // Static plugin for serving static files.
    this.#fastify.register(fastifyStatic, this.#configs.FASTIFY_STATIC_CONFIG);
    // Multipart plugin for handling multipart form data (e.g., file uploads).
    this.#fastify.register(fastifyMultipart, this.#configs.FASTIFY_MULTIPART_CONFIG);
    // FormBody plugin for parsing form bodies into JS objects.
    this.#fastify.register(fastifyFormBody);

    this.#fastify.register(fastifyCors, FASTIFY_CORS_CONFIG);
    // wait until previous plugin being registered
    // it allows us to be sure that further fastify instance will have fastifyAuth methods available
    await this.#fastify.after();
    // Normally you would need to load by hand each plugin. `fastify-autoload` is an utility
    //   we wrote to solve this specific problems. It loads all the content from the specified
    // folder, even the subfolders. Take at look at its documentation, as it's doing a lot more!
    //   First of all, we require all the plugins that we'll need in our application
    // Registering routers.
    this.#fastify.register(sharedHealthCheckRouter, { prefix: "/api" });

    this.#autoLoadRoutes();
  }

  /**
   * Gets the Fastify instance (for testing)
   * @returns {import('@fastify/type-provider-typebox').FastifyInstanceTypebox}
   */
  getFastifyInstance() {
    return this.#fastify;
  }

  /**
   * Starts the Fastify server on the specified IP and port.
   * @async
   * @param {object} param0 - Server start parameters.
   * @param {string} param0.ip - IP address to bind.
   * @param {number} param0.port - Port number to listen on.
   * @returns {Promise<void>}
   */
  async start({ ip, port }) {
    await this.buildServerApp();

    await this.#fastify.listen({ host: ip, port });

    // Upon this.#fastify readiness, print the route table and/or plugin tree for debugging purposes.
    this.#fastify.ready(() => {
      if (this.#configs.APP_CONFIG.isDebug) {
        logger.debug(this.#fastify.printRoutes({ commonPrefix: false }));
      }
    });
  }

  /**
   * Stops the Fastify server gracefully.
   * @async
   * @returns {Promise<void>}
   */
  async stop() {
    try {
      await this.#fastify.close();
    } catch (error) {
      logger.error("Server failed to close with error: ", error);
    }
  }

  /**
   * Auto-loads plugins from the libs directory
   * Recursively loads all files matching *.plugin.js pattern from libs directory
   * Passes options (configs and database) to each plugin
   */
  #autoLoadPlugins() {
    const libsPath = path.join(getDirName(import.meta.url), "../../../libs");

    this.#fastify.register(fastifyAutoLoad, {
      dir: libsPath,
      /**
       * Filter to match only plugin files, but exclude pagination.plugin.js
       * as it's registered explicitly before autoload
       * @param {string} p
       */
      matchFilter: (p) => p.endsWith(".plugin.js") && !p.includes("pagination.plugin.js"),
      options: {
        ...this.#options,
      },
    });
  }

  /**
   * Auto-loads routes from the designated directory
   * Loads all files matching *.router.v1.js pattern from modules directory
   * Registers routes with /v1 prefix
   */
  #autoLoadRoutes() {
    const routesPath = path.join(getDirName(import.meta.url), "../../../modules");
    this.#fastify.register(fastifyAutoLoad, {
      dir: routesPath,
      ignorePattern: /d.ts/,
      /**
       *
       * @param {string} p
       */
      matchFilter: (p) => p.endsWith(".router.v1.js"),
      maxDepth: 2,
      options: {
        ...this.#options,
        prefix: "/v1",
      },
    });
  }
}
