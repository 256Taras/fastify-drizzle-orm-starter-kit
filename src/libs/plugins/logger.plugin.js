import fp from "fastify-plugin";
import { requestContext } from "@fastify/request-context";

import defaultLogger from "#libs/services/logger.service.js";
import { APP_CONFIG, LOGGER_CONFIG } from "#configs/index.js";

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
        requestId: request.id,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
          ip: request.ip,
          ips: request.ips,
          hostname: request.hostname,
          protocol: request.protocol,
          authorization: !!request.headers.authorization ?? null,
          contentType: request.headers["content-type"],
          userAgent: request.headers["user-agent"] ?? null,
        },
        msg: "Incoming request",
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
        requestId: request.id,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
          body: APP_CONFIG.env !== "production" ? request.body : undefined,
          ip: request.ip,
          ips: request.ips,
          hostname: request.hostname,
          protocol: request.protocol,
          statusCode: reply.raw.statusCode,
          responseTime: reply.elapsedTime,
          contentType: request.headers["content-type"],
          authorization: !!request.headers.authorization ?? null,
          userAgent: request.headers["user-agent"] ?? null,
        },
        msg: "Request completed",
      });
    }
    done();
  };

  app.addHook("onRequest", setTraceIdFastifyHook);
  app.addHook("onRequest", requestLogger);
  app.addHook("onResponse", responseLogger);
};

export default fp(requestLoggerPlugin);
