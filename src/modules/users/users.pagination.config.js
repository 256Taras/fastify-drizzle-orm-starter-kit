import { PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.js";

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
  filterableColumns: {
    email: ["$eq", "$ilike", "$in"],
    role: ["$eq", "$in"],
  },
  maxLimit: 100,
  optionalColumns: {
    deletedAt: true,
  },
  sortableColumns: ["email", "firstName", "lastName", "createdAt", "updatedAt"],
  // @ts-expect-error - PAGINATION_STRATEGY.offset is a string literal, but TypeScript sees it as string
  strategy: PAGINATION_STRATEGY.cursor,
};
