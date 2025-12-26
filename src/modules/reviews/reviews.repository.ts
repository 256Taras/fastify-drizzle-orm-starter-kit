import type { Cradle } from "@fastify/awilix";
import { avg, count, eq } from "drizzle-orm";
import { partial } from "rambda";

import type { Review, ReviewInsert } from "./reviews.types.d.ts";

import { createBaseRepository } from "#libs/persistence/base-repository.ts";
import { REVIEW_PUBLIC_COLUMNS, reviews } from "#modules/reviews/reviews.model.ts";

const findOneByBookingId = async ({ db }: Cradle, bookingId: string): Promise<Review | undefined> => {
  const [review] = await db.select(REVIEW_PUBLIC_COLUMNS).from(reviews).where(eq(reviews.bookingId, bookingId));

  return review as Review | undefined;
};

const getServiceStats = async ({ db }: Cradle, serviceId: string): Promise<{ avgRating: number; reviewsCount: number }> => {
  const [stats] = await db
    .select({
      avgRating: avg(reviews.rating),
      reviewsCount: count(),
    })
    .from(reviews)
    .where(eq(reviews.serviceId, serviceId));

  return {
    avgRating: stats?.avgRating ? Number(stats.avgRating) : 0,
    reviewsCount: stats?.reviewsCount ?? 0,
  };
};

export default function reviewsRepository(deps: Cradle) {
  const baseRepo = createBaseRepository<typeof reviews, Review, ReviewInsert>({
    table: reviews,
    logger: deps.logger,
    db: deps.db,
    defaultSelectColumns: REVIEW_PUBLIC_COLUMNS,
  });

  return {
    createOne: baseRepo.createOne,
    findOneById: baseRepo.findOneById,
    findOneByBookingId: partial(findOneByBookingId, [deps]),
    getServiceStats: partial(getServiceStats, [deps]),
  };
}
