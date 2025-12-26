import { pick } from "rambda";

import {
  PROVIDER_CREATE_INPUT_CONTRACT,
  PROVIDER_OUTPUT_CONTRACT,
  PROVIDER_UPDATE_INPUT_CONTRACT,
} from "./providers.contracts.ts";
import { PROVIDERS_PAGINATION_CONFIG } from "./providers.pagination-config.ts";

import { SWAGGER_SECURITY } from "#libs/constants/swagger-security.constants.ts";
import { SWAGGER_TAGS } from "#libs/constants/swagger-tags.constants.ts";
import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.ts";
import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.ts";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  ResourceNotFoundException,
} from "#libs/errors/domain.errors.ts";
import { generatePaginatedRouteSchema } from "#libs/pagination/index.ts";
import { mapHttpErrorsToSchemaErrorCollection } from "#libs/utils/schemas.ts";

const providersSchemas = {
  getMany: generatePaginatedRouteSchema({
    config: PROVIDERS_PAGINATION_CONFIG,
    description: "Get paginated list of providers with filtering and sorting",
    errorSchemas: mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    summary: "Get providers list",
    tags: SWAGGER_TAGS.PROVIDERS,
  }),

  getOne: {
    tags: SWAGGER_TAGS.PROVIDERS,
    description: "Get provider by ID",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: PROVIDER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Get provider by ID",
  },

  createOne: {
    body: PROVIDER_CREATE_INPUT_CONTRACT,
    description: "Create a new provider profile (one per user)",
    response: {
      201: PROVIDER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ConflictException.name], defaultHttpErrorCollection),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Create provider",
    tags: SWAGGER_TAGS.PROVIDERS,
  },

  updateOne: {
    body: PROVIDER_UPDATE_INPUT_CONTRACT,
    description: "Update provider by ID (owner only)",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: PROVIDER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Update provider",
    tags: SWAGGER_TAGS.PROVIDERS,
  },

  deleteOne: {
    description: "Delete provider by ID (owner only, soft delete)",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: PROVIDER_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Delete provider",
    tags: SWAGGER_TAGS.PROVIDERS,
  },
};

export default providersSchemas;
