import { isNull } from "drizzle-orm";
import { partial } from "rambda";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.js";
import { users } from "#modules/users/users.model.js";

import { USERS_PAGINATION_CONFIG } from "./users.pagination.config.js";

/**@type {(deps: Dependencies, userId: string) => Promise<User>} */
const findUserById = async ({ usersRepository, logger }, userId) => {
  logger.debug(`[UsersQueries] Getting user: ${userId}`);

  const user = await usersRepository.findById(userId);
  if (!user) {
    throw new ResourceNotFoundException(`User with id: ${userId} not found`);
  }

  return user;
};

/** @type {(deps: Dependencies, email: string) => Promise<User>} */
const findUserByEmail = async ({ usersRepository, logger }, email) => {
  logger.debug(`[UsersQueries] Getting user by email: ${email}`);

  const user = await usersRepository.findByEmail(email);
  if (!user) {
    throw new ResourceNotFoundException(`User with email: ${email} not found`);
  }

  return user;
};

/** @type {(deps: Dependencies, paginationParams: import("#libs/pagination/pagination.types.jsdoc.js").PaginationParams<"offset">) => Promise<GetUsersListOutputContract>} */
const listUsers = async ({ paginationService, logger }, paginationParams) => {
  logger.debug(`[UsersQueries] Getting users list`);

  return paginationService.paginate(USERS_PAGINATION_CONFIG, paginationParams, {
    queryBuilder: (qb) => qb.where(isNull(users.deletedAt)),
  });
};

/** @param {Dependencies} deps */
export default function usersQueries(deps) {
  return {
    findUserByEmail: partial(findUserByEmail, [deps]),
    findUserById: partial(findUserById, [deps]),
    listUsers: partial(listUsers, [deps]),
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {import("./users.contracts.js").User} User */
/** @typedef {import("./users.contracts.js").GetUsersListInputContract} GetUsersListInputContract */
/** @typedef {import("./users.contracts.js").GetUsersListOutputContract} GetUsersListOutputContract */
