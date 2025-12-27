import { bookings } from "./bookings.model.ts";

import { FILTER_OPERATORS, PAGINATION_DEFAULTS, PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.ts";
import type { PaginationConfig } from "#libs/pagination/pagination.types.d.ts";

export const BOOKINGS_PAGINATION_CONFIG: PaginationConfig<typeof bookings, typeof PAGINATION_STRATEGY.cursor> = {
  table: bookings,
  defaultLimit: PAGINATION_DEFAULTS.defaultLimit,
  defaultSortBy: [
    ["startAt", "DESC"],
    ["id", "DESC"],
  ],
  excludeColumns: [],
  filterableColumns: {
    status: [FILTER_OPERATORS.$eq, FILTER_OPERATORS.$in],
    serviceId: [FILTER_OPERATORS.$eq],
    userId: [FILTER_OPERATORS.$eq],
  },
  maxLimit: PAGINATION_DEFAULTS.maxLimit,
  sortableColumns: ["startAt", "endAt", "status", "totalPrice", "createdAt", "id"],
  strategy: PAGINATION_STRATEGY.cursor,
};
