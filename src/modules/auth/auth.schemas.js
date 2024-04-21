// eslint-disable-next-line no-unused-vars
import { Type } from "@sinclair/typebox";
import { pick } from "rambda";

import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.js";
import {
  BadRequestException,
  ConflictException,
  ResourceNotFoundException,
  UnauthorizedException,
} from "#libs/errors/domain.errors.js";
import { mapHttpErrorsToSchemaErrorCollection, mixinTagForSchema } from "#libs/utils/schemas.js";
import { COMMON_CONTRACTS_V1 } from "#libs/common.contracnts.js";
import { SIGN_IN_UP_OUTPUT_CONTRACT, SIGN_UP_INPUT_CONTRACT } from "#modules/auth/auth.contracts.js";

const authSchemas = {
  signUp: {
    summary: "Create new user and return him a JWT.",
    body: SIGN_UP_INPUT_CONTRACT,
    response: {
      201: SIGN_IN_UP_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ConflictException.name], defaultHttpErrorCollection),
      ),
    },
  },

  signIn: {
    summary: "Sign in a user by validating its credentials and return him a JWT.",
    body: Type.Pick(SIGN_UP_INPUT_CONTRACT, ["email", "password"]),
    response: {
      200: SIGN_IN_UP_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
  },

  logOut: {
    summary: "Log out authentication user",
    security: [{ bearerAuthRefresh: [] }],
    response: {
      200: COMMON_CONTRACTS_V1.status,
      ...mapHttpErrorsToSchemaErrorCollection(pick([UnauthorizedException.name], defaultHttpErrorCollection)),
    },
  },

  refreshTokens: {
    summary: "Refresh authentication tokens.",
    security: [{ bearerAuthRefresh: [] }],
    response: {
      200: SIGN_IN_UP_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(pick([ResourceNotFoundException.name], defaultHttpErrorCollection)),
    },
  },
};

export default mixinTagForSchema(authSchemas, ["auth"]);
