import { Type } from "@sinclair/typebox";
import { createSelectSchema } from "drizzle-typebox";

import { COMMON_CONTRACTS_V1 } from "#libs/common.contracnts.js";
import { paginationSchema } from "#libs/utils/schemas.js";
import { users } from "#modules/users/users.model.js";

export const USER_ENTITY_CONTRACT = createSelectSchema(users);

export const USER_OUTPUT_CONTRACT = Type.Omit(USER_ENTITY_CONTRACT, ["deletedAt", "password"]);

export const USER_OUTPUT_LIST = paginationSchema(USER_OUTPUT_CONTRACT);
export const USER_INPUT_LIST = COMMON_CONTRACTS_V1.paginationQuery;

/**
 * @typedef {typeof users.$inferSelect} UserWithPassword
 * @typedef {Omit<typeof users.$inferSelect, 'password'>} User
 * @typedef {import("@sinclair/typebox").Static<USER_INPUT_LIST>} GetUsersListInputContract
 * @typedef {import("@sinclair/typebox").Static<USER_OUTPUT_LIST>} GetUsersListOutputContract
 */
