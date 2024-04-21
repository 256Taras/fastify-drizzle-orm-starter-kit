import { randomUUID } from "node:crypto";

import { ajvFilePlugin } from "@fastify/multipart";

/**
 * @type {import('fastify').FastifyHttpOptions<*>}
 */
export const FASTIFY_CONFIG = {
  genReqId: () => randomUUID(),
  disableRequestLogging: true, // we do it on our own
  logger: false,
  keepAliveTimeout: 5000,
  ajv: {
    customOptions: {
      // @ts-ignore
      additionalProperties: false, // Disallow properties not defined in the schema. Ensures data shape consistency.
      removeAdditional: false, // Do not remove additional properties. Instead, prefer detecting their presence as errors.
      useDefaults: true, // Automatically sets default values from the schema to missing properties. Useful for filling in missing data.
      coerceTypes: true, // Convert data types according to the schema. Helpful for form data processing.
      strictTypes: "log", // Use "log" to document type coercion issues without rejecting valid data. For maximum strictness, consider using true.
      strictRequired: "log", // Similar to strictTypes, logging helps identify when data might be missing without outright rejection.
      verbose: true, // Provide detailed error messages. Makes debugging and fixing data issues easier.
      allErrors: true, // Report all validation errors, not just the first one. Useful for comprehensive validation.
      strict: true, // Enable strict mode for all checks. Ensures comprehensive validation coverage.
      strictSchema: true, // Enforce strictness on schema definitions (e.g., checking $schema and other metadata).
      allowUnionTypes: true, // Allow the use of union types, maintaining strictness while providing flexibility.
      validateFormats: true, // Enforce format validation strictly. Ensures data conforms to specified formats.
      unevaluated: true, // Ensure properties and array items that were not evaluated are compliant with the schema. Promotes explicitness in schema definitions.
      strictNumbers: true, // Strictly validate numbers (e.g., reject NaN, Infinity). Ensures numerical data integrity.
    },
    plugins: [ajvFilePlugin],
  },
};
