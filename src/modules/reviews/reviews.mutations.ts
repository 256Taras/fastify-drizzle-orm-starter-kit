import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import { calculateAverageRating, canLeaveReview } from "./reviews.domain.ts";
import { REVIEW_EVENTS } from "./reviews.events.ts";
import type { Review, ReviewCreateInput } from "./reviews.types.d.ts";

import { ConflictException, ForbiddenException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";

const createReview = async (
  {
    reviewsRepository,
    bookingsRepository,
    servicesRepository,
    providersRepository,
    usersRepository,
    eventBus,
    logger,
    sessionStorageService,
  }: Cradle,
  bookingId: string,
  input: ReviewCreateInput,
): Promise<Review> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[ReviewsMutations] Creating review for booking: ${bookingId}`);

  const booking = await bookingsRepository.findOneById(bookingId);
  if (!booking) {
    throw new ResourceNotFoundException(`Booking with id: ${bookingId} not found`);
  }

  if (!canLeaveReview(booking, userId)) {
    throw new ForbiddenException("Can only review completed bookings that belong to you");
  }

  const existingReview = await reviewsRepository.findOneByBookingId(bookingId);
  if (existingReview) {
    throw new ConflictException("Review already exists for this booking");
  }

  const newReview = await reviewsRepository.createOne({
    bookingId,
    userId,
    serviceId: booking.serviceId,
    rating: input.rating,
    comment: input.comment,
  });

  const stats = await reviewsRepository.getServiceStats(booking.serviceId);
  const newAvgRating = calculateAverageRating([
    ...Array.from<number>({ length: stats.reviewsCount - 1 }).fill(stats.avgRating),
    input.rating,
  ]);

  const service = await servicesRepository.findOneById(booking.serviceId as UUID);
  if (service) {
    await providersRepository.updateRating(service.providerId as UUID, newAvgRating.toFixed(1), stats.reviewsCount);
  }

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(REVIEW_EVENTS.CREATED, { review: newReview, user });
  }

  logger.info(`[ReviewsMutations] Review created: ${newReview.id}`);

  return newReview;
};

export default function reviewsMutations(deps: Cradle) {
  return {
    createReview: partial(createReview, [deps]),
  };
}
