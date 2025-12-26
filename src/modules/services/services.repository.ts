import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { and, eq, type InferInsertModel, isNull } from "drizzle-orm";
import { partial } from "rambda";

import type { Service, ServiceInsert } from "./services.types.d.ts";

import { createBaseRepository } from "#libs/persistence/base-repository.ts";
import { SERVICE_PUBLIC_COLUMNS, services } from "#modules/services/services.model.ts";

type ServiceInsertDrizzle = InferInsertModel<typeof services>;

const findManyByProviderId = async ({ db }: Cradle, providerId: UUID): Promise<Service[]> => {
  return db
    .select(SERVICE_PUBLIC_COLUMNS)
    .from(services)
    .where(and(eq(services.providerId, providerId), isNull(services.deletedAt))) as Promise<Service[]>;
};

const updateOneById = async (
  { db, dateTimeService }: Cradle,
  id: UUID,
  data: Partial<Omit<ServiceInsertDrizzle, "createdAt" | "deletedAt" | "id" | "updatedAt">>,
): Promise<Service | undefined> => {
  const [updated] = await db
    .update(services)
    .set({ ...data, updatedAt: dateTimeService.now() })
    .where(and(eq(services.id, id), isNull(services.deletedAt)))
    .returning(SERVICE_PUBLIC_COLUMNS);

  return updated as Service | undefined;
};

export default function servicesRepository(deps: Cradle) {
  const baseRepo = createBaseRepository<typeof services, Service, ServiceInsert>({
    table: services,
    logger: deps.logger,
    db: deps.db,
    defaultSelectColumns: SERVICE_PUBLIC_COLUMNS,
    softDeleteColumn: "deletedAt",
  });

  return {
    createOne: baseRepo.createOne,
    findOneById: baseRepo.findOneById,
    softDeleteOneById: baseRepo.softDeleteOneById,
    findManyByProviderId: partial(findManyByProviderId, [deps]),
    updateOneById: partial(updateOneById, [deps]),
  };
}
