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
  if (value === undefined) {
    throw new Error(`Cursor column "${cursorColumn}" not found in item`);
  }
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
    const decoded = JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
    if (!decoded || typeof decoded !== "object") {
      throw new Error("Invalid cursor format");
    }
    return decoded;
  } catch {
    throw new BadRequestException("Invalid cursor format");
  }
};

/**
 * Apply cursor condition to query builder
 * @template {any} TTable - Drizzle table type
 * @template {'offset' | 'cursor'} TStrategy - Pagination strategy
 * @param {PaginationQueryBuilder<TTable, TStrategy>} builder - Query builder
 * @param {any} table - Table
 * @param {string} cursorColumn - Cursor column
 * @param {string} cursor - Cursor value
 * @param {'after' | 'before'} type - Cursor type
 */
const applyCursorCondition = (builder, table, cursorColumn, cursor, type) => {
  const decoded = decodeCursor(cursor);
  // eslint-disable-next-line security/detect-object-injection
  const value = decoded[cursorColumn];

  if (value === undefined) {
    throw new BadRequestException(`Cursor does not contain column "${cursorColumn}"`);
  }

  // eslint-disable-next-line security/detect-object-injection
  const column = table[cursorColumn];
  if (!column) {
    throw new BadRequestException(`Invalid cursor column "${cursorColumn}"`);
  }

  const condition = type === "after" ? gt(column, value) : lt(column, value);
  builder.where(condition);
};

/**
 * Cursor-based pagination service
 * @template {any} TTable - Drizzle table type
 * @template {any} [TItem=any] - Item type in the response
 * @param {import("#@types/index.jsdoc.js").Dependencies} deps - Dependencies
 * @param {TTable} table - Table to paginate
 * @param {import('./pagination.types.jsdoc.js').PaginationConfig<TTable, 'cursor'>} config - Pagination config (must have strategy 'cursor')
 * @param {import('./pagination.types.jsdoc.js').PaginationParams<'cursor'>} paginationParams - Pagination parameters (must have CursorPaginationQuery)
 * @param {import('./pagination.types.jsdoc.js').PaginationOptions} [options] - Additional options
 * @returns {Promise<import('./pagination.types.jsdoc.js').CursorPaginatedResponse<TItem>>}
 */
export const paginateCursor = async ({ db, logger }, table, config, paginationParams, options = {}) => {
  const { filters, query, select: selectFields, sortBy } = paginationParams;
  const { queryBuilder, select: optionsSelect } = options;

  /** @type {import('./pagination.types.jsdoc.js').CursorPaginationQuery} */
  const cursorQuery = query;
  const { after, before, limit: requestedLimit } = cursorQuery;

  // Validate mutually exclusive cursors
  if (after && before) {
    throw new BadRequestException("Cannot use both 'after' and 'before' cursors simultaneously");
  }

  const limit = Math.min(requestedLimit || config.defaultLimit || 10, config.maxLimit || 100);
  const cursorColumn = config.cursorColumn || "id";

  logger.debug("Cursor pagination started", {
    after: after || null,
    before: before || null,
    cursorColumn,
    limit,
  });

  // Build query
  const builder = new PaginationQueryBuilder(db, table, config);

  if (optionsSelect) {
    builder.select(optionsSelect);
  } else {
    builder.applySelect(selectFields);
  }

  builder.applyFilters(filters).applySorting(sortBy);

  // Apply cursor conditions
  if (after) {
    applyCursorCondition(builder, table, cursorColumn, after, "after");
  } else if (before) {
    applyCursorCondition(builder, table, cursorColumn, before, "before");
  }

  // Apply custom query builder
  if (queryBuilder) {
    // @ts-expect-error - queryBuilder accepts any PaginationQueryBuilder variant
    queryBuilder(builder);
  }

  // Fetch one extra item to determine hasNextPage
  const fetchLimit = limit + 1;
  const { entities: rawEntities, itemCount } = await builder.execute({
    limit: fetchLimit,
    offset: 0,
  });

  // Determine if there are more pages
  const hasMoreItems = rawEntities.length > limit;
  const entities = hasMoreItems ? rawEntities.slice(0, limit) : rawEntities;

  // Generate cursors
  const startCursor = entities.length > 0 ? encodeCursor(entities[0], cursorColumn) : undefined;
  const endCursor = entities.length > 0 ? encodeCursor(entities.at(-1), cursorColumn) : undefined;

  logger.debug("Cursor pagination completed", {
    entitiesReturned: entities.length,
    hasMoreItems,
    totalItems: itemCount,
  });

  return {
    data: entities,
    meta: {
      endCursor,
      hasNextPage: hasMoreItems,
      hasPreviousPage: Boolean(after || before),
      itemCount,
      limit,
      startCursor,
    },
  };
};
