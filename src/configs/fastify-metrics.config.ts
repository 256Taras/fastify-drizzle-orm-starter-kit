import { ENV_CONFIG } from "./env.config.ts";

import { createApiKeyPreHandler } from "#libs/auth/api-key.hook.ts";

/**
 * Configuration for fastify-metrics plugin
 * Prometheus metrics collection and exposure
 * Note: fastify-metrics creates handler automatically, we just provide schema for Swagger
 */
export const FASTIFY_METRICS_CONFIG = {
  endpoint: {
    method: "GET",
    preHandler: createApiKeyPreHandler(ENV_CONFIG.METRICS_API_KEY),
    schema: {
      description: "Prometheus metrics endpoint",
      response: {
        200: {
          description: "Prometheus metrics in text format",
          type: "string",
        },
      },
      summary: "Get Prometheus metrics",
      tags: ["System"],
    },
    url: "/api/metrics",
  },
  routeMetrics: {
    enabled: true,
    groupStatusCodes: false,
    registeredRoutesOnly: true,
  },
};
