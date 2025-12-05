import { count, eq } from "drizzle-orm";
import { partial } from "rambda";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.js";
import { calculatePaginationOffset, createPaginatedResponse } from "#libs/utils/pagination.js";
import { NON_PASSWORD_COLUMNS, users } from "#modules/users/users.model.js";

/**
 * @typedef {import("#@types/di-container.jsdoc.js").Dependencies} Dependencies
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
const findAll = async ({ db }, { limit, page }) => {
  const { offset } = calculatePaginationOffset({ limit, page });

  const [[{ itemCount }], entities] = await Promise.all([
    db.select({ itemCount: count() }).from(users),
    db.select().from(users).offset(offset).limit(limit),
  ]);

  return createPaginatedResponse({
    entities,
    itemCount,
    limit,
    offset,
  });
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
 * @typedef {import("./users.contracts").User} User
 * @typedef {import("./users.contracts").GetUsersListInputContract} GetUsersListInputContract
 * @typedef {import("./users.contracts").GetUsersListOutputContract} GetUsersListOutputContract
 *
 * @typedef {function(Dependencies, string):Promise<User>} FindOneById
 * @typedef {function(Dependencies, GetUsersListInputContract):Promise<GetUsersListOutputContract>} FindAll
 */
