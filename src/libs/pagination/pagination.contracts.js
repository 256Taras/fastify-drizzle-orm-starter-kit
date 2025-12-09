import { Type } from "@sinclair/typebox";

/** Filter operators for different data types */
export const FILTER_OPERATORS = {
  $eq: "$eq",
  $gt: "$gt",
  $gte: "$gte",
  $ilike: "$ilike",
  $in: "$in",
  $lt: "$lt",
  $lte: "$lte",
  $notIn: "$notIn",
};

/** Pagination strategies */
export const PAGINATION_STRATEGY = {
  cursor: "cursor",
  offset: "offset",
};

/** Base pagination meta fields shared between strategies */
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

/** Offset pagination meta contract */
export const OFFSET_PAGINATION_META_CONTRACT = Type.Object(
  {
    ...basePaginationMeta,
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
    hasPreviousPage: Type.Boolean({
      description: "Whether there is a previous page available",
      title: "Has Previous Page",
    }),
    hasNextPage: Type.Boolean({
      description: "Whether there is a next page available",
      title: "Has Next Page",
    }),
  },
  {
    additionalProperties: false,
    description: "Metadata for offset-based pagination",
    title: "Offset Pagination Meta",
  },
);

/** Cursor pagination meta contract */
export const CURSOR_PAGINATION_META_CONTRACT = Type.Object(
  {
    ...basePaginationMeta,
    startCursor: Type.Optional(
      Type.String({
        description: "Cursor pointing to the first item in the current page",
        examples: ["eyJpZCI6IjEyMyJ9"],
        title: "Start Cursor",
      }),
    ),
    endCursor: Type.Optional(
      Type.String({
        description: "Cursor pointing to the last item in the current page",
        examples: ["eyJpZCI6IjEyMyJ9"],
        title: "End Cursor",
      }),
    ),
    hasPreviousPage: Type.Boolean({
      description: "Whether there is a previous page available",
      title: "Has Previous Page",
    }),
    hasNextPage: Type.Boolean({
      description: "Whether there is a next page available",
      title: "Has Next Page",
    }),
  },
  {
    additionalProperties: false,
    description: "Metadata for cursor-based pagination",
    title: "Cursor Pagination Meta",
  },
);
