/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import path from "node:path";

// Import necessary Fastify core and plugins.
import fastifyAuth from "@fastify/auth";
import fastifyAutoLoad from "@fastify/autoload";
import fastifyCompress from "@fastify/compress";
import fastifyCors from "@fastify/cors";
import fastifyFormBody from "@fastify/formbody";
import fastifyHelmet from "@fastify/helmet";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyRequestContextPlugin from "@fastify/request-context";
import fastifySwaggerPlugin from "@fastify/swagger";
import fastifySwaggerUiPlugin from "@fastify/swagger-ui";
import Fastify from "fastify";
import fastifyMetrics from "fastify-metrics";

import { FASTIFY_CORS_CONFIG, FASTIFY_METRICS_CONFIG } from "#configs/index.ts";
import { globalHttpFastify404ErrorHandler, globalHttpFastifyErrorHandler } from "#infra/api/http/fastify-error-handler.ts";
import healthCheckRouter from "#infra/api/http/routes/health-check.router.ts";
import defaultLogger, { logger } from "#libs/logging/logger.service.ts";
import { paginationPlugin } from "#libs/pagination/index.ts";
import { getDirName } from "#libs/utils/files.ts";

import type { Configs, ServerOptions } from "#types/index.d.ts";
// Module augmentation for @fastify/awilix is automatically loaded from:
// src/libs/di-container/awilix.d.ts

export class RestApiServer {
  #configs: Configs;
  #fastify: ReturnType<typeof Fastify.prototype.withTypeProvider>;
  #options: ServerOptions;

  /**
   * Creates a new instance of RestApiServer
   *
   * @param options - Server options containing configs and database
   */
  constructor(options: ServerOptions = {} as ServerOptions) {
    this.#configs = options.configs;
    this.#options = options;
    this.#fastify = Fastify(this.#configs.FASTIFY_CONFIG).withTypeProvider();
    Object.freeze(this);
  }

  /**
   * Builds and configures the Fastify server application Registers all plugins, error handlers, and routes
   *
   * @returns {Promise<void>}
   */
  async buildServerApp() {
    // Error handlers to handle 404 and other HTTP errors.
    this.#fastify.setErrorHandler(globalHttpFastifyErrorHandler);
    this.#fastify.setNotFoundHandler(globalHttpFastify404ErrorHandler);
    // Register authentication plugin first (required by other plugins)
    await this.#fastify.register(fastifyAuth);

    // Register independent plugins in parallel for better startup performance
    await Promise.all([
      // RequestContext plugin provides context storage across async operations during request/response lifecycle.
      this.#fastify.register(fastifyRequestContextPlugin, { defaultStoreValues: { logger: defaultLogger } }),
      // Register pagination plugin explicitly before autoload to ensure it's available for all routes
      this.#fastify.register(paginationPlugin),
      // Compress plugin for response compression (gzip, brotli).
      this.#fastify.register(fastifyCompress),
      // FormBody plugin for parsing form bodies into JS objects.
      this.#fastify.register(fastifyFormBody),
      // CORS plugin
      this.#fastify.register(fastifyCors, FASTIFY_CORS_CONFIG),
    ]);

    // Register Swagger plugins only in dev mode (lazy initialization)
    if (this.#configs.APP_CONFIG.isDev) {
      await Promise.all([
        this.#fastify.register(fastifySwaggerPlugin, this.#configs.OPENAPI_CONFIG),
        this.#fastify.register(fastifySwaggerUiPlugin, this.#configs.OPENAPI_CONFIG),
      ]);
    }

    // Autoload plugin to load custom plugins from a directory.
    this.#autoLoadPlugins();

    // Register security and rate limiting plugins in parallel
    await Promise.all([
      this.#fastify.register(fastifyRateLimit, this.#configs.FASTIFY_RATE_LIMIT_CONFIG),
      this.#fastify.register(fastifyHelmet, this.#configs.FASTIFY_HELMET_CONFIG),
    ]);
    // Wait until all plugins are registered before loading routes
    await this.#fastify.after();

    // Registering system routers (health check, etc.)
    this.#fastify.register(healthCheckRouter, { prefix: "/api" });

    this.#autoLoadRoutes();

    // Note: Metrics plugin is registered after server start for better startup performance
  }

  /**
   * Gets the Fastify instance (for testing)
   */
  getFastifyInstance(): ReturnType<typeof Fastify.prototype.withTypeProvider> {
    return this.#fastify;
  }

  /**
   * Starts the Fastify server on the specified IP and port.
   *
   * @async
   * @param param0 - Server start parameters.
   * @param param0.ip - IP address to bind.
   * @param param0.port - Port number to listen on.
   * @returns {Promise<void>}
   */
  async start({ ip, port }: { ip: string; port: number }): Promise<void> {
    await this.buildServerApp();

    await this.#fastify.listen({ host: ip, port });

    // Register metrics plugin after server start for better startup performance
    // This doesn't block the server from accepting requests
    this.#fastify.ready(async () => {
      try {
        await this.#fastify.register(fastifyMetrics, FASTIFY_METRICS_CONFIG as never);
        logger.debug("Metrics plugin registered");
      } catch (error) {
        logger.warn("Failed to register metrics plugin:", error);
      }

      // Print the route tree for debugging purposes
      if (this.#configs.APP_CONFIG.isDebug) {
        logger.debug(this.#fastify.printRoutes());
      }
    });
  }

  /**
   * Stops the Fastify server gracefully.
   *
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
   * Recursively loads all files matching *.plugin.ts pattern from libs directory
   * Passes options (configs and database) to each plugin
   *
   * Optimized with:
   * - forceESM: true for better ESM support
   * - matchFilter to limit file scanning
   * - maxDepth to limit recursion depth
   */
  #autoLoadPlugins() {
    const libsPath = path.join(getDirName(import.meta.url), "../../../libs");

    this.#fastify.register(fastifyAutoLoad, {
      dir: libsPath,
      /**
       * Filter to match only plugin files, but exclude pagination.plugin.ts and metrics.plugin.ts
       * as they are registered explicitly before autoload
       */
      matchFilter: (p: string) =>
        p.endsWith(".plugin.ts") && !p.includes("pagination.plugin.ts") && !p.includes("metrics.plugin.ts"),
      maxDepth: 1, // Limit recursion depth for better performance
      forceESM: true, // Use ESM loader for better performance with TypeScript files
      options: {
        ...this.#options,
      },
    });
  }

  /**
   * Auto-loads routes from the designated directory
   * Loads all files matching *.router.v1.ts pattern from modules directory
   * Registers routes with /v1 prefix
   *
   * Optimized with:
   * - forceESM: true for better ESM support
   * - matchFilter to limit file scanning
   * - maxDepth to limit recursion depth
   */
  #autoLoadRoutes() {
    const routesPath = path.join(getDirName(import.meta.url), "../../../modules");
    this.#fastify.register(fastifyAutoLoad, {
      dir: routesPath,
      ignorePattern: /d.ts/, // Ignore type definition files
      matchFilter: (p: string) => p.endsWith(".router.v1.ts"), // Only load router files
      maxDepth: 2, // Limit recursion depth for better performance
      forceESM: true, // Use ESM loader for better performance with TypeScript files
      options: {
        ...this.#options,
        prefix: "/v1",
      },
    });
  }
}
