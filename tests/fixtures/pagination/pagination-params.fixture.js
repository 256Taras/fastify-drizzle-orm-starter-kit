/**
 * @file Pagination params fixtures for testing
 */

/**
 * Basic offset pagination params
 */
export const BASIC_OFFSET_PARAMS = {
  query: {
    page: 1,
    limit: 10,
  },
  filters: {},
  search: undefined,
  select: undefined,
  sortBy: undefined,
};

/**
 * Offset pagination params with filters
 */
export const OFFSET_PARAMS_WITH_FILTERS = {
  query: {
    page: 1,
    limit: 10,
  },
  filters: {
    email: "$eq:test@example.com",
    role: "$in:admin,user",
  },
  search: undefined,
  select: undefined,
  sortBy: undefined,
};

/**
 * Offset pagination params with search
 */
export const OFFSET_PARAMS_WITH_SEARCH = {
  query: {
    page: 1,
    limit: 10,
  },
  filters: {},
  search: "test",
  select: undefined,
  sortBy: undefined,
};

/**
 * Offset pagination params with sorting
 */
export const OFFSET_PARAMS_WITH_SORTING = {
  query: {
    page: 1,
    limit: 10,
  },
  filters: {},
  search: undefined,
  select: undefined,
  sortBy: ["email:ASC", "createdAt:DESC"],
};

/**
 * Offset pagination params with select
 */
export const OFFSET_PARAMS_WITH_SELECT = {
  query: {
    page: 1,
    limit: 10,
  },
  filters: {},
  search: undefined,
  select: ["id", "email", "firstName"],
  sortBy: undefined,
};

/**
 * Cursor pagination params (forward)
 */
export const CURSOR_PARAMS_FORWARD = {
  query: {
    limit: 10,
    after: "eyJpZCI6MTAwfQ==",
  },
  filters: {},
  search: undefined,
  select: undefined,
  sortBy: undefined,
};

/**
 * Cursor pagination params (backward)
 */
export const CURSOR_PARAMS_BACKWARD = {
  query: {
    limit: 10,
    before: "eyJpZCI6MTAwfQ==",
  },
  filters: {},
  search: undefined,
  select: undefined,
  sortBy: undefined,
};

/**
 * Complex pagination params (all features)
 */
export const COMPLEX_PARAMS = {
  query: {
    page: 2,
    limit: 20,
  },
  filters: {
    email: "$ilike:test",
    role: "$in:admin,user",
  },
  search: "john",
  select: ["id", "email", "firstName", "lastName"],
  sortBy: ["email:ASC", "createdAt:DESC"],
};
