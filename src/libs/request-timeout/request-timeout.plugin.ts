import { requestContext } from "@fastify/request-context";
import type { FastifyInstance, FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import fp from "fastify-plugin";

import { SERVER_TIMEOUT_408 } from "#libs/errors/http.errors.ts";
import type { PluginOptions } from "#types/index.d.ts";

/**
 * Plugin to handle request timeouts in Fastify.
 *
 * Sets up timeouts based on route-specific configurations or global defaults
 * and ensures proper cleanup of resources upon request completion or failure.
 *
 * @example
 * // Usage at the route level:
 * fastify.get('/some-route', {
 *   config: { timeout: 2000 } // 2 seconds
 * }, async (request, reply) => {
 *   // Your handler logic here
 * });
 */

async function requestTimeoutPlugin(app: FastifyInstance, options: PluginOptions): Promise<void> {
  const performCleanup = (): void => {
    // @ts-ignore
    const timeoutId = requestContext.get("TIMEOUT_KEY");
    if (timeoutId) {
      clearTimeout(timeoutId);
      // @ts-ignore
      requestContext.set("TIMEOUT_KEY", null);
      // @ts-ignore
      requestContext.set("CONTROLLER_KEY", null);
      // @ts-ignore
      requestContext.set("SIGNAL_KEY", null);
    }
  };

  const setupRequestTimeout = (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction): void => {
    try {
      const controller = new AbortController();
      const routeConfig = reply.routeOptions?.config as { timeout?: number } | undefined;
      const routeTimeout = routeConfig?.timeout;
      const timeout = typeof routeTimeout === "number" ? routeTimeout : options.configs?.SERVER_CONFIG?.requestTimeout;

      const timeoutId = setTimeout(() => {
        controller.abort();
        // @ts-expect-error - HookHandlerDoneFunction accepts Error but TS doesn't recognize it
        done(new SERVER_TIMEOUT_408());
      }, timeout || 0);

      // @ts-ignore
      requestContext.set("TIMEOUT_KEY", timeoutId);
      // @ts-ignore
      requestContext.set("CONTROLLER_KEY", controller);
      // @ts-ignore
      requestContext.set("SIGNAL_KEY", controller.signal);

      done();
    } catch (error) {
      done(error as Error);
    }
  };

  const cleanupResources = (
    _request: FastifyRequest,
    _reply: FastifyReply,
    payload: unknown,
    done: (err: Error | null, newPayload?: unknown) => void,
  ): void => {
    performCleanup();
    done(null, payload);
  };

  const handleError = (_request: FastifyRequest, _reply: FastifyReply, _error: Error, done: (err?: Error) => void): void => {
    performCleanup();
    done(); // Must call done() to allow error handler to process the error
  };

  app.addHook("onRequest", setupRequestTimeout);
  app.addHook("onSend", cleanupResources);
  app.addHook("onError", handleError);
}

export default fp(requestTimeoutPlugin);
