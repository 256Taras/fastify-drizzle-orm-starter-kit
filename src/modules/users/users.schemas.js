import { pick } from "rambda";

import { USERS_PAGINATION_CONFIG } from "./users.pagination.config.js";

import { SWAGGER_TAGS } from "#libs/constants/swagger-tags.constants.js";
import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.js";
import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.js";
import { BadRequestException, ConflictException, ResourceNotFoundException } from "#libs/errors/domain.errors.js";
import { generatePaginatedRouteSchema } from "#libs/pagination/index.js";
import { mapHttpErrorsToSchemaErrorCollection } from "#libs/utils/schemas.js";
import {
  USER_CREATE_INPUT_CONTRACT,
  USER_OUTPUT_CONTRACT,
  USER_UPDATE_INPUT_CONTRACT,
} from "#modules/users/users.contracts.js";

const usersSchemas = {
  getList: generatePaginatedRouteSchema({
    config: USERS_PAGINATION_CONFIG,
    description: "Get paginated list of users with filtering, sorting, and search",
    errorSchemas: mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    summary: "Get users list",
    tags: SWAGGER_TAGS.USERS,
  }),

  getProfile: {
    tags: SWAGGER_TAGS.USERS,
    description: "Get all information of an authorized user.",
    response: {
      200: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(defaultHttpErrorCollection),
    },
    summary: "Get User info.",
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

// @ts-ignore - Fastify schema types are complex, auto-inference works correctly at runtime
export default usersSchemas;
