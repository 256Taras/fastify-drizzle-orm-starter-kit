import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { and, eq, gt, inArray, type InferInsertModel, lt } from "drizzle-orm";
import { partial } from "rambda";

import type { Booking, BookingInsert, BookingStatus } from "./bookings.types.d.ts";

import { createBaseRepository } from "#libs/persistence/base-repository.ts";
import { BOOKING_PUBLIC_COLUMNS, bookings } from "#modules/bookings/bookings.model.ts";

type BookingInsertDrizzle = InferInsertModel<typeof bookings>;

const findManyByServiceIdAndTimeRange = async (
  { db }: Cradle,
  serviceId: UUID,
  startAt: string,
  endAt: string,
  excludeStatuses: BookingStatus[] = ["cancelled"],
): Promise<Array<{ endAt: string; startAt: string }>> => {
  const result = await db
    .select({ startAt: bookings.startAt, endAt: bookings.endAt })
    .from(bookings)
    .where(
      and(
        eq(bookings.serviceId, serviceId),
        lt(bookings.startAt, endAt),
        gt(bookings.endAt, startAt),
        excludeStatuses.length > 0 ? inArray(bookings.status, ["pending", "confirmed", "completed"]) : undefined,
      ),
    );

  return result;
};

const findManyByUserId = async ({ db }: Cradle, userId: UUID): Promise<Booking[]> => {
  const result = await db
    .select(BOOKING_PUBLIC_COLUMNS)
    .from(bookings)
    .where(eq(bookings.userId, userId))
    .orderBy(bookings.startAt);

  return result as Booking[];
};

const updateOneById = async (
  { db, dateTimeService }: Cradle,
  id: UUID,
  data: Partial<Omit<BookingInsertDrizzle, "createdAt" | "id" | "updatedAt">>,
): Promise<Booking | undefined> => {
  const [updated] = await db
    .update(bookings)
    .set({ ...data, updatedAt: dateTimeService.now() })
    .where(eq(bookings.id, id))
    .returning(BOOKING_PUBLIC_COLUMNS);

  return updated as Booking | undefined;
};

export default function bookingsRepository(deps: Cradle) {
  const baseRepo = createBaseRepository<typeof bookings, Booking, BookingInsert>({
    table: bookings,
    logger: deps.logger,
    db: deps.db,
    defaultSelectColumns: BOOKING_PUBLIC_COLUMNS,
  });

  return {
    createOne: baseRepo.createOne,
    findOneById: baseRepo.findOneById,
    findManyByServiceIdAndTimeRange: partial(findManyByServiceIdAndTimeRange, [deps]),
    findManyByUserId: partial(findManyByUserId, [deps]),
    updateOneById: partial(updateOneById, [deps]),
  };
}
