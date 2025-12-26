import { Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { reviews } from "./reviews.model.ts";

import { paginationSchema } from "#libs/utils/schemas.ts";

export const REVIEW_ENTITY_CONTRACT = createSelectSchema(reviews);
export const REVIEW_INSERT_CONTRACT = createInsertSchema(reviews);

export const REVIEW_OUTPUT_CONTRACT = REVIEW_ENTITY_CONTRACT;

export const REVIEW_CREATE_INPUT_CONTRACT = Type.Object({
  rating: Type.Integer({ minimum: 1, maximum: 5 }),
  comment: Type.Optional(Type.String({ maxLength: 1000 })),
});

export const REVIEW_OUTPUT_LIST = paginationSchema(REVIEW_OUTPUT_CONTRACT);
