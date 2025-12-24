import { generateUniqueEmail } from "#tests/helpers/constants/test-credentials.ts";
import { userFactory } from "#tests/helpers/factories/user.factory.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";
import { fixtureFactory } from "#tests/helpers/utils/fixture.utils.ts";

const TEST_USER = userFactory.create({ email: generateUniqueEmail() });

export const forgotPasswordFixtures = fixtureFactory({
  seeds: {
    USER: {
      table: TABLE_NAMES.users,
      data: [TEST_USER],
    },
  },
  positive: {
    VALID_REQUEST: {
      input: {
        body: { email: TEST_USER.email },
      },
      expected: {
        body: { status: true },
      },
    },
    NON_EXISTENT_EMAIL: {
      input: {
        body: { email: "nonexistent@example.com" },
      },
      expected: {
        body: { status: true },
      },
    },
  },
  negative: {
    INVALID_EMAIL: {
      input: {
        body: { email: "not-an-email" },
      },
    },
    EMPTY_EMAIL: {
      input: {
        body: { email: "" },
      },
    },
    MISSING_EMAIL: {
      input: { body: {} },
    },
  },
});
