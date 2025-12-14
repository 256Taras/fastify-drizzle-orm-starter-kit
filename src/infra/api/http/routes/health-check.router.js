import { Type } from "@sinclair/typebox";
import { sql } from "drizzle-orm";

import { SWAGGER_TAGS } from "#libs/constants/swagger-tags.constants.js";

const HEALTHCHECK_SCHEMA = Type.Object(
  {
    database: Type.String({ description: "Database connection status" }),
    status: Type.String({ description: "Service status" }),
    timestamp: Type.Number({ description: "Current timestamp" }),
    uptime: Type.Number({ description: "Service uptime in seconds" }),
  },
  { additionalProperties: false },
);

/**
 * Health check router for system monitoring
 * Used for load balancers, Kubernetes probes, and service status checks
 */
/** @type {import("fastify").FastifyPluginAsync} */
export default async (fastify) => {
  fastify.get("/healthcheck", {
    async handler() {
      let dbStatus = false;
      try {
        // @ts-ignore - db is defined in Dependencies but TypeScript can't infer it properly
        // @ts-ignore - this context is extended with diContainer but TypeScript can't infer it
        await this.diContainer.cradle.db.execute(sql`SELECT 1`);
        dbStatus = true;
      } catch {
        // Database connection failed
      }

      return {
        database: dbStatus ? "connected" : "disconnected",
        status: "ok",
        timestamp: Date.now(),
        uptime: process.uptime(),
      };
    },
    schema: {
      description: "Health check endpoint for service status",
      response: {
        200: HEALTHCHECK_SCHEMA,
      },
      summary: "Get service health status",
      tags: SWAGGER_TAGS.DEV,
    },
  });
};
