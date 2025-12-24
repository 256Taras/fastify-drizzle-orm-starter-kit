import { ROLES_NAMES } from "#libs/constants/common.constants.ts";
import { userFactory } from "#tests/helpers/factories/user.factory.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";
import { fixtureFactory } from "#tests/helpers/utils/fixture.utils.ts";

const JOHN_USER = userFactory.create({ email: "john@example.com", firstName: "John", lastName: "Doe" });
const JANE_USER = userFactory.create({
  email: "jane@example.com",
  firstName: "Jane",
  lastName: "Smith",
  role: ROLES_NAMES.admin,
});
const ADMIN_USER = userFactory.create({ email: "admin@example.com", firstName: "Admin", role: ROLES_NAMES.admin });

export const getManyUserFixtures = fixtureFactory({
  seeds: {
    SINGLE_USER: {
      table: TABLE_NAMES.users,
      data: [userFactory.create({ email: "test@example.com", firstName: "Test" })],
    },
    MULTIPLE_USERS: {
      table: TABLE_NAMES.users,
      data: [
        userFactory.create({ email: "test1@example.com", firstName: "John", lastName: "Doe" }),
        userFactory.create({ email: "admin1@example.com", firstName: "Admin", lastName: "User", role: ROLES_NAMES.admin }),
      ],
    },
    SEARCH_USERS: {
      table: TABLE_NAMES.users,
      data: [JOHN_USER, JANE_USER, ADMIN_USER],
    },
    MANY_USERS: (count = 10) => userFactory.createManySeed(count),
  },
  positive: {
    PAGINATED_LIST: {
      input: { query: { limit: "10", page: "1" } },
    },
    PAGINATION_METADATA: {
      input: { query: { limit: "5", page: "2" } },
    },
    EMPTY_RESULT: {
      input: { query: { limit: "10", page: "1" } },
    },
    FILTER_EMAIL: {
      input: { query: { "filter.email": `$eq:${JOHN_USER.email}`, limit: "10", page: "1" } },
      expected: { matchEvery: { email: JOHN_USER.email } },
    },
    FILTER_EMAIL_IN: {
      input: { query: { "filter.email": `$in:${JOHN_USER.email},${JANE_USER.email}`, limit: "10", page: "1" } },
      expected: { matchSome: [JOHN_USER.email, JANE_USER.email] },
    },
    MULTIPLE_FILTERS: {
      input: { query: { "filter.email": "$ilike:%admin%", "filter.role": "$eq:ADMIN", limit: "10", page: "1" } },
      expected: { matchEvery: { role: "ADMIN" }, emailContains: "admin" },
    },
    SORT_MULTIPLE: {
      input: { query: { sortBy: ["email:ASC", "firstName:ASC"], limit: "10", page: "1" } },
    },
    SELECT_MULTIPLE: {
      input: { query: { select: "email,firstName", limit: "1", page: "1" } },
      expected: { shape: { required: ["email", "firstName"] } },
    },
    COMPLEX_ALL_FEATURES: {
      input: {
        query: {
          "filter.email": "$ilike:%example%",
          "filter.role": "$in:USER,ADMIN",
          sortBy: ["email:ASC", "firstName:ASC"],
          limit: "3",
          page: "1",
        },
      },
      expected: { maxLength: 3 },
    },
  },
  negative: {
    INVALID_LIMIT: {
      input: { query: { limit: "-1", page: "1" } },
    },
    INVALID_FILTER_OPERATOR: {
      input: { query: { "filter.email": "$invalid:test", limit: "10", page: "1" } },
    },
    INVALID_ENUM: {
      input: { query: { "filter.role": "$eq:INVALID_ROLE", limit: "10", page: "1" } },
    },
  },
});
