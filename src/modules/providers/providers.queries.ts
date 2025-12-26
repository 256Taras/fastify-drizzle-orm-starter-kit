import type { Cradle } from "@fastify/awilix";
import { isNull } from "drizzle-orm";
import { partial } from "rambda";

import { PROVIDERS_PAGINATION_CONFIG } from "./providers.pagination-config.ts";
import type { Provider, ProvidersListResponse } from "./providers.types.d.ts";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import type { PaginationParams } from "#libs/pagination/pagination.types.d.ts";
import { providers } from "#modules/providers/providers.model.ts";

const findOneById = async ({ providersRepository, logger }: Cradle, providerId: string): Promise<Provider> => {
  logger.debug(`[ProvidersQueries] Getting provider: ${providerId}`);

  const provider = await providersRepository.findOneById(providerId);
  if (!provider) throw new ResourceNotFoundException(`Provider with id: ${providerId} not found`);

  return provider;
};

const findMany = async (
  { paginationService, logger }: Cradle,
  paginationParams: PaginationParams<"offset">,
): Promise<ProvidersListResponse> => {
  logger.debug("[ProvidersQueries] Getting providers list");

  return paginationService.paginate<typeof providers, ProvidersListResponse["data"][number]>(
    PROVIDERS_PAGINATION_CONFIG,
    paginationParams,
    { queryBuilder: (qb) => qb.where(isNull(providers.deletedAt)) },
  );
};

export default function providersQueries(deps: Cradle) {
  return {
    findOneById: partial(findOneById, [deps]),
    findMany: partial(findMany, [deps]),
  };
}
