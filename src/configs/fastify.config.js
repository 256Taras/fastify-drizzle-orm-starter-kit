import { randomUUID } from "node:crypto";

import { ajvFilePlugin } from "@fastify/multipart";

/**
 * @type {import('fastify').FastifyHttpOptions<*>}
 */
export const FASTIFY_CONFIG = {
  ajv: {
    customOptions: {
      // @ts-ignore
      additionalProperties: false, // Disallow properties not defined in the schema. Ensures data shape consistency.
      allErrors: true, // Report all validation errors, not just the first one. Useful for comprehensive validation.
      allowUnionTypes: true, // Allow the use of union types, maintaining strictness while providing flexibility.
      coerceTypes: true, // Convert data types according to the schema. Helpful for form data processing.
      removeAdditional: false, // Do not remove additional properties. Instead, prefer detecting their presence as errors.
      strict: true, // Enable strict mode for all checks. Ensures comprehensive validation coverage.
      strictNumbers: true, // Strictly validate numbers (e.g., reject NaN, Infinity). Ensures numerical data integrity.
      strictRequired: "log", // Similar to strictTypes, logging helps identify when data might be missing without outright rejection.
      strictSchema: true, // Enforce strictness on schema definitions (e.g., checking $schema and other metadata).
      strictTypes: "log", // Use "log" to document type coercion issues without rejecting valid data. For maximum strictness, consider using true.
      unevaluated: true, // Ensure properties and array items that were not evaluated are compliant with the schema. Promotes explicitness in schema definitions.
      useDefaults: true, // Automatically sets default values from the schema to missing properties. Useful for filling in missing data.
      validateFormats: true, // Enforce format validation strictly. Ensures data conforms to specified formats.
      verbose: true, // Provide detailed error messages. Makes debugging and fixing data issues easier.
    },
    plugins: [ajvFilePlugin],
  },
  disableRequestLogging: true, // we do it on our own
  genReqId: () => randomUUID(),
  keepAliveTimeout: 5000,
  logger: false,
};
