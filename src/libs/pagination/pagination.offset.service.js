import { PaginationQueryBuilder } from "./pagination.query-builder.js";
import { calculatePaginationOffset, createPaginatedResponse } from "./pagination.utils.js";

/**
 * Offset-based pagination service
 * @template {any} TTable - Drizzle table type
 * @template {any} [TItem=any] - Item type in the response
 * @param {import("#@types/index.jsdoc.js").Dependencies} deps - Dependencies
 * @param {TTable} table - Table to paginate
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<TTable, 'offset'>} config - Pagination config (must have strategy 'offset')
 * @param {import('./pagination.types.jsdoc.js').PaginationParams<'offset'>} paginationParams - Pagination parameters (must have OffsetPaginationQuery)
 * @param {import('./pagination.types.jsdoc.js').PaginationOptions} [options] - Additional options
 * @returns {Promise<import('./pagination.types.jsdoc.js').OffsetPaginatedResponse<TItem>>}
 */
export const paginateOffset = async ({ db, logger }, table, config, paginationParams, options = {}) => {
  if (!paginationParams) {
    logger.error("paginationParams is undefined", { config, options, table });
    throw new Error("paginationParams is required");
  }

  const { filters, query, select: selectFields, sortBy } = paginationParams;
  const { queryBuilder, select: optionsSelect } = options;

  /** @type {import('./pagination.types.jsdoc.js').OffsetPaginationQuery} */
  const offsetQuery = query;
  const limit = Math.min(offsetQuery.limit || config.defaultLimit || 10, config.maxLimit || 100);
  const page = Math.max(offsetQuery.page || 1, 1); // Ensure page is at least 1
  const { offset } = calculatePaginationOffset({ limit, page });

  logger.debug("Offset pagination started", { limit, page, offset });

  // Build query
  const builder = new PaginationQueryBuilder(db, table, config);

  if (optionsSelect) {
    logger.debug("Using optionsSelect", { optionsSelect });
    builder.select(optionsSelect);
  } else {
    logger.debug("Applying select from query params", { selectFields });
    builder.applySelect(selectFields);
  }

  builder.applyFilters(filters).applySorting(sortBy);

  // Apply custom query builder
  if (queryBuilder) {
    queryBuilder(builder);
  }

  // Execute query
  const { entities, itemCount } = await builder.execute({ limit, offset });

  logger.debug("Offset pagination completed", {
    entitiesReturned: entities?.length || 0,
    totalItems: itemCount,
  });

  const response = createPaginatedResponse({
    entities,
    itemCount,
    limit,
    offset,
  });

  return response;
};
