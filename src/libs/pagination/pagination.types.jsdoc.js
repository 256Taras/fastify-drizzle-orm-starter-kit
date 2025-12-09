/** @typedef {"offset" | "cursor"} PaginationStrategy */

/** @typedef {"$eq" | "$gt" | "$gte" | "$lt" | "$lte" | "$in" | "$notIn" | "$ilike"} FilterOperator */

/**
 * @template TTable - Drizzle table type (PgTable or similar)
 * @template {"offset" | "cursor"} [TStrategy='offset'] - Pagination strategy type. Default is `'offset'`
 * @typedef {object} PaginationConfig
 * @property {TTable} table - Drizzle table instance
 * @property {string[]} sortableColumns - Columns that can be sorted
 * @property {string[] | Record<string, FilterOperator[]>} [filterableColumns] - Columns that can be filtered. Can be array
 *   of column names or object mapping column names to allowed operators. Enum values are automatically extracted from table
 *   schema.
 * @property {string[]} [selectableColumns] - Columns that can be selected (mutually exclusive with excludeColumns)
 * @property {string[]} [excludeColumns] - Columns to exclude from response and selection (mutually exclusive with
 *   selectableColumns)
 * @property {Record<string, boolean>} [optionalColumns] - Columns that should be optional in response {column: true}
 * @property {number} [defaultLimit=10] - Default items per page. Default is `10`
 * @property {number} [maxLimit=100] - Maximum items per page. Default is `100`
 * @property {[string, "ASC" | "DESC"][]} [defaultSortBy] - Default sorting
 * @property {TStrategy} [strategy='offset'] - Pagination strategy. Default is `'offset'`
 * @property {string} [cursorColumn='id'] - Column to use for cursor (cursor strategy only). Default is `'id'`
 */

/**
 * @typedef {object} OffsetPaginationQuery
 * @property {number} [page=1] - Current page number. Default is `1`
 * @property {number} [limit=10] - Items per page. Default is `10`
 */

/**
 * @typedef {object} CursorPaginationQuery
 * @property {number} [limit=10] - Items per page. Default is `10`
 * @property {string} [after] - Cursor for next page
 * @property {string} [before] - Cursor for previous page
 */

/**
 * @typedef {object} OffsetPaginationMeta
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} itemCount - Total number of items
 * @property {number} pageCount - Total number of pages
 * @property {boolean} hasPreviousPage - Whether there is a previous page
 * @property {boolean} hasNextPage - Whether there is a next page
 */

/**
 * @typedef {object} CursorPaginationMeta
 * @property {number} limit - Items per page
 * @property {number} itemCount - Total number of items
 * @property {string} [startCursor] - Cursor for first item
 * @property {string} [endCursor] - Cursor for last item
 * @property {boolean} hasPreviousPage - Whether there is a previous page
 * @property {boolean} hasNextPage - Whether there is a next page
 */

/**
 * @template {any} TItem - Item type in the response
 * @typedef {object} OffsetPaginatedResponse
 * @property {TItem[]} data - Array of items
 * @property {OffsetPaginationMeta} meta - Pagination metadata
 */

/**
 * @template TItem - Item type in the response
 * @typedef {object} CursorPaginatedResponse
 * @property {TItem[]} data - Array of items
 * @property {CursorPaginationMeta} meta - Pagination metadata
 */

/**
 * Union type for paginated response (depends on strategy)
 *
 * @template TItem - Item type in the response
 * @template {"offset" | "cursor"} [TStrategy='offset'] - Pagination strategy. Default is `'offset'`
 * @typedef {TStrategy extends "offset"
 *   ? OffsetPaginatedResponse<TItem>
 *   : TStrategy extends "cursor"
 *     ? CursorPaginatedResponse<TItem>
 *     : OffsetPaginatedResponse<TItem> | CursorPaginatedResponse<TItem>} PaginatedResponse
 */

/**
 * @template {"offset" | "cursor"} [TStrategy='offset'] - Pagination strategy. Default is `'offset'`
 * @typedef {object} PaginationParams
 * @property {TStrategy extends "offset"
 *   ? OffsetPaginationQuery
 *   : TStrategy extends "cursor"
 *     ? CursorPaginationQuery
 *     : OffsetPaginationQuery | CursorPaginationQuery} query
 *   - Pagination query (type depends on strategy)
 *
 * @property {Record<string, string | string[]>} [filters] - Filter parameters (can be string or array of strings)
 * @property {string[]} [sortBy] - Sort parameters
 * @property {string[]} [select] - Fields to select from querystring
 */

/**
 * @template TTable - Drizzle table type
 * @template {"offset" | "cursor"} [TStrategy='offset'] - Pagination strategy. Default is `'offset'`
 * @callback QueryBuilderFunction
 * @param {import("./pagination.query-builder.js").PaginationQueryBuilder<TTable, TStrategy>} builder - Query builder
 *   instance
 * @returns {import("./pagination.query-builder.js").PaginationQueryBuilder<TTable, TStrategy>} Modified query builder
 */

/**
 * @typedef {object} PaginationOptions
 * @property {Record<string, any>} [select] - Columns to select
 * @property {QueryBuilderFunction<any, any>} [queryBuilder] - Custom query builder function
 */

/**
 * @typedef {object} QueryExecutionResult
 * @property {any[]} entities - Retrieved entities
 * @property {number} itemCount - Total count of items
 */

/**
 * @typedef {object} ParsedFilterValue
 * @property {FilterOperator} operator - Filter operator
 * @property {any} value - Parsed value
 */

/**
 * @typedef {object} SortParam
 * @property {string} column - Column name
 * @property {"ASC" | "DESC"} direction - Sort direction
 */

export {};
