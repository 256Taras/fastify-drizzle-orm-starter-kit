import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  ResourceAlreadyExistException,
  ResourceNotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from "./domain.errors.ts";
import {
  BAD_REQUEST_400,
  ENDPOINT_NOT_FOUND_404,
  FAILED_ON_SERIALIZATION_VALIDATION_500,
  INTERNAL_SERVER_ERROR_500,
  INVALID_JSON_SYNTAX_400,
  PAYLOAD_TOO_LARGE_413,
  RESOURCE_NOT_ACCEPTABLE_406,
  SERVER_TIMEOUT_408,
  SERVICE_UNAVAILABLE_EXCEPTION_503,
  TOO_MANY_REQUESTS_429,
  UNAUTHORIZED_ACCESS_401,
  UNSUPPORTED_MEDIA_TYPE_415,
} from "./http.errors.ts";

/**
 * HTTP error entry structure
 */
export type HttpErrorEntry = {
  code: string;
  developerMessage: string;
  statusCode: number;
  userMessage: string;
};

/**
 * Collection of default HTTP error definitions Maps error class names to their HTTP error entry configurations
 */
export const defaultHttpErrorCollection: Record<string, HttpErrorEntry> = {
  [BAD_REQUEST_400.name]: {
    code: "400000",
    developerMessage: "Bad request",
    statusCode: 400,
    userMessage: "Bad request",
  },
  [BadRequestException.name]: {
    code: "400001",
    developerMessage: "Bad request",
    statusCode: 400,
    userMessage: "Bad request",
  },
  [ConflictException.name]: {
    code: "409001",
    developerMessage: "Conflict",
    statusCode: 409,
    userMessage: "Conflict",
  },
  [ENDPOINT_NOT_FOUND_404.name]: {
    code: "404001",
    developerMessage: "Endpoint not found",
    statusCode: 404,
    userMessage: "Endpoint not found",
  },
  [FAILED_ON_SERIALIZATION_VALIDATION_500.name]: {
    code: "500002",
    developerMessage: "Failed on serialization validation",
    statusCode: 500,
    userMessage: "Internal server error",
  },
  [ForbiddenException.name]: {
    code: "4003000",
    developerMessage: "Unable to access for this user",
    statusCode: 403,
    userMessage: "You do not have permission to access this resource",
  },
  [INTERNAL_SERVER_ERROR_500.name]: {
    code: "500000",
    developerMessage: "Server is on coffee time",
    statusCode: 500,
    userMessage: "Internal server error",
  },
  [INVALID_JSON_SYNTAX_400.name]: {
    code: "400001",
    developerMessage: "The JSON sent in the request has an invalid syntax.",
    statusCode: 400,
    userMessage: "Bad request",
  },
  [PAYLOAD_TOO_LARGE_413.name]: {
    code: "413000",
    developerMessage: "Payload too large",
    statusCode: 413,
    userMessage: "Payload too large",
  },
  [RESOURCE_NOT_ACCEPTABLE_406.name]: {
    code: "406000",
    developerMessage: "Not acceptable",
    statusCode: 406,
    userMessage: "Not acceptable",
  },
  [ResourceAlreadyExistException.name]: {
    code: "409000",
    developerMessage: "Conflict",
    statusCode: 409,
    userMessage: "Conflict",
  },
  [ResourceNotFoundException.name]: {
    code: "404000",
    developerMessage: "Resource not found",
    statusCode: 404,
    userMessage: "Resource not found",
  },
  [SERVER_TIMEOUT_408.name]: {
    code: "4008000",
    developerMessage: "The server did not receive a complete request message within the time that it was prepared to wait.",
    statusCode: 408,
    userMessage: "Server timeout",
  },
  [SERVICE_UNAVAILABLE_EXCEPTION_503.name]: {
    code: "503000",
    developerMessage: "Service Unavailable",
    statusCode: 503,
    userMessage: "Service Unavailable",
  },
  [TOO_MANY_REQUESTS_429.name]: {
    code: "429000",
    developerMessage: "Too many requests",
    statusCode: 429,
    userMessage: "Too many requests",
  },
  [UNAUTHORIZED_ACCESS_401.name]: {
    code: "40100",
    developerMessage: "JWT is not valid",
    statusCode: 401,
    userMessage: "Unauthorized",
  },
  [UnauthorizedException.name]: {
    code: "40101",
    developerMessage: "Access to this resource is denied",
    statusCode: 401,
    userMessage: "Unauthorized",
  },
  [UnprocessableEntityException.name]: {
    code: "422000",
    developerMessage: "Unprocessable entity",
    statusCode: 422,
    userMessage: "Unprocessable entity",
  },
  [UNSUPPORTED_MEDIA_TYPE_415.name]: {
    code: "415000",
    developerMessage: "Unsupported media type",
    statusCode: 415,
    userMessage: "Unsupported media type",
  },
};
