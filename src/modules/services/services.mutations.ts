import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import { canUserEditService } from "./services.domain.ts";
import { SERVICE_EVENTS } from "./services.events.ts";
import type { Service, ServiceCreateInput, ServiceUpdateInput } from "./services.types.d.ts";

import { ForbiddenException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";

const createService = async (
  { servicesRepository, providersRepository, usersRepository, eventBus, logger, sessionStorageService }: Cradle,
  providerId: string,
  input: ServiceCreateInput,
): Promise<Service> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[ServicesMutations] Creating service for provider: ${providerId}`);

  const provider = await providersRepository.findOneById(providerId);
  if (!provider) {
    throw new ResourceNotFoundException(`Provider with id: ${providerId} not found`);
  }

  if (provider.userId !== userId) {
    throw new ForbiddenException("You can only create services for your own provider profile");
  }

  const newService = await servicesRepository.createOne({
    ...input,
    providerId,
  });

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(SERVICE_EVENTS.CREATED, { service: newService, user });
  }

  logger.info(`[ServicesMutations] Service created: ${newService.id}`);

  return newService;
};

const updateService = async (
  { servicesRepository, providersRepository, usersRepository, eventBus, logger, sessionStorageService }: Cradle,
  serviceId: UUID,
  input: ServiceUpdateInput,
): Promise<Service> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[ServicesMutations] Updating service: ${serviceId}`);

  const service = await servicesRepository.findOneById(serviceId);
  if (!service) {
    throw new ResourceNotFoundException(`Service with id: ${serviceId} not found`);
  }

  const provider = await providersRepository.findOneById(service.providerId as UUID);
  if (!provider) {
    throw new ResourceNotFoundException(`Provider with id: ${service.providerId} not found`);
  }

  if (!canUserEditService(service, provider, userId)) {
    throw new ForbiddenException("You can only update your own services");
  }

  const updatedService = await servicesRepository.updateOneById(serviceId, input);
  if (!updatedService) {
    throw new ResourceNotFoundException(`Service with id: ${serviceId} not found`);
  }

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(SERVICE_EVENTS.UPDATED, { service: updatedService, user });
  }

  logger.info(`[ServicesMutations] Service updated: ${serviceId}`);

  return updatedService;
};

const deleteService = async (
  { servicesRepository, providersRepository, usersRepository, eventBus, logger, sessionStorageService }: Cradle,
  serviceId: string,
): Promise<Service> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[ServicesMutations] Deleting service: ${serviceId}`);

  const service = await servicesRepository.findOneById(serviceId);
  if (!service) {
    throw new ResourceNotFoundException(`Service with id: ${serviceId} not found`);
  }

  const provider = await providersRepository.findOneById(service.providerId);
  if (!provider) {
    throw new ResourceNotFoundException(`Provider with id: ${service.providerId} not found`);
  }

  if (!canUserEditService(service, provider, userId)) {
    throw new ForbiddenException("You can only delete your own services");
  }

  const deletedService = await servicesRepository.softDeleteOneById(serviceId);
  if (!deletedService) {
    throw new ResourceNotFoundException(`Service with id: ${serviceId} not found`);
  }

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(SERVICE_EVENTS.DELETED, { service: deletedService, user });
  }

  logger.info(`[ServicesMutations] Service deleted: ${serviceId}`);

  return deletedService;
};

export default function servicesMutations(deps: Cradle) {
  return {
    createService: partial(createService, [deps]),
    updateService: partial(updateService, [deps]),
    deleteService: partial(deleteService, [deps]),
  };
}
