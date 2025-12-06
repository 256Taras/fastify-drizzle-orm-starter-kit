import { gt, lt } from "drizzle-orm";

import { BadRequestException } from "#libs/errors/domain.errors.js";

import { PaginationQueryBuilder } from "./pagination.query-builder.js";

/**
 * Encode cursor to base64
 * @param {Record<string, any>} item - Item to encode
 * @param {string} cursorColumn - Column to use as cursor
 * @returns {string} Encoded cursor
 */
const encodeCursor = (item, cursorColumn) => {
  // eslint-disable-next-line security/detect-object-injection
  const value = item[cursorColumn];
  return Buffer.from(JSON.stringify({ [cursorColumn]: value })).toString("base64");
};

/**
 * Decode cursor from base64
 * @param {string} cursor - Encoded cursor
 * @returns {Record<string, any>} Decoded cursor object
 * @throws {BadRequestException} If cursor is invalid
 */
const decodeCursor = (cursor) => {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
  } catch {
    throw new BadRequestException("Invalid cursor");
  }
};

/**
 * Cursor-based pagination service
 * @param {import("#@types/index.jsdoc.js").Dependencies} deps - Dependencies
 * @param {any} table - Table to paginate
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<any>} config - Pagination config
 * @param {import('./pagination.types.jsdoc.js').PaginationParams} paginationParams - Pagination parameters
 * @param {import('./pagination.types.jsdoc.js').PaginationOptions} [options] - Additional options
 * @returns {Promise<import('./pagination.types.jsdoc.js').CursorPaginatedResponse<any>>}
 */
export const paginateCursor = async ({ db, logger }, table, config, paginationParams, options = {}) => {
  const { filters, query, search, select: selectFields, sortBy } = paginationParams;
  const { queryBuilder, select: optionsSelect } = options;
  /** @type {import('./pagination.types.jsdoc.js').CursorPaginationQuery} */
  const cursorQuery = query;
  const { after, before, limit: requestedLimit } = cursorQuery;

  const limit = Math.min(requestedLimit || config.defaultLimit || 10, config.maxLimit || 100);

  const cursorColumn = config.cursorColumn || "id";

  logger.debug(`Cursor pagination: limit=${limit}, after=${after || "none"}, before=${before || "none"}`);

  const builder = new PaginationQueryBuilder(db, table, config);

  if (optionsSelect) {
    builder.select(optionsSelect);
  } else {
    builder.applySelect(selectFields);
  }

  builder.applyFilters(filters).applySearch(search).applySorting(sortBy);

  if (after) {
    const decoded = decodeCursor(after);
    // eslint-disable-next-line security/detect-object-injection
    const value = decoded[cursorColumn];
    // eslint-disable-next-line security/detect-object-injection
    builder.where(gt(table[cursorColumn], value));
  } else if (before) {
    const decoded = decodeCursor(before);
    // eslint-disable-next-line security/detect-object-injection
    const value = decoded[cursorColumn];
    // eslint-disable-next-line security/detect-object-injection
    builder.where(lt(table[cursorColumn], value));
  }

  if (queryBuilder) {
    queryBuilder(builder);
  }

  const fetchLimit = limit + 1;
  const { entities: rawEntities, itemCount } = await builder.execute({
    limit: fetchLimit,
    offset: 0,
  });

  const hasNextPage = rawEntities.length > limit;
  const entities = hasNextPage ? rawEntities.slice(0, limit) : rawEntities;

  const startCursor = entities.length > 0 ? encodeCursor(entities[0], cursorColumn) : undefined;
  const endCursor = entities.length > 0 ? encodeCursor(entities.at(-1), cursorColumn) : undefined;

  logger.debug(`Found ${itemCount} total items, returning ${entities.length} items`);

  return {
    data: entities,
    meta: {
      endCursor,
      hasNextPage,
      hasPreviousPage: Boolean(after),
      itemCount,
      limit,
      startCursor,
    },
  };
};
