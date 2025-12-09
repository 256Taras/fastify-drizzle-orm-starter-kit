/** API layer errors/exceptions Implement Fastify HTTP errors mapping using OOP in ES2023. */

import { requestContext } from "@fastify/request-context";

import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.js";
import {
  BAD_REQUEST_400,
  ENDPOINT_NOT_FOUND_404,
  FAILED_ON_SERIALIZATION_VALIDATION_500,
  INTERNAL_SERVER_ERROR_500,
  INVALID_JSON_SYNTAX_400,
  PAYLOAD_TOO_LARGE_413,
  RESOURCE_NOT_ACCEPTABLE_406,
  TOO_MANY_REQUESTS_429,
  UNSUPPORTED_MEDIA_TYPE_415,
} from "#libs/errors/http.errors.js";
import { logger } from "#libs/logging/logger.service.js";

class ErrorHandler {
  #LOCATION_MAP = {
    querystring: "query",
    body: "body",
    params: "params",
    headers: "headers",
  };

  #USER_MESSAGES = {
    /**
     * @param {string} _
     * @param {number} limit
     */
    maxLength: (_, limit) => `Field should be no longer than ${limit} characters`,
    /**
     * @param {string} _
     * @param {number} limit
     */
    minLength: (_, limit) => `Field should be at least ${limit} characters`,
    pattern: () => `Field does not match the required format`,
    required: () => `Field is required`,
  };

  /**
   * @typedef {object} HttpErrorResponse
   * @property {string | number} code - Error code
   * @property {string} developerMessage - Message for developers
   * @property {string} userMessage - Message for users
   * @property {number} statusCode - HTTP status code
   * @property {string} [url] - Request URL
   * @property {{ field: string; location: string; message: string; type: string }[]} [errorDetails] - Error details
   */

  /** @param {Record<string, HttpErrorResponse>} errorCollectionOverride */
  constructor(errorCollectionOverride = defaultHttpErrorCollection) {
    /** @type {Record<string, HttpErrorResponse>} */
    this.errorCollectionOverride = errorCollectionOverride;
  }

  /**
   * @param {import("fastify").FastifyRequest} request
   * @param {import("fastify").FastifyReply} reply
   */
  async handle404Error(request, reply) {
    /** @type {HttpErrorResponse} */
    const httpErrorResponse = this.errorCollectionOverride[ENDPOINT_NOT_FOUND_404.name];
    httpErrorResponse.userMessage = `Endpoint '${request.method} ${request.url}' is not found`;
    httpErrorResponse.developerMessage = `Endpoint '${request.method} ${request.url}' is not found. Please, check if the requested URI is correct`;
    httpErrorResponse.url = reply.request.url;
    reply.status(httpErrorResponse.statusCode).send(httpErrorResponse);
  }

  /**
   * @param {import("fastify").FastifyError} fastifyError
   * @param {import("fastify").FastifyRequest} _
   * @param {import("fastify").FastifyReply} reply
   */
  async handleFastifyError(fastifyError, _, reply) {
    logger.debug(fastifyError);
    const httpErrorResponseTemplate = this.#mapFastifyErrorToHttpErrorResponse(fastifyError);
    const httpErrorResponse = this.#formatErrorResponse(fastifyError, httpErrorResponseTemplate);
    httpErrorResponse.url = reply.request.url;
    reply.status(httpErrorResponse?.statusCode ?? 500).send(httpErrorResponse);
  }

  /**
   * @param {{ keyword: string; params?: { limit?: number; format?: string; type?: string } }} validationError
   * @param {string} field
   */
  #formatErrorMessage(validationError, field) {
    const keyword = validationError.keyword;
    // @ts-ignore - keyword is checked to be valid before usage
    const formatter = this.#USER_MESSAGES[keyword];
    if (!formatter) return null;

    const additionalParam =
      validationError.params?.limit ?? (validationError.params?.format || validationError.params?.type);
    return formatter(field, additionalParam);
  }

  /**
   * @param {import("fastify").FastifyError} fastifyError
   * @param {HttpErrorResponse} httpErrorResponseTemplate
   * @returns {HttpErrorResponse}
   */
  #formatErrorResponse(fastifyError, httpErrorResponseTemplate) {
    if (!fastifyError || !httpErrorResponseTemplate?.developerMessage) return httpErrorResponseTemplate;

    const errorDetails =
      fastifyError.validation && fastifyError.validation.length > 0
        ? this.#mapAjvErrorToUserFriendly(fastifyError)
        : undefined;

    return {
      errorDetails,
      // @ts-ignore
      traceId: requestContext.get("traceId"),
      ...httpErrorResponseTemplate,
    };
  }

  /** @param {import("fastify").FastifyError & { validationContext?: string }} err */
  #mapAjvErrorToUserFriendly(err) {
    if (!err.validation) return [];

    const location = err.validationContext
      ? this.#LOCATION_MAP[/** @type {keyof typeof this.#LOCATION_MAP} */ err.validationContext] || err.validationContext
      : "unknown";

    return err.validation.map((validationError) => {
      const field = String(
        validationError.params?.missingProperty ?? validationError.instancePath?.replace(/^\//, "") ?? "",
      );
      const userMessage = this.#formatErrorMessage(validationError, field);

      return {
        field,
        location,
        message: userMessage || validationError.message,
        type: userMessage ? "userMessage" : "developerMessage",
      };
    });
  }

  /**
   * @param {import("fastify").FastifyError & { serialization?: boolean }} fastifyError
   * @returns {HttpErrorResponse}
   */
  #mapFastifyErrorToHttpErrorResponse(fastifyError) {
    if (!fastifyError) return this.errorCollectionOverride[INTERNAL_SERVER_ERROR_500.name];

    /** @type {Record<number, HttpErrorResponse>} */
    const errorMapping = {
      400: this.errorCollectionOverride[INVALID_JSON_SYNTAX_400.name],
      406: this.errorCollectionOverride[RESOURCE_NOT_ACCEPTABLE_406.name],
      413: this.errorCollectionOverride[PAYLOAD_TOO_LARGE_413.name],
      415: this.errorCollectionOverride[UNSUPPORTED_MEDIA_TYPE_415.name],
      429: this.errorCollectionOverride[TOO_MANY_REQUESTS_429.name],
    };

    if (fastifyError.statusCode && errorMapping[fastifyError.statusCode]) return errorMapping[fastifyError.statusCode];
    if (fastifyError.validation) return this.errorCollectionOverride[BAD_REQUEST_400.name];
    if (fastifyError.serialization) return this.errorCollectionOverride[FAILED_ON_SERIALIZATION_VALIDATION_500.name];
    return (
      this.errorCollectionOverride[fastifyError.name || ""] ?? this.errorCollectionOverride[INTERNAL_SERVER_ERROR_500.name]
    );
  }
}

// Export instances or class itself depending on need.
export const globalErrorHandler = new ErrorHandler();
export const globalHttpFastify404ErrorHandler = globalErrorHandler.handle404Error.bind(globalErrorHandler);
export const globalHttpFastifyErrorHandler = globalErrorHandler.handleFastifyError.bind(globalErrorHandler);
