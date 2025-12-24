import { generateUniqueEmail, TEST_PASSWORD } from "#tests/helpers/constants/test-credentials.ts";
import { userFactory } from "#tests/helpers/factories/user.factory.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";
import { fixtureFactory } from "#tests/helpers/utils/fixture.utils.ts";

const TEST_USER = userFactory.create({ email: generateUniqueEmail() });

export const signInFixtures = fixtureFactory({
  seeds: {
    USER: {
      table: TABLE_NAMES.users,
      data: [TEST_USER],
    },
  },
  positive: {
    VALID_CREDENTIALS: {
      input: {
        body: {
          email: TEST_USER.email,
          password: TEST_PASSWORD,
        },
      },
      expected: {
        user: { email: TEST_USER.email },
      },
    },
  },
  negative: {
    NON_EXISTENT_EMAIL: {
      input: {
        body: {
          email: "nonexistent@example.com",
          password: TEST_PASSWORD,
        },
      },
    },
    WRONG_PASSWORD: {
      input: {
        body: {
          email: TEST_USER.email,
          password: "WrongPassword123",
        },
      },
    },
    INVALID_EMAIL_FORMAT: {
      input: {
        body: {
          email: "not-an-email",
          password: TEST_PASSWORD,
        },
      },
    },
    MISSING_EMAIL: {
      input: {
        body: { password: TEST_PASSWORD },
      },
    },
    MISSING_PASSWORD: {
      input: {
        body: { email: TEST_USER.email },
      },
    },
    EMPTY_BODY: {
      input: { body: {} },
    },
  },
});
