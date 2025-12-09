import { requestContext } from "@fastify/request-context";
import fp from "fastify-plugin";

import { SERVER_TIMEOUT_408 } from "#libs/errors/http.errors.js";

const TIMEOUT_KEY = "TIMEOUT_KEY";
const CONTROLLER_KEY = "CONTROLLER_KEY";
const SIGNAL_KEY = "SIGNAL_KEY";

/**
 * Plugin to handle request timeouts in Fastify. It sets up timeouts based on route-specific configurations or global
 * defaults and ensures proper cleanup of resources upon request completion or failure. This plugin leverages Fastify's hooks
 * for onRequest, onSend, and onError. // Usage at the route level: fastify.get('/some-route', { config: { timeout: 2000 // 2
 * seconds } }, async (request, reply) => { // Your handler logic here. });
 *
 * @type {(
 *   app: import("#@types/index.jsdoc.js").FastifyInstance,
 *   options: { configs: { SERVER_CONFIG: { requestTimeout: number } } },
 * ) => Promise<void>}
 */
async function requestTimeoutPlugin(app, options) {
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
   * @param {import("fastify").FastifyRequest} request
   * @param {import("fastify").FastifyReply} reply
   * @param {import("fastify").HookHandlerDoneFunction} done
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

      done();
    } catch (error) {
      // @ts-ignore
      done(error);
    }
  };

  /**
   * @param {import("fastify").FastifyRequest} request
   * @param {import("fastify").FastifyReply} reply
   * @param {unknown} payload
   * @param {(err: Error | null, newPayload?: unknown) => void} done
   */
  const cleanupResources = (request, reply, payload, done) => {
    performCleanup();
    done(null, payload);
  };

  /**
   * @param {import("fastify").FastifyRequest} request
   * @param {import("fastify").FastifyReply} reply
   * @param {Error} error
   * @param {(err?: Error) => void} done
   */
  const handleError = (request, reply, error, done) => {
    performCleanup();
    done(); // Must call done() to allow error handler to process the error
  };

  app.addHook("onRequest", setupRequestTimeout);
  app.addHook("onSend", cleanupResources);
  app.addHook("onError", handleError);
}

// @ts-expect-error - FastifyInstanceExtended is used for JSDoc documentation, but fp() expects base FastifyInstance type. At runtime, the instance will have all extended properties.
export default fp(requestTimeoutPlugin);
