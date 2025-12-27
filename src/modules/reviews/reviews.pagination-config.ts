import { reviews } from "./reviews.model.ts";

import { FILTER_OPERATORS, PAGINATION_DEFAULTS, PAGINATION_STRATEGY } from "#libs/pagination/pagination.contracts.ts";
import type { PaginationConfig } from "#libs/pagination/pagination.types.d.ts";

export const REVIEWS_PAGINATION_CONFIG: PaginationConfig<typeof reviews, typeof PAGINATION_STRATEGY.offset> = {
  table: reviews,
  defaultLimit: PAGINATION_DEFAULTS.defaultLimit,
  defaultSortBy: [
    ["createdAt", "DESC"],
    ["id", "DESC"],
  ],
  excludeColumns: [],
  filterableColumns: {
    serviceId: [FILTER_OPERATORS.$eq],
    rating: [FILTER_OPERATORS.$eq, FILTER_OPERATORS.$gte, FILTER_OPERATORS.$lte],
  },
  maxLimit: PAGINATION_DEFAULTS.maxLimit,
  sortableColumns: ["rating", "createdAt", "id"],
  strategy: PAGINATION_STRATEGY.offset,
};
