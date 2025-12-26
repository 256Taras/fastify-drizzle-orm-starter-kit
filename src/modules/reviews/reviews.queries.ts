import type { Cradle } from "@fastify/awilix";
import { eq } from "drizzle-orm";
import { partial } from "rambda";

import { REVIEWS_PAGINATION_CONFIG } from "./reviews.pagination-config.ts";
import type { ReviewsListResponse } from "./reviews.types.d.ts";

import type { PaginationParams } from "#libs/pagination/pagination.types.d.ts";
import { reviews } from "#modules/reviews/reviews.model.ts";

const findManyByServiceId = async (
  { paginationService, logger }: Cradle,
  serviceId: string,
  paginationParams: PaginationParams<"offset">,
): Promise<ReviewsListResponse> => {
  logger.debug(`[ReviewsQueries] Getting reviews for service: ${serviceId}`);

  return paginationService.paginate<typeof reviews, ReviewsListResponse["data"][number]>(
    REVIEWS_PAGINATION_CONFIG,
    paginationParams,
    { queryBuilder: (qb) => qb.where(eq(reviews.serviceId, serviceId)) },
  );
};

export default function reviewsQueries(deps: Cradle) {
  return {
    findManyByServiceId: partial(findManyByServiceId, [deps]),
  };
}
