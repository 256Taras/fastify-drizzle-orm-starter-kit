import { Type } from "@sinclair/typebox";
import type { TObject, TSchema, TUnion } from "@sinclair/typebox";

import { ERROR_CODE_FORMAT } from "#libs/constants/error-codes.ts";

export const createEnumTypeUnionSchema = (
  object: (boolean | number | string)[] | Record<string, boolean | number | string>,
  options: Record<string, unknown> = {},
): TUnion => {
  const values = Array.isArray(object) ? object : Object.values(object);
  return Type.Union(
    values.map((item) => Type.Literal(item)),
    options,
  );
};

export const createFileTypeSchema = (mimetypes: string[]): TObject => {
  const baseSchema: Record<string, TSchema> = {
    encoding: Type.Optional(Type.String()),
    filename: Type.Optional(Type.String()),
    limit: Type.Optional(Type.Boolean()),
  };

  baseSchema.mimetype =
    mimetypes && mimetypes.length > 0 ? Type.Optional(Type.String({ enum: mimetypes })) : Type.Optional(Type.String());

  return Type.Object(baseSchema, { isFile: true });
};

export const paginationSchema = (dataType: TSchema): TObject =>
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

interface HttpFastifyError {
  code: string;
  statusCode: number;
  userMessage: string;
}

const mapHttpErrorToSchemaError = (httpFastifyError: HttpFastifyError): Record<string, TObject> => ({
  [`${httpFastifyError.statusCode}`]: Type.Object(
    {
      code: createEnumTypeUnionSchema([String(httpFastifyError.code)], { description: "Error code" }),
      developerMessage: Type.String({ description: "Message for the developer" }),
      statusCode: createEnumTypeUnionSchema([httpFastifyError.statusCode], { description: "HTTP status code" }),
      url: Type.String({ description: "Error URL" }),
      userMessage: createEnumTypeUnionSchema([httpFastifyError.userMessage], { description: "Message for the user" }),
      ...(httpFastifyError.statusCode === 400 ? { errorDetails: ERROR_DETAIL_SCHEMA } : {}),
      traceId: Type.Optional(Type.String({ description: "Trace ID for debugging" })),
    },
    { additionalProperties: false },
  ),
});

const extractHttpStatusCode = (fullCode: string): string => fullCode.slice(0, ERROR_CODE_FORMAT.HTTP_STATUS_LENGTH);

const extractCustomErrorCode = (fullCode: string): string => {
  const startAt = ERROR_CODE_FORMAT.HTTP_STATUS_LENGTH + ERROR_CODE_FORMAT.DELIMITER_LENGTH;
  return fullCode.slice(startAt, startAt + ERROR_CODE_FORMAT.CUSTOM_CODE_LENGTH);
};

const sortSchemaErrorsByCodeAsc = (a: Record<string, TObject>, b: Record<string, TObject>): number => {
  const aCode = Object.keys(a)[0];
  const bCode = Object.keys(b)[0];

  const httpCompare = extractHttpStatusCode(aCode).localeCompare(extractHttpStatusCode(bCode));
  if (httpCompare !== 0) return httpCompare;

  return extractCustomErrorCode(aCode).localeCompare(extractCustomErrorCode(bCode));
};

export const listHttpErrorsAsSchemaErrors = (
  httpErrorCollection: Record<string, HttpFastifyError>,
): Record<string, TObject>[] => {
  const list = Object.values(httpErrorCollection).map(mapHttpErrorToSchemaError);
  return list.sort(sortSchemaErrorsByCodeAsc);
};

export const mapHttpErrorsToSchemaErrorCollection = (
  httpErrorCollection: Record<string, HttpFastifyError>,
): Record<string, TObject> => {
  const list = listHttpErrorsAsSchemaErrors(httpErrorCollection);
  return Object.fromEntries(list.map((item) => [Object.keys(item)[0], item[Object.keys(item)[0]]]));
};
