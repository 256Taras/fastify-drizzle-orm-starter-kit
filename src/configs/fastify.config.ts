import { randomUUID } from "node:crypto";

import type { Options as AjvOptions } from "ajv";

/**
 * AJV custom options with proper typing
 * Extends AjvOptions to include additionalProperties which is valid but not in types
 */
interface AjvCustomOptions extends AjvOptions {
  additionalProperties?: boolean;
}

/**
 * Fastify HTTP server configuration
 * Configures AJV validation, request ID generation, and logging
 *
 * Type is inferred automatically - no explicit type needed to avoid generic parameter requirements.
 * The AjvCustomOptions interface properly types the customOptions with additionalProperties support.
 */
export const FASTIFY_CONFIG = {
  ajv: {
    customOptions: {
      additionalProperties: false,
      allErrors: true,
      allowUnionTypes: true,
      coerceTypes: true,
      removeAdditional: false,
      strict: true,
      strictNumbers: true,
      strictRequired: "log",
      strictSchema: true,
      strictTypes: "log",
      unevaluated: true,
      useDefaults: true,
      validateFormats: true,
      verbose: true,
    } as AjvCustomOptions,
  },
  bodyLimit: 2_097_152, // 2MB
  connectionTimeout: 10_000,
  disableRequestLogging: true,
  genReqId: () => randomUUID(),
  keepAliveTimeout: 5000,
  logger: false,
};
