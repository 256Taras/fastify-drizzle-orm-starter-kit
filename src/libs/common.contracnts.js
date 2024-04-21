import { Type } from "@sinclair/typebox";

import { LIMIT, OFFSET, ORDER_BY } from "#libs/common.constants.js";
import { createEnumTypeUnionSchema } from "#libs/utils/schemas.js";

const TimestampSchema = {
  createdAt: Type.Object({ createdAt: Type.String({ format: "date-time" }) }),
  updatedAt: Type.Object({ updatedAt: Type.String({ format: "date-time" }) }),
};

const HeaderSchema = {
  authorization: Type.Object({
    Authorization: Type.String(),
  }),
  authorizationApiKey: Type.Object({
    apiKey: Type.String(),
  }),
};

const StatusSchema = Type.Object({ status: Type.Boolean() }, { additionalProperties: false });

const OffsetLimitSchema = Type.Object({
  offset: Type.Integer({
    description: "Number of records to be skipped to retrieve the documents. Default is 0, starts from the beginning.",
    maximum: 10000,
    minimum: 0,
    default: OFFSET,
  }),
  limit: Type.Integer({
    description: `Batch size, the number of documents to be fetched in a single go. Default is ${LIMIT}.`,
    minimum: 0,
    maximum: 100,
    default: LIMIT,
  }),
});

const IdSchema = Type.Object({ id: Type.String({ format: "uuid" }) }, { additionalProperties: false });

// Order By Schema
const OrderBySchema = Type.Optional(
  Type.Object({
    by: Type.String({
      description: "The field to order by.",
    }),
    type: createEnumTypeUnionSchema(Object.values(ORDER_BY), {
      description: "The order direction.",
      default: "ASC",
    }),
  }),
);

export const COMMON_CONTRACTS_V1 = {
  headers: HeaderSchema,
  status: StatusSchema,
  timestamp: Type.Intersect([TimestampSchema.createdAt, TimestampSchema.updatedAt]),
  offsetLimit: OffsetLimitSchema,
  id: IdSchema,
  orderBy: OrderBySchema,
  paginationQuery: Type.Object({
    page: Type.Integer({
      description: "Current page. Default is 1.",
      minimum: 1,
      default: 1,
    }),
    limit: Type.Integer({
      description: `Batch size, the number of documents to be fetched in a single go. Default is ${LIMIT}.`,
      minimum: 1,
      maximum: 100,
      default: LIMIT,
    }),
  }),
};
