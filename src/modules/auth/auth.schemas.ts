import { Type } from "@sinclair/typebox";
import { pick } from "rambda";

import { SWAGGER_SECURITY } from "#libs/constants/swagger-security.constants.ts";
import { SWAGGER_TAGS } from "#libs/constants/swagger-tags.constants.ts";
import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.ts";
import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.ts";
import {
  BadRequestException,
  ConflictException,
  ResourceNotFoundException,
  UnauthorizedException,
} from "#libs/errors/domain.errors.ts";
import { mapHttpErrorsToSchemaErrorCollection } from "#libs/utils/schemas.ts";
import {
  CHANGE_PASSWORD_INPUT_CONTRACT,
  FORGOT_PASSWORD_INPUT_CONTRACT,
  RESET_PASSWORD_INPUT_CONTRACT,
  SIGN_IN_UP_OUTPUT_CONTRACT,
  SIGN_UP_INPUT_CONTRACT,
} from "#modules/auth/auth.contracts.ts";

const authSchemas = {
  logOut: {
    tags: SWAGGER_TAGS.AUTH,
    response: {
      200: COMMON_CONTRACTS_V1.status,
      ...mapHttpErrorsToSchemaErrorCollection(pick([UnauthorizedException.name], defaultHttpErrorCollection)),
    },
    security: SWAGGER_SECURITY.BEARER_REFRESH,
    summary: "Log out authentication user",
  },

  refreshTokens: {
    tags: SWAGGER_TAGS.AUTH,
    response: {
      200: SIGN_IN_UP_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(pick([ResourceNotFoundException.name], defaultHttpErrorCollection)),
    },
    security: SWAGGER_SECURITY.BEARER_REFRESH,
    summary: "Refresh authentication tokens.",
  },

  signIn: {
    tags: SWAGGER_TAGS.AUTH,
    body: Type.Pick(SIGN_UP_INPUT_CONTRACT, ["email", "password"]),
    response: {
      200: SIGN_IN_UP_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Sign in a user by validating its credentials and return him a JWT.",
  },

  signUp: {
    tags: SWAGGER_TAGS.AUTH,
    body: SIGN_UP_INPUT_CONTRACT,
    response: {
      201: SIGN_IN_UP_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ConflictException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Create new user and return him a JWT.",
  },

  forgotPassword: {
    tags: SWAGGER_TAGS.AUTH,
    body: FORGOT_PASSWORD_INPUT_CONTRACT,
    response: {
      200: Type.Object({
        status: Type.Boolean(),
        resetToken: Type.Optional(Type.String()),
      }),
      ...mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    },
    summary: "Request password reset email.",
  },

  resetPassword: {
    tags: SWAGGER_TAGS.AUTH,
    body: RESET_PASSWORD_INPUT_CONTRACT,
    response: {
      200: COMMON_CONTRACTS_V1.status,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, UnauthorizedException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Reset password using token from email.",
  },

  changePassword: {
    tags: SWAGGER_TAGS.AUTH,
    body: CHANGE_PASSWORD_INPUT_CONTRACT,
    response: {
      200: COMMON_CONTRACTS_V1.status,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, UnauthorizedException.name], defaultHttpErrorCollection),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Change password for authenticated user.",
  },
};

export default authSchemas;
