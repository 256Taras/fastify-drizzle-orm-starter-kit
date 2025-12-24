import { generateUniqueEmail } from "#tests/helpers/constants/test-credentials.ts";
import { authFactory } from "#tests/helpers/factories/auth.factory.ts";
import { userFactory } from "#tests/helpers/factories/user.factory.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";
import { fixtureFactory } from "#tests/helpers/utils/fixture.utils.ts";

const TEST_USER = userFactory.create({ email: generateUniqueEmail() });
const auth = authFactory.for(TEST_USER);

export const refreshTokensFixtures = fixtureFactory({
  seeds: {
    USER: {
      table: TABLE_NAMES.users,
      data: [TEST_USER],
    },
    AUTH_TOKEN: auth.authTokenSeed,
  },
  positive: {
    VALID_REFRESH: {
      input: {
        headers: auth.refreshTokenHeader,
      },
      expected: {
        user: { email: TEST_USER.email },
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
    MALFORMED_HEADER: {
      input: {
        headers: { "x-refresh-token": "InvalidFormat" },
      },
    },
    ACCESS_TOKEN_INSTEAD_OF_REFRESH: {
      input: {
        headers: auth.accessTokenHeader,
      },
    },
  },
});
