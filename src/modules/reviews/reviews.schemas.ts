import { Type } from "@sinclair/typebox";
import { pick } from "rambda";

import { REVIEW_CREATE_INPUT_CONTRACT, REVIEW_OUTPUT_CONTRACT } from "./reviews.contracts.ts";
import { REVIEWS_PAGINATION_CONFIG } from "./reviews.pagination-config.ts";

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

const reviewsSchemas = {
  getByServiceId: generatePaginatedRouteSchema({
    config: REVIEWS_PAGINATION_CONFIG,
    description: "Get paginated list of reviews for a service",
    errorSchemas: mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    summary: "Get service reviews",
    tags: SWAGGER_TAGS.REVIEWS,
    paramsSchema: Type.Object({ serviceId: Type.String({ format: "uuid" }) }),
  }),

  create: {
    body: REVIEW_CREATE_INPUT_CONTRACT,
    description: "Create a review for a completed booking",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      201: REVIEW_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ConflictException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Create review",
    tags: SWAGGER_TAGS.REVIEWS,
  },
};

export default reviewsSchemas;
