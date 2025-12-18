/* eslint-disable security/detect-object-injection */
/** API layer errors/exceptions Implement Fastify HTTP errors mapping using OOP in ES2023. */

import { requestContext } from "@fastify/request-context";
import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

import { defaultHttpErrorCollection } from "#libs/errors/default-http-error-collection.ts";
import type { HttpErrorEntry } from "#libs/errors/default-http-error-collection.ts";
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
} from "#libs/errors/http.errors.ts";
import { logger } from "#libs/logging/logger.service.ts";

type HttpErrorResponse = {
  errorDetails?: Array<{
    field: string;
    location: string;
    message: string;
    type: string;
  }>;
  traceId?: string;
  url?: string;
} & HttpErrorEntry;

type ValidationError = {
  instancePath?: string;
  keyword: string;
  message?: string;
  params?: { format?: string; limit?: number; missingProperty?: string; type?: string };
};

class ErrorHandler {
  errorCollectionOverride: Record<string, HttpErrorEntry>;

  readonly #LOCATION_MAP = {
    querystring: "query",
    body: "body",
    params: "params",
    headers: "headers",
  } as const;

  readonly #USER_MESSAGES: Record<string, (field: string, param?: number | string) => null | string> = {
    maxLength: (_: string, limit?: number | string) => `Field should be no longer than ${limit} characters`,
    minLength: (_: string, limit?: number | string) => `Field should be at least ${limit} characters`,
    pattern: () => `Field does not match the required format`,
    required: () => `Field is required`,
  };

  constructor(errorCollectionOverride: Record<string, HttpErrorEntry> = defaultHttpErrorCollection) {
    this.errorCollectionOverride = errorCollectionOverride;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async handle404Error(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const httpErrorResponse = { ...this.errorCollectionOverride[ENDPOINT_NOT_FOUND_404.name] };
    httpErrorResponse.userMessage = `Endpoint '${request.method} ${request.url}' is not found`;
    httpErrorResponse.developerMessage = `Endpoint '${request.method} ${request.url}' is not found. Please, check if the requested URI is correct`;
    (httpErrorResponse as HttpErrorResponse).url = reply.request.url;
    reply.status(httpErrorResponse.statusCode).send(httpErrorResponse);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async handleFastifyError(fastifyError: FastifyError, _: FastifyRequest, reply: FastifyReply): Promise<void> {
    logger.debug(fastifyError);
    const httpErrorResponseTemplate = this.#mapFastifyErrorToHttpErrorResponse(fastifyError);
    const httpErrorResponse = this.#formatErrorResponse(fastifyError, httpErrorResponseTemplate);
    httpErrorResponse.url = reply.request.url;
    reply.status(httpErrorResponse?.statusCode ?? 500).send(httpErrorResponse);
  }

  #formatErrorMessage(validationError: ValidationError, field: string): null | string {
    const keyword = validationError.keyword;
    const formatter = this.#USER_MESSAGES[keyword];
    if (!formatter) return null;

    const additionalParam =
      validationError.params?.limit ?? (validationError.params?.format || validationError.params?.type);
    return formatter(field, additionalParam);
  }

  #formatErrorResponse(fastifyError: FastifyError, httpErrorResponseTemplate: HttpErrorEntry): HttpErrorResponse {
    if (!fastifyError || !httpErrorResponseTemplate?.developerMessage) {
      return httpErrorResponseTemplate as HttpErrorResponse;
    }

    const errorDetails =
      fastifyError.validation && fastifyError.validation.length > 0
        ? this.#mapAjvErrorToUserFriendly(fastifyError)
        : undefined;

    const traceId = requestContext.get("traceId");
    return {
      errorDetails,
      traceId,
      ...httpErrorResponseTemplate,
    };
  }

  #mapAjvErrorToUserFriendly(
    err: { validationContext?: string } & FastifyError,
  ): Array<{ field: string; location: string; message: string; type: string }> {
    if (!err.validation) return [];

    const validationContext = err.validationContext;
    let location = "unknown";
    if (validationContext) {
      const locationMap = this.#LOCATION_MAP;
      location = validationContext in locationMap ? locationMap[validationContext] : validationContext;
    }

    return err.validation.map((validationError) => {
      const missingProperty = validationError.params?.missingProperty;
      const instancePath = validationError.instancePath?.replace(/^\//, "");
      const field = typeof missingProperty === "string" ? missingProperty : (instancePath ?? "");
      const userMessage = this.#formatErrorMessage(validationError, field);

      return {
        field,
        location,
        message: userMessage || validationError.message || "",
        type: userMessage ? "userMessage" : "developerMessage",
      };
    });
  }

  #mapFastifyErrorToHttpErrorResponse(fastifyError: { serialization?: boolean } & FastifyError): HttpErrorEntry {
    if (!fastifyError) return this.errorCollectionOverride[INTERNAL_SERVER_ERROR_500.name];

    const errorMapping: Record<number, HttpErrorEntry> = {
      400: this.errorCollectionOverride[INVALID_JSON_SYNTAX_400.name],
      406: this.errorCollectionOverride[RESOURCE_NOT_ACCEPTABLE_406.name],
      413: this.errorCollectionOverride[PAYLOAD_TOO_LARGE_413.name],
      415: this.errorCollectionOverride[UNSUPPORTED_MEDIA_TYPE_415.name],
      429: this.errorCollectionOverride[TOO_MANY_REQUESTS_429.name],
    };

    if (fastifyError.statusCode && errorMapping[fastifyError.statusCode]) {
      return errorMapping[fastifyError.statusCode];
    }
    if (fastifyError.validation) {
      return this.errorCollectionOverride[BAD_REQUEST_400.name];
    }
    if (fastifyError.serialization) {
      return this.errorCollectionOverride[FAILED_ON_SERIALIZATION_VALIDATION_500.name];
    }
    return (
      this.errorCollectionOverride[fastifyError.name || ""] ?? this.errorCollectionOverride[INTERNAL_SERVER_ERROR_500.name]
    );
  }
}

// Export instances or class itself depending on need.
export const globalErrorHandler = new ErrorHandler();
export const globalHttpFastify404ErrorHandler = globalErrorHandler.handle404Error.bind(globalErrorHandler);
export const globalHttpFastifyErrorHandler = globalErrorHandler.handleFastifyError.bind(globalErrorHandler);
