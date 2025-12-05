import { requestContext } from "@fastify/request-context";
import fp from "fastify-plugin";

import { APP_CONFIG, LOGGER_CONFIG } from "#configs/index.js";
import defaultLogger from "#libs/services/logger.service.js";

/** @type {import("@fastify/type-provider-typebox").FastifyPluginAsyncTypebox<import("#@types/fastify.js").FastifyGlobalOptionConfig> } */
const requestLoggerPlugin = async (app) => {
  /**
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   * @param {import('fastify').DoneFuncWithErrOrRes} done
   */
  const setTraceIdFastifyHook = (request, reply, done) => {
    const requestId = request.id;
    const childLogger = defaultLogger.child({ traceId: requestId });
    // @ts-ignore
    requestContext.set("logger", childLogger);
    // @ts-ignore
    requestContext.set("traceId", requestId);
    done();
  };

  /**
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} _
   * @param {import('fastify').DoneFuncWithErrOrRes} done
   */
  const requestLogger = (request, _, done) => {
    if (LOGGER_CONFIG.enableRequestLogging) {
      defaultLogger.info({
        msg: "Incoming request",
        request: {
          authorization: !!request.headers.authorization ?? null,
          contentType: request.headers["content-type"],
          hostname: request.hostname,
          ip: request.ip,
          ips: request.ips,
          method: request.method,
          params: request.params,
          protocol: request.protocol,
          query: request.query,
          url: request.url,
          userAgent: request.headers["user-agent"] ?? null,
        },
        requestId: request.id,
      });
    }
    done();
  };

  /**
   * @param {import('fastify').FastifyRequest} request
   * @param {import('fastify').FastifyReply} reply
   * @param {import('fastify').DoneFuncWithErrOrRes} done
   */
  const responseLogger = (request, reply, done) => {
    if (LOGGER_CONFIG.enableRequestLogging) {
      defaultLogger.info({
        msg: "Request completed",
        request: {
          authorization: !!request.headers.authorization ?? null,
          body: APP_CONFIG.env === "production" ? undefined : request.body,
          contentType: request.headers["content-type"],
          hostname: request.hostname,
          ip: request.ip,
          ips: request.ips,
          method: request.method,
          params: request.params,
          protocol: request.protocol,
          query: request.query,
          responseTime: reply.elapsedTime,
          statusCode: reply.raw.statusCode,
          url: request.url,
          userAgent: request.headers["user-agent"] ?? null,
        },
        requestId: request.id,
      });
    }
    done();
  };

  app.addHook("onRequest", setTraceIdFastifyHook);
  app.addHook("onRequest", requestLogger);
  app.addHook("onResponse", responseLogger);
};

export default fp(requestLoggerPlugin);
