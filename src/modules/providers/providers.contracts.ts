import { Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { providers } from "./providers.model.ts";

import { paginationSchema } from "#libs/utils/schemas.ts";

export const PROVIDER_ENTITY_CONTRACT = createSelectSchema(providers);
export const PROVIDER_INSERT_CONTRACT = createInsertSchema(providers);

export const PROVIDER_OUTPUT_CONTRACT = Type.Omit(PROVIDER_ENTITY_CONTRACT, ["deletedAt"]);

export const PROVIDER_CREATE_INPUT_CONTRACT = Type.Object({
  name: Type.String({ minLength: 2, maxLength: 255 }),
  description: Type.Optional(Type.String()),
  logoUrl: Type.Optional(Type.String({ format: "uri", maxLength: 500 })),
});

export const PROVIDER_UPDATE_INPUT_CONTRACT = Type.Partial(PROVIDER_CREATE_INPUT_CONTRACT);

export const PROVIDER_OUTPUT_LIST = paginationSchema(PROVIDER_OUTPUT_CONTRACT);
