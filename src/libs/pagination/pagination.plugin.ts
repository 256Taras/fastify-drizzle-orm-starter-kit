import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { BadRequestException } from "#libs/errors/domain.errors.ts";

import type { QueryParams } from "./pagination.common-types.d.ts";
import type { PaginationParams } from "./pagination.types.d.ts";

/**
 * Parse select parameter - supports both comma-separated and multiple params
 */
const parseSelectParameter = (selectParam: string | string[] | undefined): string[] | undefined => {
  if (!selectParam) return;

  if (Array.isArray(selectParam)) {
    // Multiple query params: select=email&select=name
    return selectParam
      .flatMap((s) =>
        String(s)
          .split(",")
          .map((f) => f.trim()),
      )
      .filter(Boolean);
  }

  // Single param, possibly comma-separated: select=email,name
  return String(selectParam)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

/**
 * Parse sort parameter
 */
const parseSortParameter = (sortParam: string | string[] | undefined): string[] | undefined => {
  if (!sortParam) return;
  return Array.isArray(sortParam) ? sortParam.map(String) : [String(sortParam)];
};

/**
 * Parse filter parameters
 */
const parseFilterParameters = (
  rawQuery: Record<string, string | string[] | undefined>,
): Record<string, string | string[]> | undefined => {
  const filters: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(rawQuery)) {
    if (!key.startsWith("filter.")) continue;

    const column = key.replace("filter.", "");

    // Support both single value and array
    if (Array.isArray(value)) {
      // eslint-disable-next-line security/detect-object-injection
      filters[column] = value.map(String).filter(Boolean);
    } else if (value !== undefined && value !== null) {
      // eslint-disable-next-line security/detect-object-injection
      filters[column] = String(value);
    }
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
};

/**
 * Parse pagination query parameters
 */
const parsePaginationQuery = (
  rawQuery: Record<string, string | string[] | undefined>,
): PaginationParams<"offset">["query"] => {
  const query = {
    after: typeof rawQuery.after === "string" ? rawQuery.after : undefined,
    before: typeof rawQuery.before === "string" ? rawQuery.before : undefined,
    limit: rawQuery.limit ? Number.parseInt(String(rawQuery.limit), 10) : undefined,
    page: rawQuery.page ? Number.parseInt(String(rawQuery.page), 10) : undefined,
  };

  // Validate numeric values
  if (query.limit !== undefined && (Number.isNaN(query.limit) || query.limit < 1)) {
    query.limit = undefined;
  }
  if (query.page !== undefined && (Number.isNaN(query.page) || query.page < 1)) {
    query.page = undefined;
  }

  return query;
};

/**
 * Get pagination query from request This helper function ensures proper type inference for req.pagination Works for both
 * offset and cursor pagination strategies
 */
const getPaginationQuery = <TStrategy extends "cursor" | "offset" = "offset">(
  req: {
    pagination?: PaginationParams<TStrategy> | undefined;
  } & FastifyRequest,
): PaginationParams<TStrategy> => {
  const pagination = req.pagination;
  if (!pagination) {
    throw new Error("req.pagination is undefined - pagination plugin may not be registered");
  }
  return pagination;
};

/**
 * Fastify plugin that extracts all pagination params into req.pagination
 */
// eslint-disable-next-line @typescript-eslint/require-await
const paginationPlugin: FastifyPluginAsync = async (fastify) => {
  // Decorate request with pagination property
  fastify.decorateRequest("pagination", null);

  // Decorate app with transformers object containing pagination helper
  fastify.decorate("transformers", {
    getPaginationQuery,
  });

  // Add preValidation hook to validate mutually exclusive cursors before schema validation
  // eslint-disable-next-line @typescript-eslint/require-await
  fastify.addHook("preValidation", async (request) => {
    const rawQuery = (request.query ?? {}) as QueryParams;

    // Validate mutually exclusive cursors for cursor pagination
    const after = typeof rawQuery.after === "string" ? rawQuery.after : undefined;
    const before = typeof rawQuery.before === "string" ? rawQuery.before : undefined;

    if (after && before) {
      throw new BadRequestException("Cannot use both 'after' and 'before' cursors simultaneously");
    }
  });

  // Add preHandler hook to parse pagination params
  // eslint-disable-next-line @typescript-eslint/require-await
  fastify.addHook("preHandler", async (request) => {
    const rawQuery = (request.query ?? {}) as QueryParams;

    // @ts-expect-error - pagination is decorated on request
    request.pagination = {
      query: parsePaginationQuery(rawQuery),
      filters: parseFilterParameters(rawQuery),
      sortBy: parseSortParameter(rawQuery.sortBy as string | undefined),
      select: parseSelectParameter(rawQuery.select as string | undefined),
    };
  });
};

export default fp(paginationPlugin, {
  name: "pagination",
  encapsulate: false, // Allow hooks to work across route contexts
});
