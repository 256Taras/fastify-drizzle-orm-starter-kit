import type { UUID } from "node:crypto";

import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import { canPayBooking } from "./payments.domain.ts";
import { PAYMENT_EVENTS } from "./payments.events.ts";
import type { Payment } from "./payments.types.d.ts";

import { BadRequestException, ResourceNotFoundException } from "#libs/errors/domain.errors.ts";

const payBooking = async (
  {
    paymentsRepository,
    bookingsRepository,
    usersRepository,
    dateTimeService,
    eventBus,
    logger,
    sessionStorageService,
  }: Cradle,
  bookingId: UUID,
): Promise<Payment> => {
  const { userId } = sessionStorageService.getUser();

  logger.debug(`[PaymentsMutations] Processing payment for booking: ${bookingId}`);

  const booking = await bookingsRepository.findOneById(bookingId);
  if (!booking) {
    throw new ResourceNotFoundException(`Booking with id: ${bookingId} not found`);
  }

  if (booking.userId !== userId) {
    throw new BadRequestException("Can only pay for your own bookings");
  }

  const existingPayment = await paymentsRepository.findOneByBookingId(bookingId);

  if (!canPayBooking(booking, existingPayment)) {
    throw new BadRequestException("Cannot pay for this booking");
  }

  const paidAt = dateTimeService.now();

  let payment: Payment;

  if (existingPayment) {
    const updated = await paymentsRepository.updateOneById(existingPayment.id as UUID, {
      status: "paid",
      paidAt,
    });
    if (!updated) {
      throw new ResourceNotFoundException(`Payment with id: ${existingPayment.id} not found`);
    }
    payment = updated;
  } else {
    payment = await paymentsRepository.createOne({
      bookingId,
      amount: booking.totalPrice,
      status: "paid",
      paidAt,
    });
  }

  const user = await usersRepository.findOneById(userId);
  if (user) {
    await eventBus.emit(PAYMENT_EVENTS.PAID, { payment, user });
  }

  logger.info(`[PaymentsMutations] Payment processed: ${payment.id}`);

  return payment;
};

export default function paymentsMutations(deps: Cradle) {
  return {
    payBooking: partial(payBooking, [deps]),
  };
}
