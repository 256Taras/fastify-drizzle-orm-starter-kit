import fp from "fastify-plugin";

/**
 * Fastify plugin that extracts all pagination params into req.pagination
 * @type {import("fastify").FastifyPluginAsync}
 */
async function paginationPlugin(fastify) {
  fastify.decorateRequest("pagination", null);

  // Use preHandler hook - it runs after query parsing but before route handler
  // encapsulate: false ensures hooks work across all route contexts (including routes with prefix)
  fastify.addHook("preHandler", async (request) => {
    /** @type {any} */
    const rawQuery = request.query || {};

    /** @type {import('./pagination.types.jsdoc.js').PaginationParams['query']} */
    const query = {
      after: typeof rawQuery.after === "string" ? rawQuery.after : undefined,
      before: typeof rawQuery.before === "string" ? rawQuery.before : undefined,
      limit: rawQuery.limit ? Number.parseInt(String(rawQuery.limit), 10) : undefined,
      page: rawQuery.page ? Number.parseInt(String(rawQuery.page), 10) : undefined,
    };

    /** @type {Record<string, string | string[]>} */
    const filters = {};
    for (const [key, value] of Object.entries(rawQuery)) {
      if (key.startsWith("filter.")) {
        const column = key.replace("filter.", "");
        // Support both single value and array
        if (Array.isArray(value)) {
          // eslint-disable-next-line security/detect-object-injection
          filters[column] = value.map(String);
        } else if (typeof value === "string") {
          // eslint-disable-next-line security/detect-object-injection
          filters[column] = value;
        }
      }
    }

    /** @type {string[] | undefined} */
    let sortBy;
    if (rawQuery.sortBy) {
      sortBy = Array.isArray(rawQuery.sortBy) ? rawQuery.sortBy.map(String) : [String(rawQuery.sortBy)];
    }

    /** @type {string[] | undefined} */
    let select;
    if (rawQuery.select) {
      select = Array.isArray(rawQuery.select)
        ? rawQuery.select.map(String)
        : String(rawQuery.select)
            .split(",")
            .map((s) => s.trim());
    }

    /** @type {import('./pagination.types.jsdoc.js').PaginationParams} */
    // @ts-ignore - pagination is decorated on request
    request.pagination = {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      query,
      select,
      sortBy,
    };
  });
}

export default fp(paginationPlugin, {
  name: "pagination",
  encapsulate: false, // Allow hooks to work across route contexts (e.g., routes with prefix)
});
