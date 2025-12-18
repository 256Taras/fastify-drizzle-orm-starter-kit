/**
 * Configuration for fastify-metrics plugin
 * Prometheus metrics collection and exposure
 * Note: fastify-metrics creates handler automatically, we just provide schema for Swagger
 */
export const FASTIFY_METRICS_CONFIG = {
  endpoint: {
    url: "/api/metrics",
    method: "GET",
    schema: {
      tags: ["System"],
      description: "Prometheus metrics endpoint",
      summary: "Get Prometheus metrics",
      response: {
        200: {
          type: "string",
          description: "Prometheus metrics in text format",
        },
      },
    },
  },
  routeMetrics: {
    enabled: true,
    registeredRoutesOnly: true,
    groupStatusCodes: false,
  },
};
