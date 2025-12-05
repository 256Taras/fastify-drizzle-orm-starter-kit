import { requestContext } from "@fastify/request-context";
import fp from "fastify-plugin";

import { SERVER_TIMEOUT_408 } from "#libs/errors/http.errors.js";

const TIMEOUT_KEY = "TIMEOUT_KEY";
const CONTROLLER_KEY = "CONTROLLER_KEY";
const SIGNAL_KEY = "SIGNAL_KEY";

/**
 * Plugin to handle request timeouts in Fastify. It sets up timeouts based on route-specific
 * configurations or global defaults and ensures proper cleanup of resources upon request completion
 * or failure. This plugin leverages Fastify's hooks for onRequest, onSend, and onError.
 * // Usage at the route level:
 * fastify.get('/some-route', {
 *   config: {
 *     timeout: 2000 // 2 seconds
 *   }
 * }, async (request, reply) => {
 *   // Your handler logic here.
 * });
 * @type {import('@fastify/type-provider-typebox').FastifyPluginAsyncTypebox} app
 */
async function requestTimeoutPlugin(app, options) {
  /**
   * Helper function to clear timeout and controller references stored in the request context.
   */
  const performCleanup = () => {
    // @ts-ignore
    const timeoutId = requestContext.get(TIMEOUT_KEY);
    if (timeoutId) {
      clearTimeout(timeoutId);
      // @ts-ignore
      requestContext.set(TIMEOUT_KEY, null);
      // @ts-ignore
      requestContext.set(CONTROLLER_KEY, null);
      // @ts-ignore
      requestContext.set(SIGNAL_KEY, null);
    }
  };

  /**
   * Sets up a timeout for handling requests which can be aborted if not completed
   * within a specified timeframe, triggering a 408 error.
   * @param {import('fastify').FastifyRequest} request The request object.
   * @param {import('fastify').FastifyReply} reply The reply object.
   * @param {import('fastify').HookHandlerDoneFunction} done Callback to signal completion or error.
   */
  const setupRequestTimeout = (request, reply, done) => {
    try {
      const controller = new AbortController();
      // @ts-ignore
      const timeout = reply.routeOptions?.config.timeout ?? options.configs.SERVER_CONFIG.requestTimeout;

      const timeoutId = setTimeout(() => {
        controller.abort();
        // @ts-expect-error - HookHandlerDoneFunction accepts Error
        done(new SERVER_TIMEOUT_408());
      }, timeout || 0);

      // @ts-ignore
      requestContext.set(TIMEOUT_KEY, timeoutId);
      // @ts-ignore
      requestContext.set(CONTROLLER_KEY, controller);
      // @ts-ignore
      requestContext.set(SIGNAL_KEY, controller.signal);

      done(undefined);
    } catch (error) {
      // @ts-ignore
      done(error);
    }
  };

  /**
   * Cleans up resources after sending a response or when an error occurs.
   * This function clears any timeouts and removes references from the request context.
   * @type {import("fastify/types/hooks").onSendMetaHookHandler}
   */
  const cleanupResources = (request, reply, payload, done) => {
    performCleanup();
    done(null, payload);
  };

  app.addHook("onRequest", setupRequestTimeout);
  app.addHook("onSend", cleanupResources);
  app.addHook("onError", performCleanup);
}

export default fp(requestTimeoutPlugin);
