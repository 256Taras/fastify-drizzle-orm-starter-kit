import { pick } from "rambda";

import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.js";
import { BadRequestException } from "#libs/errors/domain.errors.js";
import { mapHttpErrorsToSchemaErrorCollection, mixinTagForSchema } from "#libs/utils/schemas.js";
import { USER_INPUT_LIST, USER_OUTPUT_CONTRACT, USER_OUTPUT_LIST } from "#modules/users/users.contracts.js";

const usersSchemas = {
  getList: {
    description: "Get all information of an authorized user.",
    querystring: USER_INPUT_LIST,
    response: {
      200: USER_OUTPUT_LIST,
      ...mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    },
    summary: "Get User info.",
  },

  getProfile: {
    description: "Get all information of an authorized user.",
    response: {
      200: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(defaultHttpErrorCollection),
    },
    summary: "Get User info.",
  },
};

export default mixinTagForSchema(usersSchemas, ["users"]);
