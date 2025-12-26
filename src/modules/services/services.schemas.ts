import { Type } from "@sinclair/typebox";
import { pick } from "rambda";

import {
  SERVICE_CREATE_INPUT_CONTRACT,
  SERVICE_OUTPUT_CONTRACT,
  SERVICE_UPDATE_INPUT_CONTRACT,
} from "./services.contracts.ts";
import { SERVICES_PAGINATION_CONFIG } from "./services.pagination-config.ts";

import { SWAGGER_SECURITY } from "#libs/constants/swagger-security.constants.ts";
import { SWAGGER_TAGS } from "#libs/constants/swagger-tags.constants.ts";
import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.ts";
import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.ts";
import { BadRequestException, ForbiddenException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import { generatePaginatedRouteSchema } from "#libs/pagination/index.ts";
import { mapHttpErrorsToSchemaErrorCollection } from "#libs/utils/schemas.ts";

const servicesSchemas = {
  getMany: generatePaginatedRouteSchema({
    config: SERVICES_PAGINATION_CONFIG,
    description: "Get paginated list of active services with filtering and sorting",
    errorSchemas: mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    summary: "Get services list",
    tags: SWAGGER_TAGS.SERVICES,
  }),

  getOne: {
    tags: SWAGGER_TAGS.SERVICES,
    description: "Get service by ID",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: SERVICE_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
    summary: "Get service by ID",
  },

  createOne: {
    body: SERVICE_CREATE_INPUT_CONTRACT,
    description: "Create a new service for a provider",
    params: Type.Object({ providerId: Type.String({ format: "uuid" }) }),
    response: {
      201: SERVICE_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Create service",
    tags: SWAGGER_TAGS.SERVICES,
  },

  updateOne: {
    body: SERVICE_UPDATE_INPUT_CONTRACT,
    description: "Update service by ID (owner only)",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: SERVICE_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Update service",
    tags: SWAGGER_TAGS.SERVICES,
  },

  deleteOne: {
    description: "Delete service by ID (owner only, soft delete)",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: SERVICE_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Delete service",
    tags: SWAGGER_TAGS.SERVICES,
  },
};

export default servicesSchemas;
