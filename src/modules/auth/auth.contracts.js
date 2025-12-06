import { Type } from "@sinclair/typebox";

import { USER_INSERT_CONTRACT, USER_OUTPUT_CONTRACT } from "#modules/users/users.contracts.js";

export const CREDENTIALS_TOKENS_CONTRACT = Type.Object(
  {
    accessToken: Type.String(),
    refreshToken: Type.String(),
  },
  { additionalProperties: false },
);

export const SIGN_IN_UP_OUTPUT_CONTRACT = Type.Intersect([
  CREDENTIALS_TOKENS_CONTRACT,
  Type.Object(
    {
      user: USER_OUTPUT_CONTRACT,
    },
    { additionalProperties: false },
  ),
]);

// Sign up input - pick only required fields from insert schema (omit id, timestamps)
export const SIGN_UP_INPUT_CONTRACT = Type.Pick(USER_INSERT_CONTRACT, ["email", "password", "firstName", "lastName"]);

// Sign in input - pick only email and password
export const SIGN_IN_INPUT_CONTRACT = Type.Pick(SIGN_UP_INPUT_CONTRACT, ["email", "password"]);

/**
 * Type definitions for auth module
 * @typedef {import("@sinclair/typebox").Static<typeof SIGN_IN_UP_OUTPUT_CONTRACT>} Credentials
 * @typedef {import("@sinclair/typebox").Static<typeof SIGN_IN_INPUT_CONTRACT>} SignInInput
 * @typedef {import("@sinclair/typebox").Static<typeof SIGN_UP_INPUT_CONTRACT>} SignUpInput
 */
