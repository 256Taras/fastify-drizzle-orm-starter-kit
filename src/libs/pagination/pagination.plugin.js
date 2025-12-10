import fp from "fastify-plugin";

import { BadRequestException } from "#libs/errors/domain.errors.js";

/**
 * @typedef {import("./pagination.common-types.jsdoc.js").QueryParams} QueryParams
 *
 * @typedef {import("./pagination.common-types.jsdoc.js").FilterParams} FilterParams
 */

/**
 * Parse select parameter - supports both comma-separated and multiple params
 *
 * @param {string | string[] | undefined} selectParam - Select parameter
 * @returns {string[] | undefined} Parsed select fields
 */
const parseSelectParameter = (selectParam) => {
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
 *
 * @param {string | string[] | undefined} sortParam - Sort parameter
 * @returns {string[] | undefined} Parsed sort fields
 */
const parseSortParameter = (sortParam) => {
  if (!sortParam) return;
  return Array.isArray(sortParam) ? sortParam.map(String) : [String(sortParam)];
};

/**
 * Parse filter parameters
 *
 * @param {Record<string, string | string[] | undefined>} rawQuery - Raw query object
 * @returns {Record<string, string | string[]> | undefined} Parsed filters
 */
const parseFilterParameters = (rawQuery) => {
  /** @type {Record<string, string | string[]>} */
  const filters = {};

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
 *
 * @param {Record<string, string | string[] | undefined>} rawQuery - Raw query object
 * @returns {import("./pagination.types.jsdoc.js").PaginationParams["query"]} Parsed query
 */
const parsePaginationQuery = (rawQuery) => {
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
 *
 * @template {import("fastify").RouteGenericInterface} TRouteGeneric
 * @template {"offset" | "cursor"} [TStrategy='offset'] - Pagination strategy (optional, for type inference). Default is
 *   `'offset'`
 * @param {import("fastify").FastifyRequest<TRouteGeneric> & {
 *   pagination?: import("./pagination.types.jsdoc.js").PaginationParams<TStrategy> | undefined;
 * }} req
 *   - Fastify request with pagination property
 *
 * @returns {import("./pagination.types.jsdoc.js").PaginationParams<TStrategy>} Pagination parameters (works for both offset
 *   and cursor)
 * @throws {Error} If pagination is undefined (plugin may not be registered)
 */
const getPaginationQuery = (req) => {
  const pagination = req.pagination;
  if (!pagination) {
    throw new Error("req.pagination is undefined - pagination plugin may not be registered");
  }
  return pagination;
};

/**
 * Fastify plugin that extracts all pagination params into req.pagination
 *
 * @type {import("fastify").FastifyPluginAsync}
 */
async function paginationPlugin(fastify) {
  // Decorate request with pagination property
  fastify.decorateRequest("pagination", null);

  // Decorate app with transformers object containing pagination helper
  fastify.decorate("transformers", {
    getPaginationQuery,
  });

  // Add preValidation hook to validate mutually exclusive cursors before schema validation
  fastify.addHook("preValidation", async (request) => {
    /** @type {Record<string, string | string[] | undefined>} */
    // @ts-expect-error - request.query can be undefined, but we handle it with ?? and cast to proper type
    const rawQuery = /** @type {QueryParams} */ request.query ?? {};

    // Validate mutually exclusive cursors for cursor pagination
    const after = typeof rawQuery.after === "string" ? rawQuery.after : undefined;
    const before = typeof rawQuery.before === "string" ? rawQuery.before : undefined;

    if (after && before) {
      throw new BadRequestException("Cannot use both 'after' and 'before' cursors simultaneously");
    }
  });

  // Add preHandler hook to parse pagination params
  fastify.addHook("preHandler", async (request) => {
    /** @type {Record<string, string | string[] | undefined>} */
    // @ts-expect-error - request.query can be undefined, but we handle it with ?? and cast to proper type
    const rawQuery = /** @type {QueryParams} */ request.query ?? {};

    // @ts-ignore - pagination is decorated on request
    request.pagination = {
      query: parsePaginationQuery(rawQuery),
      filters: parseFilterParameters(rawQuery),
      sortBy: parseSortParameter(/** @type {string | undefined} */ rawQuery.sortBy),
      select: parseSelectParameter(/** @type {string | undefined} */ rawQuery.select),
    };
  });
}

export default fp(paginationPlugin, {
  name: "pagination",
  encapsulate: false, // Allow hooks to work across route contexts
});
