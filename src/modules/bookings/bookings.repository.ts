import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { and, eq, gt, inArray, type InferInsertModel, lt } from "drizzle-orm";
import { partial } from "rambda";

import type { Booking, BookingInsert, BookingStatus } from "./bookings.types.d.ts";

import { createBaseRepository } from "#libs/persistence/base-repository.ts";
import { BOOKING_STATUS } from "#modules/bookings/bookings.constants.ts";
import { BOOKING_PUBLIC_COLUMNS, bookings } from "#modules/bookings/bookings.model.ts";
import type { DateTimeString } from "#types/brands.ts";

type BookingInsertDrizzle = InferInsertModel<typeof bookings>;

const findManyByServiceIdAndTimeRange = async (
  { db }: Cradle,
  serviceId: UUID,
  startAt: DateTimeString,
  endAt: DateTimeString,
  excludeStatuses: BookingStatus[] = [BOOKING_STATUS.cancelled],
): Promise<Array<{ endAt: DateTimeString; startAt: DateTimeString }>> => {
  const result = await db
    .select({ startAt: bookings.startAt, endAt: bookings.endAt })
    .from(bookings)
    .where(
      and(
        eq(bookings.serviceId, serviceId),
        lt(bookings.startAt, endAt),
        gt(bookings.endAt, startAt),
        excludeStatuses.length > 0
          ? inArray(bookings.status, [BOOKING_STATUS.pending, BOOKING_STATUS.confirmed, BOOKING_STATUS.completed])
          : undefined,
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

  return result;
};

const updateOneById = async (
  { db, dateTimeService }: Cradle,
  id: UUID,
  data: Partial<Omit<BookingInsertDrizzle, "createdAt" | "id" | "updatedAt">>,
): Promise<Booking | null> => {
  const [updated] = await db
    .update(bookings)
    .set({ ...data, updatedAt: dateTimeService.now() })
    .where(eq(bookings.id, id))
    .returning(BOOKING_PUBLIC_COLUMNS);

  return updated;
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
