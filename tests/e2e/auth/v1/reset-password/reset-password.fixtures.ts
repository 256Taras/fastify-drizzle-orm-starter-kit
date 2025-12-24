import { generateUniqueEmail, TEST_NEW_PASSWORD, TEST_PASSWORD } from "#tests/helpers/constants/test-credentials.ts";
import { userFactory } from "#tests/helpers/factories/user.factory.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";
import { fixtureFactory } from "#tests/helpers/utils/fixture.utils.ts";

const TEST_USER = userFactory.create({ email: generateUniqueEmail() });
const EXPIRED_RESET_TOKEN_ID = crypto.randomUUID();

export const resetPasswordFixtures = fixtureFactory({
  seeds: {
    USER: {
      table: TABLE_NAMES.users,
      data: [TEST_USER],
    },
    EXPIRED_RESET_TOKEN: {
      table: TABLE_NAMES.authPasswordResetTokens,
      data: [
        {
          id: EXPIRED_RESET_TOKEN_ID,
          email: TEST_USER.email,
          token: "expired-token",
          expiresAt: new Date(Date.now() - 1000 * 60 * 60),
        },
      ],
    },
  },
  positive: {
    VALID_RESET: {
      credentials: {
        email: TEST_USER.email,
        oldPassword: TEST_PASSWORD,
      },
      input: {
        body: { password: TEST_NEW_PASSWORD },
      },
      expected: {
        body: { status: true },
      },
    },
  },
  negative: {
    INVALID_TOKEN: {
      input: {
        body: {
          token: "invalid-token",
          password: TEST_NEW_PASSWORD,
        },
      },
    },
    EXPIRED_TOKEN: {
      input: {
        body: {
          token: "expired-token",
          password: TEST_NEW_PASSWORD,
        },
      },
    },
    PASSWORD_NO_NUMBER: {
      input: {
        body: { password: "PasswordOnly" },
      },
    },
    PASSWORD_NO_LETTER: {
      input: {
        body: { password: "12345678" },
      },
    },
    PASSWORD_TOO_SHORT: {
      input: {
        body: { password: "Ab1" },
      },
    },
    MISSING_TOKEN: {
      input: {
        body: { password: TEST_NEW_PASSWORD },
      },
    },
    MISSING_PASSWORD: {
      input: {
        body: { token: "some-token" },
      },
    },
  },
});
