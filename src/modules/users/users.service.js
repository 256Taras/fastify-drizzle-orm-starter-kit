import { partial } from "rambda";
import { count, eq } from "drizzle-orm";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.js";
import { NON_PASSWORD_COLUMNS, users } from "#modules/users/users.model.js";
import { calculatePaginationOffset, createPaginatedResponse } from "#libs/utils/pagination.js";

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
const findAll = async ({ db }, { page, limit }) => {
  const { offset } = calculatePaginationOffset({ page, limit });

  const [[{ itemCount }], entities] = await Promise.all([
    db.select({ itemCount: count() }).from(users),
    db.select().from(users).offset(offset).limit(limit),
  ]);

  return createPaginatedResponse({
    itemCount,
    entities,
    offset,
    limit,
  });
};

/** @param {Dependencies} deps */
export default function usersService(deps) {
  return {
    findOneById: partial(findOneById, [deps]),
    findAll: partial(findAll, [deps]),
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
