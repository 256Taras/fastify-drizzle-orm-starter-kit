import { Type } from "@sinclair/typebox";

/**
 * Filter operators for different data types
 */
export const FILTER_OPERATORS = {
  eq: "$eq",
  gt: "$gt",
  gte: "$gte",
  ilike: "$ilike",
  in: "$in",
  lt: "$lt",
  lte: "$lte",
  notIn: "$notIn",
};

/**
 * Pagination strategies
 */
export const PAGINATION_STRATEGY = {
  cursor: "cursor",
  offset: "offset",
};

/**
 * Base pagination meta
 */
const basePaginationMeta = {
  itemCount: Type.Integer({
    description: "Total number of items across all pages",
    examples: [100, 250, 1000],
    minimum: 0,
    title: "Item Count",
  }),
  limit: Type.Integer({
    description: "Number of items per page",
    examples: [10, 20, 50],
    minimum: 1,
    title: "Limit",
  }),
};

/**
 * Offset pagination meta contract
 */
export const OFFSET_PAGINATION_META_CONTRACT = Type.Object(
  {
    ...basePaginationMeta,
    hasNextPage: Type.Boolean({
      description: "Whether there is a next page available",
      title: "Has Next Page",
    }),
    hasPreviousPage: Type.Boolean({
      description: "Whether there is a previous page available",
      title: "Has Previous Page",
    }),
    page: Type.Integer({
      description: "Current page number (1-based)",
      examples: [1, 2, 3],
      minimum: 1,
      title: "Page",
    }),
    pageCount: Type.Integer({
      description: "Total number of pages",
      examples: [10, 25, 50],
      minimum: 0,
      title: "Page Count",
    }),
  },
  { additionalProperties: false },
);

/**
 * Cursor pagination meta contract
 */
export const CURSOR_PAGINATION_META_CONTRACT = Type.Object(
  {
    ...basePaginationMeta,
    endCursor: Type.Optional(
      Type.String({
        description: "Cursor pointing to the last item in the current page",
        examples: ["eyJpZCI6IjEyMyJ9"],
        title: "End Cursor",
      }),
    ),
    hasNextPage: Type.Boolean({
      description: "Whether there is a next page available",
      title: "Has Next Page",
    }),
    hasPreviousPage: Type.Boolean({
      description: "Whether there is a previous page available",
      title: "Has Previous Page",
    }),
    startCursor: Type.Optional(
      Type.String({
        description: "Cursor pointing to the first item in the current page",
        examples: ["eyJpZCI6IjEyMyJ9"],
        title: "Start Cursor",
      }),
    ),
  },
  { additionalProperties: false },
);
