import { Type } from "@sinclair/typebox";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";

import { COMMON_CONTRACTS_V1 } from "#libs/common.contracnts.js";
import { paginationSchema } from "#libs/utils/schemas.js";
import { users } from "#modules/users/users.model.js";

// Create schemas from Drizzle model
export const USER_ENTITY_CONTRACT = createSelectSchema(users);
export const USER_INSERT_CONTRACT = createInsertSchema(users);

// Output contract - omit sensitive fields
export const USER_OUTPUT_CONTRACT = Type.Omit(USER_ENTITY_CONTRACT, ["deletedAt", "password"]);

// Pagination contracts
export const USER_OUTPUT_LIST = paginationSchema(USER_OUTPUT_CONTRACT);
export const USER_INPUT_LIST = COMMON_CONTRACTS_V1.paginationQuery;

/**
 * Type definitions for users module
 * @typedef {import("@sinclair/typebox").Static<typeof USER_ENTITY_CONTRACT>} UserWithPassword
 * @typedef {import("@sinclair/typebox").Static<typeof USER_OUTPUT_CONTRACT>} User
 * @typedef {import("@sinclair/typebox").Static<typeof USER_INPUT_LIST>} GetUsersListInputContract
 * @typedef {import("@sinclair/typebox").Static<typeof USER_OUTPUT_LIST>} GetUsersListOutputContract
 */
