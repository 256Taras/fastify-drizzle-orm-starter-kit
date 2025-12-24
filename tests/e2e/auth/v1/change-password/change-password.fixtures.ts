import { generateUniqueEmail, TEST_NEW_PASSWORD, TEST_PASSWORD } from "#tests/helpers/constants/test-credentials.ts";
import { authFactory } from "#tests/helpers/factories/auth.factory.ts";
import { userFactory } from "#tests/helpers/factories/user.factory.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";
import { fixtureFactory } from "#tests/helpers/utils/fixture.utils.ts";
const TEST_USER = userFactory.create({ email: generateUniqueEmail() });
const auth = authFactory.for(TEST_USER);

export const changePasswordFixtures = fixtureFactory({
  seeds: {
    USER: {
      table: TABLE_NAMES.users,
      data: [TEST_USER],
    },
    AUTH_TOKEN: auth.authTokenSeed,
  },
  positive: {
    VALID_CHANGE: {
      credentials: {
        email: TEST_USER.email,
        oldPassword: TEST_PASSWORD,
        newPassword: TEST_NEW_PASSWORD,
      },
      input: {
        headers: auth.accessTokenHeader,
        body: {
          oldPassword: TEST_PASSWORD,
          newPassword: TEST_NEW_PASSWORD,
        },
      },
      expected: {
        body: { status: true },
      },
    },
  },
  negative: {
    WRONG_OLD_PASSWORD: {
      input: {
        headers: auth.accessTokenHeader,
        body: {
          oldPassword: "WrongPassword123",
          newPassword: TEST_NEW_PASSWORD,
        },
      },
    },
    SAME_PASSWORD: {
      input: {
        headers: auth.accessTokenHeader,
        body: {
          oldPassword: TEST_PASSWORD,
          newPassword: TEST_PASSWORD,
        },
      },
    },
    MISSING_AUTH: {
      input: {
        headers: {},
        body: {
          oldPassword: TEST_PASSWORD,
          newPassword: TEST_NEW_PASSWORD,
        },
      },
    },
    INVALID_TOKEN: {
      input: {
        headers: { authorization: "Bearer invalid.jwt.token" },
        body: {
          oldPassword: TEST_PASSWORD,
          newPassword: TEST_NEW_PASSWORD,
        },
      },
    },
    PASSWORD_NO_NUMBER: {
      input: {
        headers: auth.accessTokenHeader,
        body: {
          oldPassword: TEST_PASSWORD,
          newPassword: "PasswordOnly",
        },
      },
    },
    PASSWORD_NO_LETTER: {
      input: {
        headers: auth.accessTokenHeader,
        body: {
          oldPassword: TEST_PASSWORD,
          newPassword: "12345678",
        },
      },
    },
    PASSWORD_TOO_SHORT: {
      input: {
        headers: auth.accessTokenHeader,
        body: {
          oldPassword: TEST_PASSWORD,
          newPassword: "Ab1",
        },
      },
    },
    MISSING_OLD_PASSWORD: {
      input: {
        headers: auth.accessTokenHeader,
        body: { newPassword: TEST_NEW_PASSWORD },
      },
    },
    MISSING_NEW_PASSWORD: {
      input: {
        headers: auth.accessTokenHeader,
        body: { oldPassword: TEST_PASSWORD },
      },
    },
  },
});
