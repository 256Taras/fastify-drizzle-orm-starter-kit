import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { paginationSchema } from "#libs/utils/schemas.ts";
import { users } from "#modules/users/users.model.ts";

export const USER_ENTITY_CONTRACT = createSelectSchema(users);
export const USER_INSERT_CONTRACT = createInsertSchema(users);

export const USER_OUTPUT_CONTRACT = Type.Omit(USER_ENTITY_CONTRACT, ["deletedAt", "password"]);

export const USER_CREATE_INPUT_CONTRACT = Type.Omit(USER_INSERT_CONTRACT, ["id", "createdAt", "updatedAt", "deletedAt"]);
export const USER_UPDATE_INPUT_CONTRACT = Type.Partial(USER_CREATE_INPUT_CONTRACT);

export const USER_OUTPUT_LIST = paginationSchema(USER_OUTPUT_CONTRACT);

export type User = Static<typeof USER_OUTPUT_CONTRACT>;
export type UserCreateInput = Static<typeof USER_CREATE_INPUT_CONTRACT>;
export type UserInsert = Static<typeof USER_INSERT_CONTRACT>;
export type UsersListResponse = Static<typeof USER_OUTPUT_LIST>;
export type UserUpdateInput = Static<typeof USER_UPDATE_INPUT_CONTRACT>;

export { type PaginationMeta } from "#libs/utils/schemas.ts";
