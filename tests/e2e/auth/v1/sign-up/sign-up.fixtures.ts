import { generateUniqueEmail, TEST_PASSWORD } from "#tests/helpers/constants/test-credentials.ts";
import { userFactory } from "#tests/helpers/factories/user.factory.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";
import { fixtureFactory } from "#tests/helpers/utils/fixture.utils.ts";

const EXISTING_USER = userFactory.create({ email: generateUniqueEmail() });
const NEW_USER_EMAIL = generateUniqueEmail();

export const signUpFixtures = fixtureFactory({
  seeds: {
    EXISTING_USER: {
      table: TABLE_NAMES.users,
      data: [EXISTING_USER],
    },
  },
  positive: {
    VALID_USER: {
      input: {
        body: {
          email: NEW_USER_EMAIL,
          firstName: "New",
          lastName: "User",
          password: TEST_PASSWORD,
        },
      },
      expected: {
        user: {
          email: NEW_USER_EMAIL,
          firstName: "New",
          lastName: "User",
          role: "USER",
        },
      },
    },
  },
  negative: {
    DUPLICATE_EMAIL: {
      input: {
        body: {
          email: EXISTING_USER.email,
          firstName: "New",
          lastName: "User",
          password: TEST_PASSWORD,
        },
      },
    },
    INVALID_EMAIL: {
      input: {
        body: {
          email: "invalid-email",
          firstName: "New",
          lastName: "User",
          password: TEST_PASSWORD,
        },
      },
    },
    PASSWORD_NO_NUMBER: {
      input: {
        body: {
          email: generateUniqueEmail(),
          firstName: "New",
          lastName: "User",
          password: "PasswordOnly",
        },
      },
    },
    PASSWORD_NO_LETTER: {
      input: {
        body: {
          email: generateUniqueEmail(),
          firstName: "New",
          lastName: "User",
          password: "12345678",
        },
      },
    },
    PASSWORD_TOO_SHORT: {
      input: {
        body: {
          email: generateUniqueEmail(),
          firstName: "New",
          lastName: "User",
          password: "Pass1",
        },
      },
    },
    EMPTY_FIRST_NAME: {
      input: {
        body: {
          email: generateUniqueEmail(),
          firstName: "",
          lastName: "User",
          password: TEST_PASSWORD,
        },
      },
    },
    EMPTY_LAST_NAME: {
      input: {
        body: {
          email: generateUniqueEmail(),
          firstName: "New",
          lastName: "",
          password: TEST_PASSWORD,
        },
      },
    },
    EMPTY_BODY: {
      input: { body: {} },
    },
  },
});
