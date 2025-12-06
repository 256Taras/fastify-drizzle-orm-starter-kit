import { eq } from "drizzle-orm";
import { partial } from "rambda";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.js";
import { NON_PASSWORD_COLUMNS, users } from "#modules/users/users.model.js";

import { USERS_PAGINATION_CONFIG } from "./users.pagination.config.js";

/**
 * @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies
 */

/** @type {FindOneById} */
const findOneById = async ({ db, logger }, id) => {
  logger.debug(`Get user with id: ${id}`);
  const [maybeUser] = await db.select(NON_PASSWORD_COLUMNS).from(users).where(eq(users.id, id));

  if (!maybeUser) {
    return ResourceNotFoundException.of(`User with id: ${id} not found`);
  }

  return maybeUser;
};

/** @type {FindAll} */
const findAll = async ({ logger, paginationService }, paginationParams) => {
  logger.debug("Get paginated users list", { paginationParams });

  return paginationService.paginate(USERS_PAGINATION_CONFIG, paginationParams);
};

/**
 * @param {Dependencies} deps
 */
export default function usersService(deps) {
  return {
    findAll: partial(findAll, [deps]),
    findOneById: partial(findOneById, [deps]),
  };
}

/**
 * @typedef {import("./users.contracts.js").User} User
 * @typedef {import("./users.contracts.js").GetUsersListInputContract} GetUsersListInputContract
 * @typedef {import("./users.contracts.js").GetUsersListOutputContract} GetUsersListOutputContract
 * @typedef {import("#libs/utils/pagination/pagination.types.jsdoc.js").PaginationParams} PaginationParams
 * @typedef {import("#libs/utils/pagination/pagination.types.jsdoc.js").OffsetPaginatedResponse<any>} PaginatedResponse
 *
 * @typedef {function(Dependencies, string):Promise<User>} FindOneById
 * @typedef {function(Dependencies, PaginationParams):Promise<PaginatedResponse>} FindAll
 */
