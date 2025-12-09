import { ROLES_NAMES } from "#libs/constants/common.constants.js";
import encrypterService from "#libs/encryption/encrypter.service.js";

import { TABLE_NAMES } from "../../../../helpers/db-utils.js";
import { fixtureFactory } from "../../../../helpers/index.js";

const TESTING_METHOD = "GET";
/**
 *
 */
const getEndpoint = () => "/v1/users/";

const hashedPassword = await encrypterService().getHash("test_password");

const BASE_USER = {
  lastName: "Test",
  password: hashedPassword,
  role: ROLES_NAMES.user,
};

export const usersListFixtures = fixtureFactory({
  seeds: {
    SINGLE_USER: {
      table: TABLE_NAMES.users,
      data: [
        {
          ...BASE_USER,
          email: "test@example.com",
          firstName: "Test",
        },
      ],
    },
    MULTIPLE_USERS: {
      table: TABLE_NAMES.users,
      data: [
        {
          ...BASE_USER,
          email: "test1@example.com",
          firstName: "John",
          lastName: "Doe",
        },
        {
          ...BASE_USER,
          email: "admin1@example.com",
          firstName: "Admin",
          lastName: "User",
          role: ROLES_NAMES.admin,
        },
      ],
    },
    SEARCH_USERS: {
      table: TABLE_NAMES.users,
      data: [
        {
          ...BASE_USER,
          email: "john@example.com",
          firstName: "John",
          lastName: "Doe",
        },
        {
          ...BASE_USER,
          email: "jane@example.com",
          firstName: "Jane",
          lastName: "Smith",
          role: ROLES_NAMES.admin,
        },
        {
          ...BASE_USER,
          email: "admin@example.com",
          firstName: "Admin",
          role: ROLES_NAMES.admin,
        },
      ],
    },
    /**
     *
     * @param {number} [count]
     * @param  {object} overrides
     */
    MANY_USERS: (count = 10, overrides = {}) => ({
      table: TABLE_NAMES.users,
      data: Array.from({ length: count }, (_, i) => ({
        ...BASE_USER,
        email: `user${i + 1}@example.com`,
        firstName: `User${i + 1}`,
        role: i % 3 === 0 ? ROLES_NAMES.admin : ROLES_NAMES.user,
        ...overrides,
      })),
    }),
  },
  positive: {
    PAGINATED_LIST: {
      in: { query: { limit: "10", page: "1" } },
    },
    PAGINATION_METADATA: {
      in: { query: { limit: "5", page: "2" } },
    },
    EMPTY_RESULT: {
      in: { query: { limit: "10", page: "1" } },
    },
    PAGE_BEYOND: {
      in: { query: { limit: "10", page: "999" } },
    },
    FILTER_EMAIL: {
      in: { query: { "filter.email": "$eq:john@example.com", limit: "10", page: "1" } },
      out: { matchEvery: { email: "john@example.com" } },
    },
    FILTER_ROLE: {
      in: { query: { "filter.role": "$eq:ADMIN", limit: "10", page: "1" } },
      out: { matchEvery: { role: "ADMIN" } },
    },
    FILTER_EMAIL_IN: {
      in: { query: { "filter.email": "$in:john@example.com,jane@example.com", limit: "10", page: "1" } },
      out: { matchSome: ["john@example.com", "jane@example.com"] },
    },
    MULTIPLE_FILTERS: {
      in: { query: { "filter.email": "$ilike:%admin%", "filter.role": "$eq:ADMIN", limit: "10", page: "1" } },
      out: { matchEvery: { role: "ADMIN" }, emailContains: "admin" },
    },
    SORT_SINGLE: {
      in: { query: { sortBy: "updatedAt:DESC", limit: "10", page: "1" } },
    },
    SORT_MULTIPLE: {
      in: { query: { sortBy: ["email:ASC", "firstName:ASC"], limit: "10", page: "1" } },
    },
    SELECT_SINGLE: {
      in: { query: { select: "deletedAt", limit: "1", page: "1" } },
      out: { shape: { required: ["deletedAt"] } },
    },
    SELECT_MULTIPLE: {
      in: { query: { select: "email,firstName", limit: "1", page: "1" } },
      out: { shape: { required: ["email", "firstName"] } },
    },
    COMPLEX_QUERY: {
      in: { query: { "filter.role": "$eq:USER", search: "john", sortBy: "email:ASC", limit: "10", page: "1" } },
      out: { matchEvery: { role: "USER" } },
    },
    COMPLEX_ALL_FEATURES: {
      in: {
        query: {
          "filter.email": "$ilike:%example%",
          "filter.role": "$in:USER,ADMIN",
          sortBy: ["email:ASC", "firstName:ASC"],
          limit: "3",
          page: "1",
        },
      },
      out: { maxLength: 3 },
    },
  },
  negative: {
    INVALID_LIMIT: {
      in: { query: { limit: "-1", page: "1" } },
    },
    INVALID_PAGE: {
      in: { query: { limit: "10", page: "0" } },
    },
    INVALID_SORT_FORMAT: {
      in: { query: { sortBy: "email", limit: "10", page: "1" } },
    },
    INVALID_FILTER_OPERATOR: {
      in: { query: { "filter.email": "$invalid:test", limit: "10", page: "1" } },
    },
    INVALID_ENUM: {
      in: { query: { "filter.role": "$eq:INVALID_ROLE", limit: "10", page: "1" } },
    },
  },
});

export { getEndpoint, TESTING_METHOD };
