import { gt, lt } from "drizzle-orm";

import { BadRequestException } from "#libs/errors/domain.errors.js";

import { PaginationQueryBuilder } from "./pagination.query-builder.js";

/**
 * @typedef {import("./pagination.common-types.jsdoc.js").DrizzleColumn} DrizzleColumn
 *
 * @typedef {import("./pagination.common-types.jsdoc.js").TableColumns} TableColumns
 */

/**
 * Encode cursor to base64
 *
 * @param {Record<string, string | number | boolean | null>} item - Item to encode
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
 *
 * @param {string} cursor - Encoded cursor
 * @returns {Record<string, string | number | boolean | null>} Decoded cursor object
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
 *
 * @template TTable - Drizzle table type (PgTable or similar)
 * @template {"offset" | "cursor"} TStrategy - Pagination strategy
 * @param {PaginationQueryBuilder<TTable, TStrategy>} builder - Query builder
 * @param {TTable} table - Table
 * @param {string} cursorColumn - Cursor column
 * @param {string} cursor - Cursor value
 * @param {"after" | "before"} type - Cursor type
 */
const applyCursorCondition = (builder, table, cursorColumn, cursor, type) => {
  const decoded = decodeCursor(cursor);
  // eslint-disable-next-line security/detect-object-injection
  const value = decoded[cursorColumn];

  if (value === undefined) {
    throw new BadRequestException(`Cursor does not contain column "${cursorColumn}"`);
  }

  // @ts-ignore - table is generic Drizzle type
  const column = /** @type {TableColumns} */ table[cursorColumn];
  if (!column) {
    throw new BadRequestException(`Invalid cursor column "${cursorColumn}"`);
  }

  const condition = type === "after" ? gt(column, value) : lt(column, value);
  builder.where(condition);
};

/**
 * Build query builder for cursor pagination
 *
 * @template TTable - Drizzle table type (PgTable or similar)
 * @param {object} params - Parameters
 * @param {import("#@types/index.jsdoc.js").Dependencies} params.deps - Dependencies
 * @param {TTable} params.table - Table to paginate
 * @param {import("./pagination.types.jsdoc.js").PaginationConfig<TTable, "cursor">} params.config - Pagination config
 * @param {import("./pagination.types.jsdoc.js").PaginationParams<"cursor">} params.paginationParams - Pagination parameters
 * @param {import("./pagination.types.jsdoc.js").PaginationOptions} params.options - Additional options
 * @param {string} params.cursorColumn - Cursor column name
 * @param {string} [params.after] - After cursor
 * @param {string} [params.before] - Before cursor
 * @returns {import("./pagination.query-builder.js").PaginationQueryBuilder<TTable, "cursor">} Configured query builder
 */
const buildCursorQuery = ({ deps, table, config, paginationParams, options, cursorColumn, after, before }) => {
  const { db } = deps;
  const { filters, select: selectFields, sortBy } = paginationParams;
  const { queryBuilder, select: optionsSelect } = options;

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
    queryBuilder(builder);
  }

  return builder;
};

/**
 * Generate cursors from entities
 *
 * @template TItem - Entity type
 * @param {TItem[]} entities - Entities to generate cursors from
 * @param {string} cursorColumn - Cursor column name
 * @returns {{ startCursor?: string; endCursor?: string }} Cursors
 */
const generateCursors = (entities, cursorColumn) => {
  if (entities.length === 0) {
    return { startCursor: undefined, endCursor: undefined };
  }

  const lastEntity = entities.at(-1);
  const firstEntity = entities[0];
  if (!lastEntity || !firstEntity) {
    throw new BadRequestException("Cannot generate cursors for empty entity list");
  }
  return {
    endCursor: encodeCursor(/** @type {Record<string, string | number | boolean | null>} */ lastEntity, cursorColumn),
    startCursor: encodeCursor(/** @type {Record<string, string | number | boolean | null>} */ firstEntity, cursorColumn),
  };
};

/**
 * Cursor-based pagination service
 *
 * @template TTable - Drizzle table type (PgTable or similar)
 * @template TItem - Item type in the response (inferred from table)
 * @param {import("#@types/index.jsdoc.js").Dependencies} deps - Dependencies
 * @param {TTable} table - Table to paginate
 * @param {import("./pagination.types.jsdoc.js").PaginationConfig<TTable, "cursor">} config - Pagination config (must have
 *   strategy 'cursor')
 * @param {import("./pagination.types.jsdoc.js").PaginationParams<"cursor">} paginationParams - Pagination parameters (must
 *   have CursorPaginationQuery)
 * @param {import("./pagination.types.jsdoc.js").PaginationOptions} [options] - Additional options
 * @returns {Promise<import("./pagination.types.jsdoc.js").CursorPaginatedResponse<TItem>>}
 */
export const paginateCursor = async ({ db, logger }, table, config, paginationParams, options = {}) => {
  /** @type {import("./pagination.types.jsdoc.js").CursorPaginationQuery} */
  const cursorQuery = paginationParams.query;
  const { after, before, limit: requestedLimit } = cursorQuery;

  // Note: Mutual exclusivity validation is done in pagination.plugin.js preHandler hook
  const limit = Math.min(requestedLimit || config.defaultLimit || 10, config.maxLimit || 100);
  const cursorColumn = config.cursorColumn || "id";

  logger.debug("Cursor pagination started", {
    after: after || null,
    before: before || null,
    cursorColumn,
    limit,
  });

  const builder = buildCursorQuery({
    after,
    before,
    config,
    cursorColumn,
    // @ts-ignore - partial Dependencies for pagination
    deps: { db, logger },
    options,
    paginationParams,
    table,
  });

  // Fetch one extra item to determine hasNextPage
  const fetchLimit = limit + 1;
  const { entities: rawEntities, itemCount } = await builder.execute({
    limit: fetchLimit,
    offset: 0,
  });

  // Determine if there are more pages
  const hasMoreItems = rawEntities.length > limit;
  const entities = hasMoreItems ? rawEntities.slice(0, limit) : rawEntities;

  const { endCursor, startCursor } = generateCursors(entities, cursorColumn);

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
