import { Type } from "@sinclair/typebox";
import { pick } from "rambda";

import { SWAGGER_TAGS } from "#libs/constants/swagger-tags.constants.js";
import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.js";
import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.js";
import {
  BadRequestException,
  ConflictException,
  ResourceNotFoundException,
  UnauthorizedException,
} from "#libs/errors/domain.errors.js";
import { mapHttpErrorsToSchemaErrorCollection } from "#libs/utils/schemas.js";
import { SIGN_IN_UP_OUTPUT_CONTRACT, SIGN_UP_INPUT_CONTRACT } from "#modules/auth/auth.contracts.js";

const authSchemas = {
  logOut: {
    tags: SWAGGER_TAGS.AUTH,
    response: {
      200: COMMON_CONTRACTS_V1.status,
      ...mapHttpErrorsToSchemaErrorCollection(pick([UnauthorizedException.name], defaultHttpErrorCollection)),
    },
    security: [{ bearerAuthRefresh: [] }],
    summary: "Log out authentication user",
  },

  refreshTokens: {
    tags: SWAGGER_TAGS.AUTH,
    response: {
      200: SIGN_IN_UP_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(pick([ResourceNotFoundException.name], defaultHttpErrorCollection)),
    },
    security: [{ bearerAuthRefresh: [] }],
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
};

export default authSchemas;
