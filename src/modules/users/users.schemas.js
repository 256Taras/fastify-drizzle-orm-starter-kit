import { pick } from "rambda";

import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.js";
import { BadRequestException } from "#libs/errors/domain.errors.js";
import { USER_INPUT_LIST, USER_OUTPUT_CONTRACT, USER_OUTPUT_LIST } from "#modules/users/users.contracts.js";
import { mapHttpErrorsToSchemaErrorCollection, mixinTagForSchema } from "#libs/utils/schemas.js";

const usersSchemas = {
  getProfile: {
    description: "Get all information of an authorized user.",
    summary: "Get User info.",
    response: {
      200: USER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(defaultHttpErrorCollection),
    },
  },

  getList: {
    description: "Get all information of an authorized user.",
    summary: "Get User info.",
    querystring: USER_INPUT_LIST,
    response: {
      200: USER_OUTPUT_LIST,
      ...mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    },
  },
};

export default mixinTagForSchema(usersSchemas, ["users"]);
