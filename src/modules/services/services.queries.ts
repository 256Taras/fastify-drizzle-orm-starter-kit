import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { and, eq, isNull } from "drizzle-orm";
import { partial } from "rambda";

import { SERVICES_PAGINATION_CONFIG } from "./services.pagination-config.ts";
import type { Service, ServicesListResponse } from "./services.types.d.ts";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import type { PaginationParams } from "#libs/pagination/pagination.types.d.ts";
import { services } from "#modules/services/services.model.ts";

const findOneById = async ({ servicesRepository, logger }: Cradle, serviceId: string): Promise<Service> => {
  logger.debug(`[ServicesQueries] Getting service: ${serviceId}`);

  const service = await servicesRepository.findOneById(serviceId);
  if (!service) throw new ResourceNotFoundException(`Service with id: ${serviceId} not found`);

  return service;
};

const findMany = async (
  { paginationService, logger }: Cradle,
  paginationParams: PaginationParams<"offset">,
): Promise<ServicesListResponse> => {
  logger.debug("[ServicesQueries] Getting services list");

  return paginationService.paginate<typeof services, ServicesListResponse["data"][number]>(
    SERVICES_PAGINATION_CONFIG,
    paginationParams,
    { queryBuilder: (qb) => qb.where(and(isNull(services.deletedAt), eq(services.status, "active"))!) },
  );
};

const findManyByProviderId = async ({ servicesRepository, logger }: Cradle, providerId: UUID): Promise<Service[]> => {
  logger.debug(`[ServicesQueries] Getting services for provider: ${providerId}`);

  return servicesRepository.findManyByProviderId(providerId);
};

export default function servicesQueries(deps: Cradle) {
  return {
    findOneById: partial(findOneById, [deps]),
    findMany: partial(findMany, [deps]),
    findManyByProviderId: partial(findManyByProviderId, [deps]),
  };
}
