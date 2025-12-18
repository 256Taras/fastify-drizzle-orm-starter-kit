import { PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.ts";
import type { PaginationConfig } from "#libs/pagination/pagination.types.d.ts";

import { users } from "./users.model.ts";

export const USERS_PAGINATION_CONFIG: PaginationConfig<typeof users> = {
  table: users,
  defaultLimit: 10,
  defaultSortBy: [
    ["createdAt", "DESC"],
    ["id", "DESC"],
  ],
  excludeColumns: ["password"],
  filterableColumns: {
    email: ["$eq", "$ilike", "$in"],
    role: ["$eq", "$in"],
  },
  maxLimit: 100,
  optionalColumns: {
    deletedAt: true,
  },
  sortableColumns: ["email", "firstName", "lastName", "createdAt", "updatedAt", "id"],
  strategy: PAGINATION_STRATEGY.offset,
};
