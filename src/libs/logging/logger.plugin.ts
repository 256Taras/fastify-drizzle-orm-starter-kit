import { requestContext } from "@fastify/request-context";
import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { DoneFuncWithErrOrRes, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import type { Logger as _Logger } from "pino";

import { APP_CONFIG, LOGGER_CONFIG } from "#configs/index.ts";

import defaultLogger from "./logger.service.ts";

import type { PluginOptions } from "#types/index.d.ts";

const requestLoggerPlugin: FastifyPluginAsyncTypebox<PluginOptions> = async (app) => {
  const setTraceIdFastifyHook = (request: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErrOrRes): void => {
    const requestId = request.id;
    const childLogger = defaultLogger.child({ traceId: requestId });
    requestContext.set("logger", childLogger);
    requestContext.set("traceId", requestId);
    done();
  };

  const requestLogger = (request: FastifyRequest, _: FastifyReply, done: DoneFuncWithErrOrRes): void => {
    if (LOGGER_CONFIG.enableRequestLogging) {
      defaultLogger.info({
        msg: "Incoming request",
        request: {
          authorization: request.headers.authorization ? true : null,
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

  const responseLogger = (request: FastifyRequest, reply: FastifyReply, done: DoneFuncWithErrOrRes): void => {
    if (LOGGER_CONFIG.enableRequestLogging) {
      defaultLogger.info({
        msg: "Request completed",
        request: {
          authorization: request.headers.authorization ? true : null,
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
