import { generateUniqueEmail } from "#tests/helpers/constants/test-credentials.ts";
import { authFactory } from "#tests/helpers/factories/auth.factory.ts";
import { userFactory } from "#tests/helpers/factories/user.factory.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";
import { fixtureFactory } from "#tests/helpers/utils/fixture.utils.ts";

const TEST_USER = userFactory.create({ email: generateUniqueEmail() });
const auth = authFactory.for(TEST_USER);

export const logOutFixtures = fixtureFactory({
  seeds: {
    USER: {
      table: TABLE_NAMES.users,
      data: [TEST_USER],
    },
    AUTH_TOKEN: auth.authTokenSeed,
  },
  positive: {
    VALID_LOGOUT: {
      input: {
        headers: auth.refreshTokenHeader,
      },
      expected: {
        body: { status: true },
      },
    },
  },
  negative: {
    INVALID_TOKEN: {
      input: {
        headers: { "x-refresh-token": "invalid.jwt.token" },
      },
    },
    MISSING_AUTH: {
      input: {
        headers: {},
      },
    },
    ACCESS_TOKEN_INSTEAD_OF_REFRESH: {
      input: {
        headers: auth.accessTokenHeader,
      },
    },
  },
});
