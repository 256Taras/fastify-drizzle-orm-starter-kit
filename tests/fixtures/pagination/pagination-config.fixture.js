/**
 * @file Pagination config fixtures for testing
 */

import { FILTER_OPERATORS, PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.js";
import { users } from "#modules/users/users.model.js";

/**
 * Basic offset pagination config
 */
export const BASIC_OFFSET_CONFIG = {
  table: users,
  defaultLimit: 10,
  maxLimit: 100,
  defaultSortBy: [["createdAt", "DESC"]],
  sortableColumns: ["id", "email", "createdAt"],
  searchableColumns: ["email"],
  strategy: PAGINATION_STRATEGY.offset,
};

/**
 * Cursor pagination config
 */
export const BASIC_CURSOR_CONFIG = {
  table: users,
  defaultLimit: 10,
  maxLimit: 100,
  defaultSortBy: [["id", "ASC"]],
  sortableColumns: ["id", "email", "createdAt"],
  searchableColumns: ["email"],
  strategy: PAGINATION_STRATEGY.cursor,
  cursorColumn: "id",
};

/**
 * Config with filterable columns (array format)
 */
export const FILTERABLE_ARRAY_CONFIG = {
  ...BASIC_OFFSET_CONFIG,
  filterableColumns: ["email", "role"],
};

/**
 * Config with filterable columns (object format with operators)
 */
export const FILTERABLE_OBJECT_CONFIG = {
  ...BASIC_OFFSET_CONFIG,
  filterableColumns: {
    email: [FILTER_OPERATORS.eq, FILTER_OPERATORS.ilike, FILTER_OPERATORS.in],
    role: [FILTER_OPERATORS.eq, FILTER_OPERATORS.in],
  },
};

/**
 * Config with excludeColumns
 */
export const EXCLUDE_COLUMNS_CONFIG = {
  ...BASIC_OFFSET_CONFIG,
  excludeColumns: ["password", "deletedAt"],
};

/**
 * Config with selectableColumns
 */
export const SELECTABLE_COLUMNS_CONFIG = {
  ...BASIC_OFFSET_CONFIG,
  selectableColumns: ["id", "email", "firstName", "lastName"],
};

/**
 * Config with optionalColumns
 */
export const OPTIONAL_COLUMNS_CONFIG = {
  ...BASIC_OFFSET_CONFIG,
  optionalColumns: {
    deletedAt: true,
    updatedAt: true,
  },
};
