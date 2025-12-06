import { calculatePaginationOffset, createPaginatedResponse } from "#libs/utils/pagination.js";

import { PaginationQueryBuilder } from "./pagination.query-builder.js";

/**
 * Offset-based pagination service
 * @param {import("#@types/index.jsdoc.js").Dependencies} deps - Dependencies
 * @param {any} table - Table to paginate
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<any>} config - Pagination config
 * @param {import('./pagination.types.jsdoc.js').PaginationParams} paginationParams - Pagination parameters
 * @param {import('./pagination.types.jsdoc.js').PaginationOptions} [options] - Additional options
 * @returns {Promise<import('./pagination.types.jsdoc.js').OffsetPaginatedResponse<any>>}
 */
export const paginateOffset = async ({ db, logger }, table, config, paginationParams, options = {}) => {
  const { filters, query, search, select: selectFields, sortBy } = paginationParams;
  const { queryBuilder, select: optionsSelect } = options;

  /** @type {import('./pagination.types.jsdoc.js').OffsetPaginationQuery} */
  const offsetQuery = query;
  const limit = Math.min(offsetQuery.limit || config.defaultLimit || 10, config.maxLimit || 100);
  const page = offsetQuery.page || 1;
  const { offset } = calculatePaginationOffset({ limit, page });

  logger.debug(`Offset pagination: page=${page}, limit=${limit}`);

  const builder = new PaginationQueryBuilder(db, table, config);

  if (optionsSelect) {
    builder.select(optionsSelect);
  } else {
    builder.applySelect(selectFields);
  }

  builder.applyFilters(filters).applySearch(search).applySorting(sortBy);

  if (queryBuilder) {
    queryBuilder(builder);
  }

  const { entities, itemCount } = await builder.execute({ limit, offset });

  logger.debug(`Found ${itemCount} items`);

  return createPaginatedResponse({
    entities,
    itemCount,
    limit,
    offset,
  });
};
