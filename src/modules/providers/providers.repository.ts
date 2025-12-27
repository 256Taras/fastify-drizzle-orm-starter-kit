import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { and, eq, isNull } from "drizzle-orm";
import { partial } from "rambda";

import type { Provider, ProviderInsert } from "./providers.types.d.ts";

import { createBaseRepository } from "#libs/persistence/base-repository.ts";
import { PROVIDER_PUBLIC_COLUMNS, providers } from "#modules/providers/providers.model.ts";

const findOneByUserId = async ({ db }: Cradle, userId: UUID): Promise<Provider | undefined> => {
  const [maybeProvider] = await db
    .select(PROVIDER_PUBLIC_COLUMNS)
    .from(providers)
    .where(and(eq(providers.userId, userId), isNull(providers.deletedAt)));

  return maybeProvider as Provider | undefined;
};

const updateOneById = async (
  { db, dateTimeService }: Cradle,
  id: UUID,
  data: Partial<Omit<ProviderInsert, "createdAt" | "deletedAt" | "id" | "updatedAt">>,
): Promise<Provider | undefined> => {
  const [updated] = await db
    .update(providers)
    .set({ ...data, updatedAt: dateTimeService.now() })
    .where(and(eq(providers.id, id), isNull(providers.deletedAt)))
    .returning(PROVIDER_PUBLIC_COLUMNS);

  return updated as Provider | undefined;
};

const updateRating = async (
  { db, dateTimeService }: Cradle,
  id: UUID,
  rating: string,
  reviewsCount: number,
): Promise<Provider | undefined> => {
  const [updated] = await db
    .update(providers)
    .set({ rating, reviewsCount, updatedAt: dateTimeService.now() })
    .where(and(eq(providers.id, id), isNull(providers.deletedAt)))
    .returning(PROVIDER_PUBLIC_COLUMNS);

  return updated as Provider | undefined;
};

export default function providersRepository(deps: Cradle) {
  const baseRepo = createBaseRepository<typeof providers, Provider, ProviderInsert>({
    table: providers,
    logger: deps.logger,
    db: deps.db,
    defaultSelectColumns: PROVIDER_PUBLIC_COLUMNS,
    softDeleteColumn: "deletedAt",
  });

  return {
    createOne: baseRepo.createOne,
    findOneById: baseRepo.findOneById,
    softDeleteOneById: baseRepo.softDeleteOneById,
    findOneByUserId: partial(findOneByUserId, [deps]),
    updateOneById: partial(updateOneById, [deps]),
    updateRating: partial(updateRating, [deps]),
  };
}
