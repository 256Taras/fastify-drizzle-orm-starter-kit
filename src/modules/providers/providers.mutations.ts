import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import { canUserManageProvider } from "./providers.domain.ts";
import { PROVIDER_EVENTS } from "./providers.events.ts";
import type { Provider, ProviderCreateInput, ProviderUpdateInput } from "./providers.types.d.ts";

import { ConflictException, ForbiddenException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";

const createProvider = async (
  { providersRepository, usersRepository, eventBus, logger, sessionStorageService }: Cradle,
  input: ProviderCreateInput,
): Promise<Provider> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[ProvidersMutations] Creating provider for user: ${userId}`);

  const existingProvider = await providersRepository.findOneByUserId(userId);
  if (existingProvider) {
    throw new ConflictException("User already has a provider profile");
  }

  const newProvider = await providersRepository.createOne({
    ...input,
    userId,
  });

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(PROVIDER_EVENTS.CREATED, { provider: newProvider, user });
  }

  logger.info(`[ProvidersMutations] Provider created: ${newProvider.id}`);

  return newProvider;
};

const updateProvider = async (
  { providersRepository, usersRepository, eventBus, logger, sessionStorageService }: Cradle,
  providerId: UUID,
  input: ProviderUpdateInput,
): Promise<Provider> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[ProvidersMutations] Updating provider: ${providerId}`);

  const existingProvider = await providersRepository.findOneById(providerId);
  if (!existingProvider) {
    throw new ResourceNotFoundException(`Provider with id: ${providerId} not found`);
  }

  if (!canUserManageProvider(existingProvider, userId)) {
    throw new ForbiddenException("You can only update your own provider profile");
  }

  const updatedProvider = await providersRepository.updateOneById(providerId, input);
  if (!updatedProvider) {
    throw new ResourceNotFoundException(`Provider with id: ${providerId} not found`);
  }

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(PROVIDER_EVENTS.UPDATED, { provider: updatedProvider, user });
  }

  logger.info(`[ProvidersMutations] Provider updated: ${providerId}`);

  return updatedProvider;
};

const deleteProvider = async (
  { providersRepository, usersRepository, eventBus, logger, sessionStorageService }: Cradle,
  providerId: string,
): Promise<Provider> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[ProvidersMutations] Deleting provider: ${providerId}`);

  const existingProvider = await providersRepository.findOneById(providerId);
  if (!existingProvider) {
    throw new ResourceNotFoundException(`Provider with id: ${providerId} not found`);
  }

  if (!canUserManageProvider(existingProvider, userId)) {
    throw new ForbiddenException("You can only delete your own provider profile");
  }

  const deletedProvider = await providersRepository.softDeleteOneById(providerId);
  if (!deletedProvider) {
    throw new ResourceNotFoundException(`Provider with id: ${providerId} not found`);
  }

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(PROVIDER_EVENTS.DELETED, { provider: deletedProvider, user });
  }

  logger.info(`[ProvidersMutations] Provider deleted: ${providerId}`);

  return deletedProvider;
};

export default function providersMutations(deps: Cradle) {
  return {
    createProvider: partial(createProvider, [deps]),
    updateProvider: partial(updateProvider, [deps]),
    deleteProvider: partial(deleteProvider, [deps]),
  };
}
