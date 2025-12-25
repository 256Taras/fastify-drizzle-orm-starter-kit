import { timingSafeEqual } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import { UNAUTHORIZED_ACCESS_401 } from "#libs/errors/http.errors.ts";

const safeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

/**
 * Extracts API key from request headers.
 * Supports both x-api-key header and Bearer token (for Prometheus compatibility).
 */
const extractApiKey = (request: FastifyRequest): string | undefined => {
  const xApiKey = request.headers["x-api-key"];
  if (typeof xApiKey === "string") {
    return xApiKey;
  }

  const authorization = request.headers.authorization;
  if (typeof authorization === "string" && authorization.startsWith("Bearer ")) {
    return authorization.slice(7);
  }

  return undefined;
};

/**
 * Creates a preHandler hook that validates API key.
 * Accepts key from x-api-key header or Authorization: Bearer token.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @param apiKey - The expected API key. If undefined/empty, validation is skipped.
 */
export const createApiKeyPreHandler = (
  apiKey: string | undefined,
): ((request: FastifyRequest, reply: FastifyReply, done: (error?: Error) => void) => void) => {
  return (request: FastifyRequest, _reply: FastifyReply, done: (error?: Error) => void): void => {
    if (!apiKey) {
      done();
      return;
    }

    const providedKey = extractApiKey(request);

    if (typeof providedKey !== "string" || !safeCompare(providedKey, apiKey)) {
      done(new UNAUTHORIZED_ACCESS_401("Invalid API key"));
      return;
    }

    done();
  };
};
