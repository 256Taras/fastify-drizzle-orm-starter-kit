import { providers } from "./providers.model.ts";

import { FILTER_OPERATORS, PAGINATION_DEFAULTS, PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.ts";
import type { PaginationConfig } from "#libs/pagination/pagination.types.d.ts";

export const PROVIDERS_PAGINATION_CONFIG: PaginationConfig<typeof providers, typeof PAGINATION_STRATEGY.offset> = {
  table: providers,
  defaultLimit: PAGINATION_DEFAULTS.defaultLimit,
  defaultSortBy: [
    ["createdAt", "DESC"],
    ["id", "DESC"],
  ],
  excludeColumns: ["deletedAt"],
  filterableColumns: {
    name: [FILTER_OPERATORS.$eq, FILTER_OPERATORS.$ilike],
    isVerified: [FILTER_OPERATORS.$eq],
  },
  maxLimit: PAGINATION_DEFAULTS.maxLimit,
  sortableColumns: ["name", "rating", "reviewsCount", "createdAt", "updatedAt", "id"],
  strategy: PAGINATION_STRATEGY.offset,
};
