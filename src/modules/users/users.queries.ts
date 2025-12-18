import type { Cradle } from "@fastify/awilix";
import { isNull } from "drizzle-orm";
import { partial } from "rambda";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import type { PaginationParams } from "#libs/pagination/pagination.types.d.ts";
import { users } from "#modules/users/users.model.ts";

import type { GetUsersListOutputContract, User } from "./users.contracts.ts";
import { USERS_PAGINATION_CONFIG } from "./users.pagination-config.ts";

const findOneById = async ({ usersRepository, logger }: Cradle, userId: string): Promise<User> => {
  logger.debug(`[UsersQueries] Getting user: ${userId}`);

  const user = (await usersRepository.findOneById(userId)) as undefined | User;
  if (!user || typeof user !== "object" || !("id" in user)) {
    throw new ResourceNotFoundException(`User with id: ${userId} not found`);
  }

  return user;
};

const findOneByEmail = async ({ usersRepository, logger }: Cradle, email: string): Promise<User> => {
  logger.debug(`[UsersQueries] Getting user by email: ${email}`);

  const user = await usersRepository.findOneByEmail(email);
  if (!user) {
    throw new ResourceNotFoundException(`User with email: ${email} not found`);
  }

  return user;
};

const findMany = async (
  { paginationService, logger }: Cradle,
  paginationParams: PaginationParams<"offset">,
): Promise<GetUsersListOutputContract> => {
  logger.debug(`[UsersQueries] Getting users list`);

  return (await paginationService.paginate(USERS_PAGINATION_CONFIG, paginationParams, {
    queryBuilder: (qb) => qb.where(isNull(users.deletedAt)),
  })) as unknown as Promise<GetUsersListOutputContract>;
};

export default function usersQueries(deps: Cradle) {
  return {
    findOneByEmail: partial(findOneByEmail, [deps]),
    findOneById: partial(findOneById, [deps]),
    findMany: partial(findMany, [deps]),
  };
}
