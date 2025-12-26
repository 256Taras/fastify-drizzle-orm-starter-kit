import { pick } from "rambda";

import { PAYMENT_OUTPUT_CONTRACT } from "./payments.contracts.ts";

import { SWAGGER_SECURITY } from "#libs/constants/swagger-security.constants.ts";
import { SWAGGER_TAGS } from "#libs/constants/swagger-tags.constants.ts";
import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.ts";
import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.ts";
import { BadRequestException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import { mapHttpErrorsToSchemaErrorCollection } from "#libs/utils/schemas.ts";

const paymentsSchemas = {
  getById: {
    description: "Get payment by ID",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      200: PAYMENT_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Get payment by ID",
    tags: SWAGGER_TAGS.PAYMENTS,
  },

  payBooking: {
    description: "Pay for a booking (mock payment)",
    params: COMMON_CONTRACTS_V1.id,
    response: {
      201: PAYMENT_OUTPUT_CONTRACT,
      ...mapHttpErrorsToSchemaErrorCollection(
        pick([BadRequestException.name, ResourceNotFoundException.name], defaultHttpErrorCollection),
      ),
    },
    security: SWAGGER_SECURITY.BEARER_TOKEN,
    summary: "Pay booking",
    tags: SWAGGER_TAGS.PAYMENTS,
  },
};

export default paymentsSchemas;
