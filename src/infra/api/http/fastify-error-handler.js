/**
 * API layer errors/exceptions
 * Implement Fastify HTTP errors mapping using OOP in ES2023.
 */

import { requestContext } from "@fastify/request-context";

import {
  PAYLOAD_TOO_LARGE_413,
  RESOURCE_NOT_ACCEPTABLE_406,
  BAD_REQUEST_400,
  FAILED_ON_SERIALIZATION_VALIDATION_500,
  INTERNAL_SERVER_ERROR_500,
  UNSUPPORTED_MEDIA_TYPE_415,
  TOO_MANY_REQUESTS_429,
  INVALID_JSON_SYNTAX_400,
  ENDPOINT_NOT_FOUND_404,
} from "#libs/errors/http.errors.js";
import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.js";
import { logger } from "#libs/services/logger.service.js";
import { APP_CONFIG } from "#configs/index.js";

class ErrorHandler {
  #USER_MESSAGES = {
    required: () => `Field is required`,
    maxLength: (_, limit) => `Field should be no longer than ${limit} characters`,
    minLength: (_, limit) => `Field should be at least ${limit} characters`,
    pattern: () => `Field does not match the required format`,
  };

  constructor(errorCollectionOverride = defaultHttpErrorCollection) {
    this.errorCollectionOverride = errorCollectionOverride;
  }

  #mapFastifyErrorToHttpErrorResponse(fastifyError) {
    if (!fastifyError) return this.errorCollectionOverride[INTERNAL_SERVER_ERROR_500.name];

    const errorMapping = {
      400: this.errorCollectionOverride[INVALID_JSON_SYNTAX_400.name],
      406: this.errorCollectionOverride[RESOURCE_NOT_ACCEPTABLE_406.name],
      413: this.errorCollectionOverride[PAYLOAD_TOO_LARGE_413.name],
      415: this.errorCollectionOverride[UNSUPPORTED_MEDIA_TYPE_415.name],
      429: this.errorCollectionOverride[TOO_MANY_REQUESTS_429.name],
    };

    if (errorMapping[fastifyError.statusCode]) return errorMapping[fastifyError.statusCode];
    if (fastifyError.validation) return this.errorCollectionOverride[BAD_REQUEST_400.name];
    if (fastifyError.serialization) return this.errorCollectionOverride[FAILED_ON_SERIALIZATION_VALIDATION_500.name];
    return this.errorCollectionOverride[fastifyError.name] ?? this.errorCollectionOverride[INTERNAL_SERVER_ERROR_500.name];
  }

  #formatErrorMessage(validationError, field) {
    const formatter = this.#USER_MESSAGES[validationError.keyword];
    if (!formatter) return null;

    const additionalParam = validationError.params.limit ?? (validationError.params.format || validationError.params.type);
    return formatter(field, additionalParam);
  }

  #mapAjvErrorToUserFriendly(err) {
    return err.validation.map((validationError) => {
      const field = validationError.params.missingProperty ?? validationError.instancePath.replace(/^\//, "");
      const userMessage = this.#formatErrorMessage(validationError, field);

      return {
        type: userMessage ? "userMessage" : "developerMessage",
        message: userMessage || validationError.message,
        location: err.validationContext,
        field,
      };
    });
  }

  #formatErrorResponse(fastifyError, httpErrorResponseTemplate) {
    if (!fastifyError || !httpErrorResponseTemplate?.developerMessage) return httpErrorResponseTemplate;

    const errorDetails =
      fastifyError.validation && fastifyError.validation.length > 0
        ? this.#mapAjvErrorToUserFriendly(fastifyError)
        : undefined;

    return {
      // @ts-ignore
      traceId: requestContext.get("traceId"),
      errorDetails,
      ...httpErrorResponseTemplate,
      developerMessage: APP_CONFIG.isDeveloperMessageEnabled ? httpErrorResponseTemplate.developerMessage : undefined,
    };
  }

  async handleFastifyError(fastifyError, _, reply) {
    logger.debug(fastifyError);
    const httpErrorResponseTemplate = this.#mapFastifyErrorToHttpErrorResponse(fastifyError);
    const httpErrorResponse = this.#formatErrorResponse(fastifyError, httpErrorResponseTemplate);
    httpErrorResponse.url = reply.request.url;
    reply.status(httpErrorResponse?.statusCode ?? 500).send(httpErrorResponse);
  }

  async handle404Error(request, reply) {
    const httpErrorResponse = this.errorCollectionOverride[ENDPOINT_NOT_FOUND_404.name];
    httpErrorResponse.userMessage = `Endpoint '${request.method} ${request.url}' is not found`;
    httpErrorResponse.developerMessage = `Endpoint '${request.method} ${request.url}' is not found. Please, check if the requested URI is correct`;
    httpErrorResponse.url = reply.request.url;
    reply.status(httpErrorResponse.statusCode).send(httpErrorResponse);
  }
}

// Export instances or class itself depending on need.
export const globalErrorHandler = new ErrorHandler();
export const globalHttpFastify404ErrorHandler = globalErrorHandler.handle404Error.bind(globalErrorHandler);
export const globalHttpFastifyErrorHandler = globalErrorHandler.handleFastifyError.bind(globalErrorHandler);
