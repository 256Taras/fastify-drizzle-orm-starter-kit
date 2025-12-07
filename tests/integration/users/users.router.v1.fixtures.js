/**
 * @file Test fixtures for users router v1 integration tests
 */

import { fixtureFactory } from "../../helpers/index.js";

const TESTING_METHOD = "GET";
const getEndpoint = () => "/v1/users/";

export const usersListFixtures = fixtureFactory({
  negative: {
    INVALID_ENUM: {
      in: {
        query: {
          "filter.role": "$eq:INVALID_ROLE",
          limit: "10",
          page: "1",
        },
      },
    },
    INVALID_FILTER_OPERATOR: {
      in: {
        query: {
          "filter.email": "$invalid:test",
          limit: "10",
          page: "1",
        },
      },
    },
    INVALID_LIMIT: {
      in: {
        query: { limit: "-1", page: "1" },
      },
    },
    INVALID_PAGE: {
      in: {
        query: { limit: "10", page: "0" },
      },
    },
    INVALID_SORT_FORMAT: {
      in: {
        query: {
          limit: "10",
          page: "1",
          sortBy: "email",
        },
      },
    },
  },
  positive: {
    COMPLEX_ALL_FEATURES: {
      in: {
        query: {
          "filter.email": "$ilike:%example%",
          "filter.role": "$in:USER,ADMIN",
          limit: "3",
          page: "1",
          search: "user",
          sortBy: ["email:ASC", "firstName:ASC"],
        },
      },
      out: {
        maxDataLength: 3,
      },
    },
    COMPLEX_QUERY: {
      in: {
        query: {
          "filter.role": "$eq:USER",
          limit: "10",
          page: "1",
          search: "john",
          sortBy: "email:ASC",
        },
      },
      out: {
        expectedRole: "USER",
      },
    },
    EMPTY_RESULT: {
      in: {
        query: { limit: "10", page: "1" },
      },
      out: {
        dataLength: 0,
        metaTotal: 0,
      },
    },
    FILTER_EMAIL_EQ: {
      in: {
        query: {
          "filter.email": "$eq:filter@example.com",
          limit: "10",
          page: "1",
        },
      },
      out: {
        expectedEmail: "filter@example.com",
      },
    },
    FILTER_EMAIL_IN: {
      in: {
        query: {
          "filter.email": "$in:user1@example.com,user2@example.com",
          limit: "10",
          page: "1",
        },
      },
      out: {
        allowedEmails: ["user1@example.com", "user2@example.com"],
      },
    },
    FILTER_ROLE_EQ: {
      in: {
        query: {
          "filter.role": "$eq:ADMIN",
          limit: "10",
          page: "1",
        },
      },
      out: {
        expectedRole: "ADMIN",
      },
    },
    MULTIPLE_FILTERS: {
      in: {
        query: {
          "filter.email": "$ilike:%admin%",
          "filter.role": "$eq:ADMIN",
          limit: "10",
          page: "1",
        },
      },
      out: {
        emailContains: "admin",
        expectedRole: "ADMIN",
      },
    },
    PAGE_BEYOND: {
      in: {
        query: { limit: "10", page: "999" },
      },
      out: {
        dataLength: 0,
      },
    },
    PAGINATED_LIST: {
      in: {
        query: { limit: "10", page: "1" },
      },
      out: {
        metaKeys: ["page", "limit", "itemCount", "pageCount", "hasNextPage", "hasPreviousPage"],
        minDataLength: 2,
      },
    },
    PAGINATION_METADATA: {
      in: {
        query: { limit: "5", page: "2" },
      },
      out: {
        meta: {
          limit: 5,
          page: 2,
        },
      },
    },
    SEARCH: {
      in: {
        query: {
          limit: "10",
          page: "1",
          search: "John",
        },
      },
    },
    SELECT_MULTIPLE: {
      in: {
        query: {
          limit: "1",
          page: "1",
          select: ["email", "firstName"],
        },
      },
      out: {
        expectedFields: ["email", "firstName"],
      },
    },
    SELECT_SINGLE: {
      in: {
        query: {
          limit: "1",
          page: "1",
          select: "deletedAt",
        },
      },
      out: {
        expectedFields: ["deletedAt"],
      },
    },
    SORT_MULTIPLE: {
      in: {
        query: {
          limit: "10",
          page: "1",
          sortBy: ["email:ASC", "firstName:ASC"],
        },
      },
    },
    SORT_SINGLE: {
      in: {
        query: {
          limit: "10",
          page: "1",
          sortBy: "updatedAt:DESC",
        },
      },
    },
  },
  seeds: {
    common: {
      MULTIPLE_USERS: {
        data: [
          {
            email: "test1@example.com",
            firstName: "John",
            lastName: "Doe",
            password: "hashed_password",
            role: "USER",
          },
          {
            email: "admin1@example.com",
            firstName: "Admin",
            lastName: "User",
            password: "hashed_password",
            role: "ADMIN",
          },
        ],
        name: "User",
      },
      SINGLE_USER: {
        data: [
          {
            email: "test@example.com",
            firstName: "Test",
            lastName: "User",
            password: "hashed_password",
            role: "USER",
          },
        ],
        name: "User",
      },
    },
    negative: {},
    positive: {
      COMPLEX_QUERY: {
        data: Array.from({ length: 10 }, (_, i) => ({
          email: `user${i + 1}@example.com`,
          firstName: i % 2 === 0 ? "User" : "Admin",
          lastName: "Test",
          password: "hashed_password",
          role: i % 3 === 0 ? "ADMIN" : "USER",
        })),
        name: "User",
      },
      FIFTEEN_USERS: {
        data: Array.from({ length: 15 }, (_, i) => ({
          email: `user${i + 1}@example.com`,
          firstName: `User${i + 1}`,
          lastName: "Test",
          password: "hashed_password",
          role: i % 3 === 0 ? "ADMIN" : "USER",
        })),
        name: "User",
      },
      FILTER_EMAIL: {
        data: [
          {
            email: "filter@example.com",
            firstName: "Filter",
            lastName: "Test",
            password: "hashed_password",
            role: "USER",
          },
        ],
        name: "User",
      },
      FILTER_ROLE: {
        data: [
          {
            email: "admin1@example.com",
            firstName: "Admin",
            lastName: "One",
            password: "hashed_password",
            role: "ADMIN",
          },
          {
            email: "user1@example.com",
            firstName: "User",
            lastName: "One",
            password: "hashed_password",
            role: "USER",
          },
        ],
        name: "User",
      },
      IN_OPERATOR: {
        data: [
          {
            email: "user1@example.com",
            firstName: "User",
            lastName: "One",
            password: "hashed_password",
            role: "USER",
          },
          {
            email: "user2@example.com",
            firstName: "User",
            lastName: "Two",
            password: "hashed_password",
            role: "USER",
          },
        ],
        name: "User",
      },
      MULTIPLE_FILTERS: {
        data: [
          {
            email: "admin@example.com",
            firstName: "Admin",
            lastName: "Test",
            password: "hashed_password",
            role: "ADMIN",
          },
        ],
        name: "User",
      },
      SEARCH_DATA: {
        data: [
          {
            email: "john@example.com",
            firstName: "John",
            lastName: "Doe",
            password: "hashed_password",
            role: "USER",
          },
        ],
        name: "User",
      },
    },
  },
});

export const validationCases = [
  { fixture: usersListFixtures.negative.INVALID_LIMIT, name: "invalid limit" },
  { fixture: usersListFixtures.negative.INVALID_PAGE, name: "invalid page" },
  { fixture: usersListFixtures.negative.INVALID_SORT_FORMAT, name: "invalid sort format" },
  { fixture: usersListFixtures.negative.INVALID_FILTER_OPERATOR, name: "invalid filter operator" },
  { fixture: usersListFixtures.negative.INVALID_ENUM, name: "invalid enum value" },
];

export { getEndpoint, TESTING_METHOD };
