import { partial } from "rambda";

import { ConflictException, ResourceNotFoundException } from "#libs/errors/domain.errors.js";

import { USER_EVENTS } from "./users.events.js";

/** @type {(deps: Dependencies, input: UserCreateInput) => Promise<User>} */
const createUser = async ({ usersRepository, encrypterService, eventBus, logger }, input) => {
  logger.debug(`[UsersMutations] Creating user: ${input.email}`);

  const existingUser = await usersRepository.findOneByEmail(input.email);
  if (existingUser) {
    throw new ConflictException(`User with email: ${input.email} already exists`);
  }

  const hashedPassword = await encrypterService.getHash(input.password);
  const newUser = await usersRepository.createOne({
    ...input,
    password: hashedPassword,
  });

  await eventBus.emit(USER_EVENTS.CREATED, newUser);

  logger.info(`[UsersMutations] User created: ${newUser.id}`);

  return newUser;
};

/** @type {(deps: Dependencies, userId: string, input: UserUpdateInput) => Promise<User>} */
const updateUser = async ({ usersRepository, eventBus, logger }, userId, input) => {
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

/** @type {(deps: Dependencies, userId: string) => Promise<User>} */
const deleteUser = async ({ usersRepository, eventBus, logger }, userId) => {
  logger.debug(`[UsersMutations] Deleting user: ${userId}`);

  const deletedUser = await usersRepository.softDeleteOneById(userId);
  if (!deletedUser) {
    throw new ResourceNotFoundException(`User with id: ${userId} not found`);
  }

  await eventBus.emit(USER_EVENTS.DELETED, {
    userId: deletedUser.id,
  });

  logger.info(`[UsersMutations] User deleted: ${deletedUser.id}`);
  return deletedUser;
};

/** @param {Dependencies} deps */
export default function usersMutations(deps) {
  return {
    createUser: partial(createUser, [deps]),
    deleteUser: partial(deleteUser, [deps]),
    updateUser: partial(updateUser, [deps]),
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {import("./users.contracts.js").User} User */
/** @typedef {import("./users.contracts.js").UserCreateInput} UserCreateInput */
/** @typedef {import("./users.contracts.js").UserUpdateInput} UserUpdateInput */
