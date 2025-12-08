import { Type } from "@sinclair/typebox";

import { LIMIT, OFFSET, ORDER_BY } from "#libs/constants/pagination.constants.js";
import { createEnumTypeUnionSchema } from "#libs/utils/schemas.js";

const OffsetLimitSchema = Type.Object({
  limit: Type.Integer({
    default: LIMIT,
    description: `Batch size, the number of documents to be fetched in a single go. Default is ${LIMIT}.`,
    maximum: 100,
    minimum: 0,
  }),
  offset: Type.Integer({
    default: OFFSET,
    description: "Number of records to be skipped to retrieve the documents. Default is 0, starts from the beginning.",
    maximum: 10_000,
    minimum: 0,
  }),
});

const OrderBySchema = Type.Optional(
  Type.Object({
    by: Type.String({
      description: "The field to order by.",
    }),
    type: createEnumTypeUnionSchema(Object.values(ORDER_BY), {
      default: "ASC",
      description: "The order direction.",
    }),
  }),
);

export const paginationQuery = Type.Object({
  limit: Type.Integer({
    default: LIMIT,
    description: `Batch size, the number of documents to be fetched in a single go. Default is ${LIMIT}.`,
    maximum: 100,
    minimum: 1,
  }),
  page: Type.Integer({
    default: 1,
    description: "Current page. Default is 1.",
    minimum: 1,
  }),
});

export const offsetLimit = OffsetLimitSchema;
export const orderBy = OrderBySchema;

