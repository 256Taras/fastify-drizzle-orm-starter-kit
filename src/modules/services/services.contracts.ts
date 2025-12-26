import { Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { services } from "./services.model.ts";

import { paginationSchema } from "#libs/utils/schemas.ts";

export { SERVICE_STATUS } from "./services.constants.ts";

export const SERVICE_ENTITY_CONTRACT = createSelectSchema(services);
export const SERVICE_INSERT_CONTRACT = createInsertSchema(services);

export const SERVICE_OUTPUT_CONTRACT = Type.Omit(SERVICE_ENTITY_CONTRACT, ["deletedAt"]);

export const SERVICE_CREATE_INPUT_CONTRACT = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  imageUrl: Type.Optional(Type.String({ format: "uri", maxLength: 500 })),
  price: Type.Integer({ minimum: 0 }),
  duration: Type.Integer({ minimum: 1 }),
  status: Type.Optional(Type.Union([Type.Literal("active"), Type.Literal("inactive"), Type.Literal("draft")])),
});

export const SERVICE_UPDATE_INPUT_CONTRACT = Type.Partial(SERVICE_CREATE_INPUT_CONTRACT);

export const SERVICE_OUTPUT_LIST = paginationSchema(SERVICE_OUTPUT_CONTRACT);
