import { Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { COMMON_CONTRACTS_V1 } from "#libs/contracts/v1/index.js";
import { paginationSchema } from "#libs/utils/schemas.js";
import { users } from "#modules/users/users.model.js";

export const USER_ENTITY_CONTRACT = createSelectSchema(users);
export const USER_INSERT_CONTRACT = createInsertSchema(users);

export const USER_OUTPUT_CONTRACT = Type.Omit(USER_ENTITY_CONTRACT, ["deletedAt", "password"]);

export const USER_CREATE_INPUT_CONTRACT = Type.Omit(USER_INSERT_CONTRACT, ["id", "createdAt", "updatedAt", "deletedAt"]);
export const USER_UPDATE_INPUT_CONTRACT = Type.Partial(USER_CREATE_INPUT_CONTRACT);

export const USER_OUTPUT_LIST = paginationSchema(USER_OUTPUT_CONTRACT);
export const USER_INPUT_LIST = COMMON_CONTRACTS_V1.paginationQuery;

/** @typedef {import("@sinclair/typebox").Static<typeof USER_ENTITY_CONTRACT>} UserWithPassword */
/** @typedef {import("@sinclair/typebox").Static<typeof USER_OUTPUT_CONTRACT>} User */
/** @typedef {import("@sinclair/typebox").Static<typeof USER_INSERT_CONTRACT>} UserInsert */
/** @typedef {import("@sinclair/typebox").Static<typeof USER_CREATE_INPUT_CONTRACT>} UserCreateInput */
/** @typedef {import("@sinclair/typebox").Static<typeof USER_UPDATE_INPUT_CONTRACT>} UserUpdateInput */
/** @typedef {import("@sinclair/typebox").Static<typeof USER_INPUT_LIST>} GetUsersListInputContract */
/** @typedef {import("@sinclair/typebox").Static<typeof USER_OUTPUT_LIST>} GetUsersListOutputContract */
