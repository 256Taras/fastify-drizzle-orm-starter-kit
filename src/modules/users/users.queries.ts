import type { Cradle } from "@fastify/awilix";
import { isNull } from "drizzle-orm";
import { partial } from "rambda";

import type { User, UsersListResponse } from "./users.contracts.ts";
import { USERS_PAGINATION_CONFIG } from "./users.pagination-config.ts";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import type { PaginationParams } from "#libs/pagination/pagination.types.d.ts";
import { users } from "#modules/users/users.model.ts";

const findOneById = async ({ usersRepository, logger }: Cradle, userId: string): Promise<User> => {
  logger.debug(`[UsersQueries] Getting user: ${userId}`);

  const user = await usersRepository.findOneById(userId);
  if (!user) throw new ResourceNotFoundException(`User with id: ${userId} not found`);

  return user;
};

const getProfile = async ({ usersRepository, logger, sessionStorageService }: Cradle): Promise<User> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[UsersQueries] Getting profile for user: ${userId}`);

  const user = await usersRepository.findOneById(userId);
  if (!user) throw new ResourceNotFoundException(`User with id: ${userId} not found`);

  return user;
};

const findOneByEmail = async ({ usersRepository, logger }: Cradle, email: string): Promise<User> => {
  logger.debug(`[UsersQueries] Getting user by email: ${email}`);

  const user = await usersRepository.findOneByEmail(email);
  if (!user) throw new ResourceNotFoundException(`User with email: ${email} not found`);

  return user;
};

const findMany = async (
  { paginationService, logger }: Cradle,
  paginationParams: PaginationParams<"offset">,
): Promise<UsersListResponse> => {
  logger.debug(`[UsersQueries] Getting users list`);

  return paginationService.paginate(USERS_PAGINATION_CONFIG, paginationParams, {
    queryBuilder: (qb) => qb.where(isNull(users.deletedAt)),
  });
};

export default function usersQueries(deps: Cradle) {
  return {
    findOneByEmail: partial(findOneByEmail, [deps]),
    findOneById: partial(findOneById, [deps]),
    findMany: partial(findMany, [deps]),
    getProfile: () => getProfile(deps),
  };
}
