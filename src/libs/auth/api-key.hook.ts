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
 * Creates a preHandler hook that validates API key from x-api-key header.
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

    const providedKey = request.headers["x-api-key"];

    if (typeof providedKey !== "string" || !safeCompare(providedKey, apiKey)) {
      done(new UNAUTHORIZED_ACCESS_401("Invalid API key"));
      return;
    }

    done();
  };
};
