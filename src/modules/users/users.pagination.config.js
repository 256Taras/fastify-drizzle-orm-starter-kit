import { FILTER_OPERATORS, PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.js";

import { users } from "./users.model.js";

/**
 * Pagination configuration for users module
 * @type {import("#libs/pagination/pagination.types.jsdoc.js").PaginationConfig<typeof users>}
 */
export const USERS_PAGINATION_CONFIG = {
  table: users,
  defaultLimit: 10,
  defaultSortBy: [["createdAt", "DESC"]],
  excludeColumns: ["password"],
  // Filterable columns with allowed operators per column
  // Supports both simple columns and nested fields (e.g., 'student.email', 'course.id')
  // @ts-expect-error - TypeScript doesn't infer FilterOperator[] from type assertions, but runtime values are correct
  filterableColumns: {
    // Email can be filtered with equality, case-insensitive search, or in array
    email: [
      /** @type {import('#libs/pagination/pagination.types.jsdoc.js').FilterOperator} */ FILTER_OPERATORS.eq,
      /** @type {import('#libs/pagination/pagination.types.jsdoc.js').FilterOperator} */ FILTER_OPERATORS.ilike,
      /** @type {import('#libs/pagination/pagination.types.jsdoc.js').FilterOperator} */ FILTER_OPERATORS.in,
    ],
    // Role can only be filtered with equality or in array (no partial search)
    role: [
      /** @type {import('#libs/pagination/pagination.types.jsdoc.js').FilterOperator} */ FILTER_OPERATORS.eq,
      /** @type {import('#libs/pagination/pagination.types.jsdoc.js').FilterOperator} */ FILTER_OPERATORS.in,
    ],
    // Example of nested field filtering (if you had relations):
    // 'student.email': [FILTER_OPERATORS.ilike],
    // 'student.groups.title': [FILTER_OPERATORS.ilike],
    // 'course.id': [FILTER_OPERATORS.eq],
  },
  maxLimit: 100,
  optionalColumns: {
    deletedAt: true,
  },
  searchableColumns: ["email", "firstName", "lastName"],
  sortableColumns: ["email", "firstName", "lastName", "createdAt", "updatedAt"],
  // @ts-expect-error - PAGINATION_STRATEGY.offset is a string literal that matches PaginationStrategy type
  strategy: PAGINATION_STRATEGY.offset,
};
