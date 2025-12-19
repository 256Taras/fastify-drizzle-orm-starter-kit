import type { PaginationQueryBuilder } from "./pagination.query-builder.ts";

/**
 * Cursor paginated response
 *
 * @template TItem - Item type in the response
 */
export interface CursorPaginatedResponse<TItem> {
  /** Array of items */
  data: TItem[];
  /** Pagination metadata */
  meta: CursorPaginationMeta;
}

/**
 * Cursor pagination metadata
 */
export interface CursorPaginationMeta {
  /** Cursor for last item */
  endCursor?: string;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  /** Total number of items */
  itemCount: number;
  /** Items per page */
  limit: number;
  /** Cursor for first item */
  startCursor?: string;
}

/**
 * Cursor pagination query
 */
export interface CursorPaginationQuery {
  /** Cursor for next page */
  after?: string;
  /** Cursor for previous page */
  before?: string;
  /** Items per page. Default is `10` */
  limit?: number;
}

/** Filter operator type */
export type FilterOperator = "$eq" | "$gt" | "$gte" | "$ilike" | "$in" | "$lt" | "$lte" | "$notIn";

/**
 * Offset paginated response
 *
 * @template TItem - Item type in the response
 */
export interface OffsetPaginatedResponse<TItem> {
  /** Array of items */
  data: TItem[];
  /** Pagination metadata */
  meta: OffsetPaginationMeta;
}

/**
 * Offset pagination metadata
 */
export interface OffsetPaginationMeta {
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
  /** Total number of items */
  itemCount: number;
  /** Items per page */
  limit: number;
  /** Current page number */
  page: number;
  /** Total number of pages */
  pageCount: number;
}

/**
 * Offset pagination query
 */
export interface OffsetPaginationQuery {
  /** Items per page. Default is `10` */
  limit?: number;
  /** Current page number. Default is `1` */
  page?: number;
}

/**
 * Union type for paginated response (depends on strategy)
 *
 * @template TItem - Item type in the response
 * @template TStrategy - Pagination strategy. Default is `'offset'`
 */
export type PaginatedResponse<TItem, TStrategy extends PaginationStrategy = "offset"> = TStrategy extends "offset"
  ? OffsetPaginatedResponse<TItem>
  : TStrategy extends "cursor"
    ? CursorPaginatedResponse<TItem>
    : CursorPaginatedResponse<TItem> | OffsetPaginatedResponse<TItem>;

/**
 * Pagination configuration
 *
 * @template TTable - Drizzle table type (PgTable or similar)
 * @template TStrategy - Pagination strategy type. Default is `'offset'`
 */
export interface PaginationConfig<TTable, TStrategy extends PaginationStrategy = "offset"> {
  /** Column to use for cursor (cursor strategy only). Default is `'id'` */
  cursorColumn?: string;
  /** Default items per page. Default is `10` */
  defaultLimit?: number;
  /** Default sorting */
  defaultSortBy?: [string, "ASC" | "DESC"][];
  /** Columns to exclude from response and selection (mutually exclusive with selectableColumns) */
  excludeColumns?: string[];
  /**
   * Columns that can be filtered. Can be array of column names or object mapping column names to allowed operators.
   * Enum values are automatically extracted from table schema.
   */
  filterableColumns?: Record<string, FilterOperator[]> | string[];
  /** Maximum items per page. Default is `100` */
  maxLimit?: number;
  /** Columns that should be optional in response {column: true} */
  optionalColumns?: Record<string, boolean>;
  /** Columns that can be selected (mutually exclusive with excludeColumns) */
  selectableColumns?: string[];
  /** Columns that can be sorted */
  sortableColumns: string[];
  /** Pagination strategy. Default is `'offset'` */
  strategy?: TStrategy;
  /** Drizzle table instance */
  table: TTable;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  /** Custom query builder function */
  queryBuilder?: QueryBuilderFunction<unknown, unknown>;
  /** Columns to select */
  select?: Record<string, unknown>;
}

/**
 * Pagination parameters
 *
 * @template TStrategy - Pagination strategy. Default is `'offset'`
 */
export interface PaginationParams<TStrategy extends PaginationStrategy = "offset"> {
  /** Filter parameters (can be string or array of strings) */
  filters?: Record<string, string | string[]>;
  /**
   * Pagination query (type depends on strategy)
   */
  query: TStrategy extends "offset"
    ? OffsetPaginationQuery
    : TStrategy extends "cursor"
      ? CursorPaginationQuery
      : CursorPaginationQuery | OffsetPaginationQuery;
  /** Fields to select from querystring */
  select?: string[];
  /** Sort parameters */
  sortBy?: string[];
}

/** Pagination strategy type */
export type PaginationStrategy = "cursor" | "offset";

/**
 * Parsed filter value
 */
export interface ParsedFilterValue {
  /** Filter operator */
  operator: FilterOperator;
  /** Parsed value */
  value: unknown;
}

/**
 * Query builder function type
 *
 * @template TTable - Drizzle table type
 * @template TStrategy - Pagination strategy. Default is `'offset'`
 */
export type QueryBuilderFunction<TTable, TStrategy extends PaginationStrategy = "offset"> = (
  builder: PaginationQueryBuilder<TTable, TStrategy>,
) => PaginationQueryBuilder<TTable, TStrategy>;

/**
 * Query execution result
 */
export interface QueryExecutionResult {
  /** Retrieved entities */
  entities: unknown[];
  /** Total count of items */
  itemCount: number;
}

/**
 * Sort parameter
 */
export interface SortParam {
  /** Column name */
  column: string;
  /** Sort direction */
  direction: "ASC" | "DESC";
}

// Declaration merging for DI container
declare module "@fastify/awilix" {
  interface Cradle {
    paginationService: ReturnType<typeof import("./pagination.service.ts").default>;
  }
}
