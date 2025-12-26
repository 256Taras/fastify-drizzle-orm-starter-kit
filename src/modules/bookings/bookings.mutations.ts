import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import {
  calculateCancellationFee,
  calculateEndTime,
  canCancelBooking,
  canCompleteBooking,
  canConfirmBooking,
  canCreateBooking,
  hasTimeConflict,
  isBookingInPast,
} from "./bookings.domain.ts";
import { BOOKING_EVENTS } from "./bookings.events.ts";
import type { Booking, BookingCancelInput, BookingCreateInput } from "./bookings.types.d.ts";

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  ResourceNotFoundException,
} from "#libs/errors/domain.errors.ts";

const createBooking = async (
  {
    bookingsRepository,
    servicesRepository,
    providersRepository,
    usersRepository,
    dateTimeService,
    eventBus,
    logger,
    sessionStorageService,
  }: Cradle,
  input: BookingCreateInput,
): Promise<Booking> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[BookingsMutations] Creating booking for service: ${input.serviceId}`);

  const service = await servicesRepository.findOneById(input.serviceId);
  if (!service) {
    throw new ResourceNotFoundException(`Service with id: ${input.serviceId} not found`);
  }

  const provider = await providersRepository.findOneById(service.providerId);
  if (!provider) {
    throw new ResourceNotFoundException(`Provider with id: ${service.providerId} not found`);
  }

  if (!canCreateBooking(service, userId, provider.userId)) {
    throw new ForbiddenException("Cannot book your own service or service is not active");
  }

  const startAt = dateTimeService.toDate(input.startAt);
  if (isBookingInPast(startAt, dateTimeService.nowDate())) {
    throw new BadRequestException("Cannot create booking in the past");
  }

  const endAt = calculateEndTime(startAt, service.duration);
  const startAtIso = dateTimeService.toISOString(startAt);
  const endAtIso = dateTimeService.toISOString(endAt);

  const existingBookings = await bookingsRepository.findManyByServiceIdAndTimeRange(
    input.serviceId as UUID,
    startAtIso,
    endAtIso,
  );

  if (hasTimeConflict(existingBookings, startAt, endAt)) {
    throw new ConflictException("Time slot is already booked");
  }

  const newBooking = await bookingsRepository.createOne({
    serviceId: input.serviceId,
    userId,
    startAt: startAtIso,
    endAt: endAtIso,
    totalPrice: service.price,
    status: "pending",
  });

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(BOOKING_EVENTS.CREATED, { booking: newBooking, user });
  }

  logger.info(`[BookingsMutations] Booking created: ${newBooking.id}`);

  return newBooking;
};

const cancelBooking = async (
  { bookingsRepository, usersRepository, dateTimeService, eventBus, logger, sessionStorageService }: Cradle,
  bookingId: UUID,
  input: BookingCancelInput,
): Promise<Booking> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[BookingsMutations] Cancelling booking: ${bookingId}`);

  const booking = await bookingsRepository.findOneById(bookingId);
  if (!booking) {
    throw new ResourceNotFoundException(`Booking with id: ${bookingId} not found`);
  }

  if (!canCancelBooking(booking, userId)) {
    throw new ForbiddenException("Cannot cancel this booking");
  }

  const cancelledAt = dateTimeService.nowDate();
  const cancellationFee = calculateCancellationFee(booking, cancelledAt);

  const updatedBooking = await bookingsRepository.updateOneById(bookingId, {
    status: "cancelled",
    cancellationReason: input.reason,
    cancelledAt: dateTimeService.toISOString(cancelledAt),
  });
  if (!updatedBooking) {
    throw new ResourceNotFoundException(`Booking with id: ${bookingId} not found`);
  }

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(BOOKING_EVENTS.CANCELLED, { booking: updatedBooking, user });
  }

  logger.info(`[BookingsMutations] Booking cancelled: ${bookingId}, fee: ${cancellationFee}`);

  return updatedBooking;
};

const confirmBooking = async (
  {
    bookingsRepository,
    servicesRepository,
    providersRepository,
    usersRepository,
    eventBus,
    logger,
    sessionStorageService,
  }: Cradle,
  bookingId: UUID,
): Promise<Booking> => {
  const { userId: providerUserId } = sessionStorageService.getUser();

  logger.debug(`[BookingsMutations] Confirming booking: ${bookingId}`);

  const booking = await bookingsRepository.findOneById(bookingId);
  if (!booking) {
    throw new ResourceNotFoundException(`Booking with id: ${bookingId} not found`);
  }

  const service = await servicesRepository.findOneById(booking.serviceId as UUID);
  if (!service) {
    throw new ResourceNotFoundException(`Service with id: ${booking.serviceId} not found`);
  }

  const provider = await providersRepository.findOneById(service.providerId as UUID);
  if (!provider) {
    throw new ResourceNotFoundException(`Provider not found`);
  }

  if (!canConfirmBooking(booking, providerUserId, provider.userId)) {
    throw new ForbiddenException("Cannot confirm this booking");
  }

  const updatedBooking = await bookingsRepository.updateOneById(bookingId, {
    status: "confirmed",
  });
  if (!updatedBooking) {
    throw new ResourceNotFoundException(`Booking with id: ${bookingId} not found`);
  }

  const user = await usersRepository.findOneById(providerUserId);
  if (user) {
    await eventBus.emit(BOOKING_EVENTS.CONFIRMED, { booking: updatedBooking, user });
  }

  logger.info(`[BookingsMutations] Booking confirmed: ${bookingId}`);

  return updatedBooking;
};

const completeBooking = async (
  {
    bookingsRepository,
    servicesRepository,
    providersRepository,
    usersRepository,
    dateTimeService,
    eventBus,
    logger,
    sessionStorageService,
  }: Cradle,
  bookingId: UUID,
): Promise<Booking> => {
  const { userId: providerUserId } = sessionStorageService.getUser();

  logger.debug(`[BookingsMutations] Completing booking: ${bookingId}`);

  const booking = await bookingsRepository.findOneById(bookingId);
  if (!booking) {
    throw new ResourceNotFoundException(`Booking with id: ${bookingId} not found`);
  }

  const service = await servicesRepository.findOneById(booking.serviceId as UUID);
  if (!service) {
    throw new ResourceNotFoundException(`Service with id: ${booking.serviceId} not found`);
  }

  const provider = await providersRepository.findOneById(service.providerId as UUID);
  if (!provider) {
    throw new ResourceNotFoundException(`Provider not found`);
  }

  if (!canCompleteBooking(booking, providerUserId, provider.userId, dateTimeService.nowDate())) {
    throw new ForbiddenException("Cannot complete this booking yet");
  }

  const updatedBooking = await bookingsRepository.updateOneById(bookingId, {
    status: "completed",
  });
  if (!updatedBooking) {
    throw new ResourceNotFoundException(`Booking with id: ${bookingId} not found`);
  }

  const user = await usersRepository.findOneById(providerUserId);
  if (user) {
    await eventBus.emit(BOOKING_EVENTS.COMPLETED, { booking: updatedBooking, user });
  }

  logger.info(`[BookingsMutations] Booking completed: ${bookingId}`);

  return updatedBooking;
};

export default function bookingsMutations(deps: Cradle) {
  return {
    createBooking: partial(createBooking, [deps]),
    cancelBooking: partial(cancelBooking, [deps]),
    confirmBooking: partial(confirmBooking, [deps]),
    completeBooking: partial(completeBooking, [deps]),
  };
}
