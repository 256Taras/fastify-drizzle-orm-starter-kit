import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.ts";
import { USER_OUTPUT_CONTRACT } from "#modules/users/users.contracts.ts";

const PASSWORD_SCHEMA = Type.String({
  minLength: 6,
  pattern: String.raw`^(?=.*[A-Za-z])(?=.*\d).+$`,
});

export const SIGN_IN_UP_OUTPUT_CONTRACT = Type.Object(
  {
    accessToken: Type.String(),
    refreshToken: Type.String(),
    user: USER_OUTPUT_CONTRACT,
  },
  { additionalProperties: false },
);

export const SIGN_UP_INPUT_CONTRACT = Type.Object(
  {
    email: Type.String({ format: "email" }),
    firstName: Type.String({ minLength: 1 }),
    lastName: Type.String({ minLength: 1 }),
    password: PASSWORD_SCHEMA,
  },
  { additionalProperties: false },
);

export const SIGN_IN_INPUT_CONTRACT = Type.Object(
  {
    email: Type.String({ format: "email" }),
    password: Type.String(),
  },
  { additionalProperties: false },
);

export const FORGOT_PASSWORD_INPUT_CONTRACT = Type.Object(
  {
    email: Type.String({ format: "email" }),
  },
  { additionalProperties: false },
);

export const RESET_PASSWORD_INPUT_CONTRACT = Type.Object(
  {
    password: PASSWORD_SCHEMA,
    token: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false },
);

export const CHANGE_PASSWORD_INPUT_CONTRACT = Type.Object(
  {
    newPassword: PASSWORD_SCHEMA,
    oldPassword: Type.String(),
  },
  { additionalProperties: false },
);

export const FORGOT_PASSWORD_OUTPUT_CONTRACT = Type.Object(
  {
    status: Type.Boolean(),
    resetToken: Type.Optional(Type.String()),
  },
  { additionalProperties: false },
);

export type ChangePasswordInput = Static<typeof CHANGE_PASSWORD_INPUT_CONTRACT>;
export type Credentials = Static<typeof SIGN_IN_UP_OUTPUT_CONTRACT>;
export type ForgotPasswordInput = Static<typeof FORGOT_PASSWORD_INPUT_CONTRACT>;
export type ForgotPasswordOutput = Static<typeof FORGOT_PASSWORD_OUTPUT_CONTRACT>;
export type ResetPasswordInput = Static<typeof RESET_PASSWORD_INPUT_CONTRACT>;
export type SignInInput = Static<typeof SIGN_IN_INPUT_CONTRACT>;
export type SignUpInput = Static<typeof SIGN_UP_INPUT_CONTRACT>;
export type StatusOutput = Static<typeof COMMON_CONTRACTS_V1.status>;
