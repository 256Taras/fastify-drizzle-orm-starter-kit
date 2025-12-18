import type { Cradle } from "@fastify/awilix";

import { PaginationQueryBuilder } from "./pagination.query-builder.ts";
import type {
  OffsetPaginatedResponse,
  PaginationConfig,
  PaginationOptions,
  PaginationParams,
} from "./pagination.types.d.ts";
import { calculatePaginationOffset, createPaginatedResponse } from "./pagination.utils.ts";

/**
 * Offset-based pagination service
 */
export const paginateOffset = async <TTable, TItem>(
  { db, logger }: Cradle,
  table: TTable,
  config: PaginationConfig<TTable, "offset">,
  paginationParams: PaginationParams<"offset">,
  options: PaginationOptions = {},
): Promise<OffsetPaginatedResponse<TItem>> => {
  if (!paginationParams) {
    logger.error("paginationParams is undefined", { config, options, table });
    throw new Error("paginationParams is required");
  }

  const { filters, query, select: selectFields, sortBy } = paginationParams;
  const { queryBuilder, select: optionsSelect } = options;

  const offsetQuery = query;
  const limit = Math.min(offsetQuery.limit || config.defaultLimit || 10, config.maxLimit || 100);
  const page = Math.max(offsetQuery.page || 1, 1); // Ensure page is at least 1
  const { offset } = calculatePaginationOffset({ limit, page });

  logger.debug("Offset pagination started", { limit, page, offset });

  // Build query
  const builder = new PaginationQueryBuilder(db, table, config);

  if (optionsSelect) {
    logger.debug("Using optionsSelect", { optionsSelect });
    // @ts-expect-error - Drizzle column types are complex and don't fully match generic constraints
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

  // @ts-expect-error - Generic type TItem cannot be guaranteed to match unknown[] from query
  return response;
};
