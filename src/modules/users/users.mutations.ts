import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import { ConflictException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";

import type { User, UserCreateInput, UserUpdateInput } from "./users.contracts.ts";
import { USER_EVENTS } from "./users.events.ts";

const createUser = async (
  { usersRepository, encrypterService, eventBus, logger }: Cradle,
  input: UserCreateInput,
): Promise<User> => {
  logger.debug(`[UsersMutations] Creating user: ${input.email}`);

  const existingUser = await usersRepository.findOneByEmail(input.email);
  if (existingUser) {
    throw new ConflictException(`User with email: ${input.email} already exists`);
  }

  const hashedPassword = await encrypterService.getHash(input.password);
  const newUser = (await usersRepository.createOne({
    ...input,
    password: hashedPassword,
  })) as User;

  await eventBus.emit(USER_EVENTS.CREATED, newUser);

  logger.info(`[UsersMutations] User created: ${newUser.id}`);

  return newUser;
};

const updateUser = async (
  { usersRepository, eventBus, logger }: Cradle,
  userId: string,
  input: UserUpdateInput,
): Promise<User> => {
  logger.debug(`[UsersMutations] Updating user: ${userId}`);

  if (input.email) {
    const existingUser = await usersRepository.findOneByEmail(input.email);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException(`User with email: ${input.email} already exists`);
    }
  }

  const updatedUser = await usersRepository.updateOneById(userId, input);
  if (!updatedUser) {
    throw new ResourceNotFoundException(`User with id: ${userId} not found`);
  }

  await eventBus.emit(USER_EVENTS.UPDATED, {
    userId: updatedUser.id,
  });

  logger.info(`[UsersMutations] User updated: ${updatedUser.id}`);
  return updatedUser;
};

const deleteUser = async ({ usersRepository, eventBus, logger }: Cradle, userId: string): Promise<User> => {
  logger.debug(`[UsersMutations] Deleting user: ${userId}`);

  const deletedUser = (await usersRepository.softDeleteOneById(userId)) as undefined | User;
  if (!deletedUser) {
    throw new ResourceNotFoundException(`User with id: ${userId} not found`);
  }

  await eventBus.emit(USER_EVENTS.DELETED, {
    userId: deletedUser.id,
  });

  logger.info(`[UsersMutations] User deleted: ${deletedUser.id}`);
  return deletedUser;
};

export default function usersMutations(deps: Cradle) {
  return {
    createUser: partial(createUser, [deps]),
    deleteUser: partial(deleteUser, [deps]),
    updateUser: partial(updateUser, [deps]),
  };
}
