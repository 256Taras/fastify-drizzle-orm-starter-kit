import { partial } from "rambda";

import { USER_EVENTS } from "./users.events.js";

import { ConflictException, ResourceNotFoundException } from "#libs/errors/domain.errors.js";

/** @type {(deps: Dependencies, input: UserInsert) => Promise<User | ConflictException>} */
const createUser = async ({ usersRepository, encrypterService, eventBus, logger }, input) => {
  logger.debug(`[UsersMutations] Creating user: ${input.email}`);

  const existingUser = await usersRepository.findByEmail(input.email);
  if (existingUser) {
    return ConflictException.of(`User with email: ${input.email} already exists`);
  }

  const hashedPassword = await encrypterService.getHash(input.password);
  const newUser = await usersRepository.create({
    ...input,
    password: hashedPassword,
  });

  await eventBus.emit(USER_EVENTS.CREATED, {
    userId: newUser.id,
    email: newUser.email,
    firstName: newUser.firstName,
  });

  logger.info(`[UsersMutations] User created: ${newUser.id}`);
  return newUser;
};

/** @type {(deps: Dependencies, userId: string, input: Partial<UserInsert>) => Promise<User | ConflictException | ResourceNotFoundException>} */
const updateUser = async ({ usersRepository, eventBus, logger }, userId, input) => {
  logger.debug(`[UsersMutations] Updating user: ${userId}`);

  if (input.email) {
    const existingUser = await usersRepository.findByEmail(input.email);
    if (existingUser && existingUser.id !== userId) {
      return ConflictException.of(`User with email: ${input.email} already exists`);
    }
  }

  const updatedUser = await usersRepository.update(userId, input);
  if (!updatedUser) {
    return ResourceNotFoundException.of(`User with id: ${userId} not found`);
  }

  await eventBus.emit(USER_EVENTS.UPDATED, {
    userId: updatedUser.id,
  });

  logger.info(`[UsersMutations] User updated: ${updatedUser.id}`);
  return updatedUser;
};

/** @type {(deps: Dependencies, userId: string) => Promise<User | ResourceNotFoundException>} */
const deleteUser = async ({ usersRepository, eventBus, logger }, userId) => {
  logger.debug(`[UsersMutations] Deleting user: ${userId}`);

  const deletedUser = await usersRepository.softDelete(userId);
  if (!deletedUser) {
    return ResourceNotFoundException.of(`User with id: ${userId} not found`);
  }

  await eventBus.emit(USER_EVENTS.DELETED, {
    userId: deletedUser.id,
  });

  logger.info(`[UsersMutations] User deleted: ${deletedUser.id}`);
  return deletedUser;
};

/** @type {(deps: Dependencies) => UsersMutations} */
export default function usersMutations(deps) {
  return {
    createUser: partial(createUser, [deps]),
    deleteUser: partial(deleteUser, [deps]),
    updateUser: partial(updateUser, [deps]),
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {import("./users.contracts.js").User} User */
/** @typedef {import("./users.contracts.js").UserInsert} UserInsert */
/** @typedef {{ createUser: (input: UserInsert) => Promise<User | import("#libs/errors/domain.errors.js").ConflictException>, updateUser: (userId: string, input: Partial<UserInsert>) => Promise<User | import("#libs/errors/domain.errors.js").ConflictException | import("#libs/errors/domain.errors.js").ResourceNotFoundException>, deleteUser: (userId: string) => Promise<User | import("#libs/errors/domain.errors.js").ResourceNotFoundException> }} UsersMutations */
