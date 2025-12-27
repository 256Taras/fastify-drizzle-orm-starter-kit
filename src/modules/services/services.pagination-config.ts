import { services } from "./services.model.ts";

import { FILTER_OPERATORS, PAGINATION_DEFAULTS, PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.ts";
import type { PaginationConfig } from "#libs/pagination/pagination.types.d.ts";

export const SERVICES_PAGINATION_CONFIG: PaginationConfig<typeof services, typeof PAGINATION_STRATEGY.offset> = {
  table: services,
  defaultLimit: PAGINATION_DEFAULTS.defaultLimit,
  defaultSortBy: [
    ["createdAt", "DESC"],
    ["id", "DESC"],
  ],
  excludeColumns: ["deletedAt"],
  filterableColumns: {
    name: [FILTER_OPERATORS.$eq, FILTER_OPERATORS.$ilike],
    status: [FILTER_OPERATORS.$eq, FILTER_OPERATORS.$in],
    providerId: [FILTER_OPERATORS.$eq],
  },
  maxLimit: PAGINATION_DEFAULTS.maxLimit,
  sortableColumns: ["name", "price", "duration", "status", "createdAt", "updatedAt", "id"],
  strategy: PAGINATION_STRATEGY.offset,
};
