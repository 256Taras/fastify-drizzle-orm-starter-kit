import { Type } from "@sinclair/typebox";

import { ERROR_CODE_FORMAT } from "#libs/constants/error-codes.js";

/**
 * Creates a TypeBox Union schema from an object or array of literal values
 *
 * @param {Record<string, string | number | boolean> | (string | number | boolean)[]} object - Enum values
 * @param {Record<string, unknown>} [options] - TypeBox options
 * @returns {import("@sinclair/typebox").TUnion}
 */
export const createEnumTypeUnionSchema = (object, options = {}) => {
  const values = Array.isArray(object) ? object : Object.values(object);
  return Type.Union(
    // @ts-ignore - TypeBox accepts literal values but TypeScript can't infer them properly
    values.map((item) => Type.Literal(item)),
    options,
  );
};

/**
 * @param {string[]} mimetypes
 * @returns {import("@sinclair/typebox").TObject}
 */
export const createFileTypeSchema = (mimetypes) => {
  /** @type {Record<string, import("@sinclair/typebox").TSchema>} */
  const baseSchema = {
    encoding: Type.Optional(Type.String()),
    filename: Type.Optional(Type.String()),
    limit: Type.Optional(Type.Boolean()),
  };

  baseSchema.mimetype =
    mimetypes && mimetypes.length > 0 ? Type.Optional(Type.String({ enum: mimetypes })) : Type.Optional(Type.String());

  return Type.Object(baseSchema, { isFile: true });
};

/**
 * @param {import("@sinclair/typebox").TSchema} dataType
 * @returns {import("@sinclair/typebox").TObject}
 */
export const paginationSchema = (dataType) =>
  Type.Object({
    data: Type.Array(dataType),
    meta: Type.Object({
      hasNextPage: Type.Boolean(),
      hasPreviousPage: Type.Boolean(),
      itemCount: Type.Number(),
      limit: Type.Number(),
      page: Type.Number(),
      pageCount: Type.Number(),
    }),
  });

const ERROR_DETAIL_SCHEMA = Type.Array(
  Type.Object({
    field: Type.String({ description: "Field associated with the error" }),
    location: createEnumTypeUnionSchema(["body", "query", "params", "headers"], {
      description: "Location of the error",
    }),
    message: Type.String({ description: "Error message" }),
    type: createEnumTypeUnionSchema(["userMessage", "developerMessage"], { description: "Type of message" }),
  }),
  { description: "Details of the error" },
);

/**
 * @param {{ statusCode: number; code: string; userMessage: string }} httpFastifyError
 * @returns {Record<string, import("@sinclair/typebox").TObject>}
 */
const mapHttpErrorToSchemaError = (httpFastifyError) => ({
  [`${httpFastifyError.statusCode}`]: Type.Object(
    {
      code: createEnumTypeUnionSchema([httpFastifyError.code], { description: "Error code" }),
      developerMessage: Type.String({ description: "Message for the developer" }),
      statusCode: createEnumTypeUnionSchema([httpFastifyError.statusCode], { description: "HTTP status code" }),
      url: Type.String({ description: "Error URL" }),
      userMessage: createEnumTypeUnionSchema([httpFastifyError.userMessage], { description: "Message for the user" }),
      // @ts-ignore
      ...(httpFastifyError.statusCode === 400 ? { errorDetails: ERROR_DETAIL_SCHEMA } : {}),
      traceId: Type.Optional(Type.String({ description: "Trace ID for debugging" })),
    },
    { additionalProperties: false },
  ),
});

/**
 * @param {string} fullCode
 * @returns {string}
 */
const extractHttpStatusCode = (fullCode) => fullCode.slice(0, ERROR_CODE_FORMAT.HTTP_STATUS_LENGTH);

/**
 * @param {string} fullCode
 * @returns {string}
 */
const extractCustomErrorCode = (fullCode) => {
  const startAt = ERROR_CODE_FORMAT.HTTP_STATUS_LENGTH + ERROR_CODE_FORMAT.DELIMITER_LENGTH;
  return fullCode.slice(startAt, startAt + ERROR_CODE_FORMAT.CUSTOM_CODE_LENGTH);
};

/**
 * @param {object} a
 * @param {object} b
 * @returns {number}
 */
const sortSchemaErrorsByCodeAsc = (a, b) => {
  const aCode = Object.keys(a)[0];
  const bCode = Object.keys(b)[0];

  const httpCompare = extractHttpStatusCode(aCode).localeCompare(extractHttpStatusCode(bCode));
  if (httpCompare !== 0) return httpCompare;

  return extractCustomErrorCode(aCode).localeCompare(extractCustomErrorCode(bCode));
};

/**
 * @param {object} httpErrorCollection
 * @returns {Record<string, import("@sinclair/typebox").TObject>[]}
 */
export const listHttpErrorsAsSchemaErrors = (httpErrorCollection) => {
  const list = Object.values(httpErrorCollection).map(mapHttpErrorToSchemaError);
  return list.sort(sortSchemaErrorsByCodeAsc);
};

/**
 * @param {object} httpErrorCollection
 * @returns {Record<string, import("@sinclair/typebox").TObject>}
 */
export const mapHttpErrorsToSchemaErrorCollection = (httpErrorCollection) => {
  const list = listHttpErrorsAsSchemaErrors(httpErrorCollection);
  return Object.fromEntries(list.map((item) => [Object.keys(item)[0], item[Object.keys(item)[0]]]));
};
