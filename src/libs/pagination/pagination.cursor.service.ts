/* eslint-disable security/detect-object-injection, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import type { Cradle } from "@fastify/awilix";
import { gt, lt } from "drizzle-orm";
import type { Column } from "drizzle-orm";

import { BadRequestException } from "#libs/errors/domain.errors.ts";

import { PaginationQueryBuilder } from "./pagination.query-builder.ts";
import type {
  CursorPaginatedResponse,
  PaginationConfig,
  PaginationOptions,
  PaginationParams,
} from "./pagination.types.d.ts";

type DrizzleColumn = Column;
type TableColumns = Record<string, DrizzleColumn>;

/**
 * Encode cursor to base64
 */
const encodeCursor = (item: Record<string, boolean | null | number | string>, cursorColumn: string): string => {
  const value = item[cursorColumn];
  if (value === undefined) {
    throw new Error(`Cursor column "${cursorColumn}" not found in item`);
  }
  return Buffer.from(JSON.stringify({ [cursorColumn]: value })).toString("base64");
};

/**
 * Decode cursor from base64
 */
const decodeCursor = (cursor: string): Record<string, boolean | null | number | string> => {
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
 */
const applyCursorCondition = <TTable, TStrategy extends "cursor" | "offset">(
  builder: PaginationQueryBuilder<TTable, TStrategy>,
  table: TTable,
  cursorColumn: string,
  cursor: string,
  type: "after" | "before",
): void => {
  const decoded = decodeCursor(cursor);
  const value = decoded[cursorColumn];

  if (value === undefined) {
    throw new BadRequestException(`Cursor does not contain column "${cursorColumn}"`);
  }

  // @ts-expect-error - table is generic Drizzle type
  const column = table[cursorColumn] as TableColumns[string];
  if (!column) {
    throw new BadRequestException(`Invalid cursor column "${cursorColumn}"`);
  }

  const condition = type === "after" ? gt(column, value) : lt(column, value);
  builder.where(condition);
};

/**
 * Build query builder for cursor pagination
 */
const buildCursorQuery = <TTable>(params: {
  after?: string;
  before?: string;
  config: PaginationConfig<TTable, "cursor">;
  cursorColumn: string;
  deps: Cradle;
  options: PaginationOptions;
  paginationParams: PaginationParams<"cursor">;
  table: TTable;
}): PaginationQueryBuilder<TTable, "cursor"> => {
  const { db } = params.deps;
  const { filters, select: selectFields, sortBy } = params.paginationParams;
  const { queryBuilder, select: optionsSelect } = params.options;

  const builder = new PaginationQueryBuilder(db, params.table, params.config);

  if (optionsSelect) {
    // @ts-expect-error - Drizzle column types are complex and don't fully match generic constraints
    builder.select(optionsSelect);
  } else {
    builder.applySelect(selectFields);
  }

  builder.applyFilters(filters).applySorting(sortBy);

  // Apply cursor conditions
  if (params.after) {
    applyCursorCondition(builder, params.table, params.cursorColumn, params.after, "after");
  } else if (params.before) {
    applyCursorCondition(builder, params.table, params.cursorColumn, params.before, "before");
  }

  // Apply custom query builder
  if (queryBuilder) {
    queryBuilder(builder);
  }

  return builder;
};

/**
 * Generate cursors from entities
 */
const generateCursors = <TItem>(entities: TItem[], cursorColumn: string): { endCursor?: string; startCursor?: string } => {
  if (entities.length === 0) {
    return { startCursor: undefined, endCursor: undefined };
  }

  const lastEntity = entities.at(-1);
  const firstEntity = entities[0];
  if (!lastEntity || !firstEntity) {
    throw new BadRequestException("Cannot generate cursors for empty entity list");
  }
  return {
    endCursor: encodeCursor(lastEntity as Record<string, boolean | null | number | string>, cursorColumn),
    startCursor: encodeCursor(firstEntity as Record<string, boolean | null | number | string>, cursorColumn),
  };
};

/**
 * Cursor-based pagination service
 */
export const paginateCursor = async <TTable, TItem>(
  { db, logger }: Cradle,
  table: TTable,
  config: PaginationConfig<TTable, "cursor">,
  paginationParams: PaginationParams<"cursor">,
  options: PaginationOptions = {},
): Promise<CursorPaginatedResponse<TItem>> => {
  const cursorQuery = paginationParams.query;
  const { after, before, limit: requestedLimit } = cursorQuery;

  // Note: Mutual exclusivity validation is done in pagination.plugin.ts preHandler hook
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
    deps: { db, logger } as Cradle,
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
    // @ts-expect-error - Generic type TItem cannot be guaranteed to match unknown[] from query
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
