import { pick } from "rambda";

import {
  BOOKING_CANCEL_INPUT_CONTRACT,
  BOOKING_CREATE_INPUT_CONTRACT,
  BOOKING_OUTPUT_CONTRACT,
} from "./bookings.contracts.ts";
import { BOOKINGS_PAGINATION_CONFIG } from "./bookings.pagination-config.ts";

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

const bookingsSchemas = {
  getMany: generatePaginatedRouteSchema({
    config: BOOKINGS_PAGINATION_CONFIG,
    description: "Get paginated list of my bookings",
    errorSchemas: mapHttpErrorsToSchemaErrorCollection(pick([BadRequestException.name], defaultHttpErrorCollection)),
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Get my bookings",
    tags: SWAGGER_TAGS.BOOKINGS,
  }),

  getOne: {
    description: "Get booking by ID",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: BOOKING_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Get booking by ID",
    tags: SWAGGER_TAGS.BOOKINGS,
  },

  createOne: {
    body: BOOKING_CREATE_INPUT_CONTRACT,
    description: "Create a new booking for a service",
    response: {
      201: BOOKING_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ConflictException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Create booking",
    tags: SWAGGER_TAGS.BOOKINGS,
  },

  cancelOne: {
    body: BOOKING_CANCEL_INPUT_CONTRACT,
    description: "Cancel booking by ID (with optional reason)",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: BOOKING_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Cancel booking",
    tags: SWAGGER_TAGS.BOOKINGS,
  },

  confirmOne: {
    description: "Confirm booking (provider only)",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: BOOKING_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Confirm booking",
    tags: SWAGGER_TAGS.BOOKINGS,
  },

  completeOne: {
    description: "Complete booking (provider only, after end time)",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: BOOKING_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick(
          [BadRequestException.name, ForbiddenException.name, ResourceNotFoundException.name],
          defaultHttpErrorCollection,
        ),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Complete booking",
    tags: SWAGGER_TAGS.BOOKINGS,
  },
};

export default bookingsSchemas;
