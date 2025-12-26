import { pick } from "rambda";

import { USER_CREATE_INPUT_CONTRACT, USER_OUTPUT_CONTRACT, USER_UPDATE_INPUT_CONTRACT } from "./users.contracts.ts";
import { USERS_PAGINATION_CONFIG } from "./users.pagination-config.ts";

import { SWAGGER_SECURITY } from "#libs/constants/swagger-security.constants.ts";
import { SWAGGER_TAGS } from "#libs/constants/swagger-tags.constants.ts";
import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.ts";
import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.ts";
import { BadRequestException, ConflictException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import { generatePaginatedRouteSchema } from "#libs/pagination/index.ts";
import { mapHttpErrorsToSchemaErrorCollection } from "#libs/utils/schemas.ts";

const usersSchemas = {
  getList: generatePaginatedRouteSchema({
    config: USERS_PAGINATION_CONFIG,
    description: "Get paginated list of users with filtering, sorting, and search",
    errorSchemas: mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    summary: "Get users list",
    tags: SWAGGER_TAGS.USERS,
  }),

  getProfile: {
    description: "Get all information of an authorized user.",
    response: {
      200: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(defaultHttpErrorCollection),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Get User info.",
    tags: SWAGGER_TAGS.USERS,
  },

  getById: {
    tags: SWAGGER_TAGS.USERS,
    description: "Get user by ID",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Get user by ID",
  },

  create: {
    tags: SWAGGER_TAGS.USERS,
    body: USER_CREATE_INPUT_CONTRACT,
    description: "Create a new user",
    response: {
      201: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ConflictException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Create user",
  },

  update: {
    tags: SWAGGER_TAGS.USERS,
    body: USER_UPDATE_INPUT_CONTRACT,
    description: "Update user by ID",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ConflictException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Update user",
  },

  delete: {
    tags: SWAGGER_TAGS.USERS,
    description: "Delete user by ID (soft delete)",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Delete user",
  },
};

export default usersSchemas;
