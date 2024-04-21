import { Type } from "@sinclair/typebox";

/**
 * Mixes a tag into each schema within a collection of schemas.
 * @template T
 * @param {T} schemas - The schemas to tag.
 * @param {string[]} tag - The tag to add to each schema.
 * @returns {T} The tagged schemas.
 */
export const mixinTagForSchema = (schemas, tag) => {
  // @ts-ignore
  Object.keys(schemas).forEach((k) => {
    schemas[k].tags = tag;
  });
  return schemas;
};

export const createEnumTypeUnionSchema = (object, otp = {}) =>
  Type.Union(
    // @ts-ignore
    Object.values(object).map((item) => Type.Literal(item)),
    otp,
  );

export const createFileTypeSchema = (mimetypes) => {
  const baseSchema = {
    encoding: Type.Optional(Type.String()),
    filename: Type.Optional(Type.String()),
    limit: Type.Optional(Type.Boolean()),
  };

  if (mimetypes && mimetypes.length) {
    baseSchema.mimetype = Type.Optional(Type.String({ enum: mimetypes }));
  } else {
    baseSchema.mimetype = Type.Optional(Type.String());
  }

  return Type.Object(baseSchema, { isFile: true });
};

export const paginationSchema = (dataType) =>
  Type.Object({
    meta: Type.Object({
      itemCount: Type.Number(),
      pageCount: Type.Number(),
      page: Type.Number(),
      limit: Type.Number(),
      hasPreviousPage: Type.Boolean(),
      hasNextPage: Type.Boolean(),
    }),
    data: Type.Array(dataType),
  });

const HTTP_STATUS_CODE_LENGTH = 3;
const CUSTOM_ERROR_CODE_LENGTH = 6;
const DELIMITER_CODE_LENGTH = 3;
const ERROR_DETAIL_SCHEMA = Type.Array(
  Type.Object({
    type: createEnumTypeUnionSchema(["userMessage", "developerMessage"], { description: "Type of message" }),
    message: Type.String({ description: "Error message" }),
    field: Type.String({ description: "Field associated with the error" }),
    location: createEnumTypeUnionSchema(["body", "query", "params", "headers"], {
      description: "Location of the error",
    }),
  }),
  { description: "Details of the error" },
);

const mapHttpErrorToSchemaError = (httpFastifyError) => ({
  [`${httpFastifyError.statusCode}`]: Type.Object(
    {
      url: Type.String({ description: "Error URL" }),
      code: createEnumTypeUnionSchema([httpFastifyError.code], { description: "Error code" }),
      statusCode: createEnumTypeUnionSchema([httpFastifyError.statusCode], { description: "HTTP status code" }),
      userMessage: createEnumTypeUnionSchema([httpFastifyError.userMessage], { description: "Message for the user" }),
      developerMessage: Type.String({ description: "Message for the developer" }),
      // @ts-ignore
      ...(httpFastifyError.statusCode === 400 ? { errorDetails: ERROR_DETAIL_SCHEMA } : {}),
      traceId: Type.Optional(Type.String({ description: "Trace ID for debugging" })),
    },
    { additionalProperties: false },
  ),
});

/**
 * Sorts errors by their full codes in ascending orders.
 * @param {object} a First error object to compare.
 * @param {object} b Second error object to compare.
 */
const sortSchemaErrorsByCodeAsc = (a, b) => {
  const aFullCode = Object.keys(a)[0];
  const bFullCode = Object.keys(b)[0];

  const aHttpStatusCode = aFullCode.slice(0, HTTP_STATUS_CODE_LENGTH);
  const bHttpStatusCode = bFullCode.slice(0, HTTP_STATUS_CODE_LENGTH);

  if (aHttpStatusCode > bHttpStatusCode) return 1;
  if (aHttpStatusCode < bHttpStatusCode) return -1;

  const errorCodeStartAt = HTTP_STATUS_CODE_LENGTH + DELIMITER_CODE_LENGTH;
  const aCustomErrorCode = aFullCode.slice(errorCodeStartAt, errorCodeStartAt + CUSTOM_ERROR_CODE_LENGTH);
  const bCustomErrorCode = bFullCode.slice(errorCodeStartAt, errorCodeStartAt + CUSTOM_ERROR_CODE_LENGTH);

  return aCustomErrorCode.localeCompare(bCustomErrorCode);
};

/**
 * Converts an HTTP error collection to a sorted list of Fastify AJV schema errors.
 * @param {object} httpErrorCollection Collection of HTTP errors.
 */
export const listHttpErrorsAsSchemaErrors = (httpErrorCollection) => {
  const list = [...Object.values(httpErrorCollection).map(mapHttpErrorToSchemaError)];
  return list.sort(sortSchemaErrorsByCodeAsc);
};

/**
 * Converts an HTTP error collection to a collection of Fastify AJV schema errors.
 * @param {object} httpErrorCollection Collection of HTTP errors.
 */
export const mapHttpErrorsToSchemaErrorCollection = (httpErrorCollection) => {
  const list = listHttpErrorsAsSchemaErrors(httpErrorCollection);
  return list.reduce((obj, item) => ({ ...obj, [Object.keys(item)[0]]: item[Object.keys(item)[0]] }), {});
};
