import { pick } from "rambda";

import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.js";
import { BadRequestException } from "#libs/errors/domain.errors.js";
import { generatePaginatedRouteSchema } from "#libs/pagination/index.js";
import { mapHttpErrorsToSchemaErrorCollection, mixinTagForSchema } from "#libs/utils/schemas.js";
import { USER_OUTPUT_CONTRACT } from "#modules/users/users.contracts.js";

import { USERS_PAGINATION_CONFIG } from "./users.pagination.config.js";

const usersSchemas = {
  getList: generatePaginatedRouteSchema({
    config: USERS_PAGINATION_CONFIG,
    description: "Get paginated list of users with filtering, sorting, and search",
    errorSchemas: mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    summary: "Get users list",
  }),

  getProfile: {
    description: "Get all information of an authorized user.",
    response: {
      200: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(defaultHttpErrorCollection),
    },
    summary: "Get User info.",
  },
};

// @ts-ignore - Fastify schema types are complex, auto-inference works correctly at runtime
export default mixinTagForSchema(usersSchemas, ["users"]);
