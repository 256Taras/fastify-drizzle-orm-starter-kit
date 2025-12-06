/**
 * @typedef {'offset' | 'cursor'} PaginationStrategy
 */

/**
 * @typedef {'$eq' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$notIn' | '$ilike'} FilterOperator
 */

/**
 * @template T
 * @typedef {object} PaginationConfig
 * @property {T} table - Drizzle table
 * @property {string[]} sortableColumns - Columns that can be sorted
 * @property {string[] | Record<string, FilterOperator[]>} [filterableColumns] - Columns that can be filtered. Can be array of column names or object mapping column names to allowed operators
 * @property {string[]} [searchableColumns] - Columns that can be searched
 * @property {string[]} [selectableColumns] - Columns that can be selected (mutually exclusive with excludeColumns)
 * @property {string[]} [excludeColumns] - Columns to exclude from response and selection (mutually exclusive with selectableColumns)
 * @property {Record<string, boolean>} [optionalColumns] - Columns that should be optional in response {column: true}
 * @property {number} [defaultLimit=10] - Default items per page
 * @property {number} [maxLimit=100] - Maximum items per page
 * @property {Array<[string, 'ASC' | 'DESC']>} [defaultSortBy] - Default sorting
 * @property {PaginationStrategy} [strategy='offset'] - Pagination strategy
 * @property {string} [cursorColumn='id'] - Column to use for cursor (cursor strategy only)
 */

/**
 * @typedef {object} OffsetPaginationQuery
 * @property {number} [page=1] - Current page number
 * @property {number} [limit=10] - Items per page
 */

/**
 * @typedef {object} CursorPaginationQuery
 * @property {number} [limit=10] - Items per page
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
 * @template T
 * @typedef {object} OffsetPaginatedResponse
 * @property {T[]} data - Array of items
 * @property {OffsetPaginationMeta} meta - Pagination metadata
 */

/**
 * @template T
 * @typedef {object} CursorPaginatedResponse
 * @property {T[]} data - Array of items
 * @property {CursorPaginationMeta} meta - Pagination metadata
 */

/**
 * @typedef {object} PaginationParams
 * @property {OffsetPaginationQuery | CursorPaginationQuery} query - Pagination query
 * @property {Record<string, string | string[]>} [filters] - Filter parameters (can be string or array of strings)
 * @property {string[]} [sortBy] - Sort parameters
 * @property {string} [search] - Search query
 * @property {string[]} [select] - Fields to select from querystring
 */

/**
 * @typedef {object} PaginationOptions
 * @property {Record<string, any>} [select] - Columns to select
 * @property {QueryBuilderFunction} [queryBuilder] - Custom query builder function
 */

/**
 * @callback QueryBuilderFunction
 * @param {import('./pagination.query-builder.js').PaginationQueryBuilder} builder - Query builder instance
 * @returns {import('./pagination.query-builder.js').PaginationQueryBuilder} Modified query builder
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
 * @property {'ASC' | 'DESC'} direction - Sort direction
 */

export {};
