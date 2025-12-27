import type { Cradle } from "@fastify/awilix";
import { eq } from "drizzle-orm";
import { partial } from "rambda";

import { BOOKINGS_PAGINATION_CONFIG } from "./bookings.pagination-config.ts";
import type { Booking, BookingsListResponse } from "./bookings.types.d.ts";

import { ResourceNotFoundException } from "#libs/errors/domain.errors.ts";
import type { PaginationParams } from "#libs/pagination/pagination.types.d.ts";
import { bookings } from "#modules/bookings/bookings.model.ts";

const findOneById = async ({ bookingsRepository, logger }: Cradle, bookingId: string): Promise<Booking> => {
  logger.debug(`[BookingsQueries] Getting booking: ${bookingId}`);

  const booking = await bookingsRepository.findOneById(bookingId);
  if (!booking) throw new ResourceNotFoundException(`Booking with id: ${bookingId} not found`);

  return booking;
};

const findManyByUserId = async (
  { paginationService, logger, sessionStorageService }: Cradle,
  paginationParams: PaginationParams,
): Promise<BookingsListResponse> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[BookingsQueries] Getting bookings for user: ${userId}`);

  return paginationService.paginate(BOOKINGS_PAGINATION_CONFIG, paginationParams, {
    queryBuilder: (qb) => qb.where(eq(bookings.userId, userId)),
  });
};

export default function bookingsQueries(deps: Cradle) {
  return {
    findOneById: partial(findOneById, [deps]),
    findManyByUserId: partial(findManyByUserId, [deps]),
  };
}
