import { users } from "./users.model.ts";

import { FILTER_OPERATORS, PAGINATION_DEFAULTS, PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.ts";
import type { PaginationConfig } from "#libs/pagination/pagination.types.d.ts";

export const USERS_PAGINATION_CONFIG: PaginationConfig<typeof users, "offset"> = {
  table: users,
  defaultLimit: PAGINATION_DEFAULTS.defaultLimit,
  defaultSortBy: [
    ["createdAt", "DESC"],
    ["id", "DESC"],
  ],
  excludeColumns: ["password"],
  filterableColumns: {
    email: [FILTER_OPERATORS.$eq, FILTER_OPERATORS.$ilike, FILTER_OPERATORS.$in],
    role: [FILTER_OPERATORS.$eq, FILTER_OPERATORS.$in],
  },
  maxLimit: PAGINATION_DEFAULTS.maxLimit,
  optionalColumns: {
    deletedAt: true,
  },
  sortableColumns: ["email", "firstName", "lastName", "createdAt", "updatedAt", "id"],
  strategy: PAGINATION_STRATEGY.offset,
};
