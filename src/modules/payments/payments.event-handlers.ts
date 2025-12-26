import type { Cradle } from "@fastify/awilix";

import { PAYMENT_EVENTS } from "./payments.events.ts";
import type { PaymentEventPayload } from "./payments.types.d.ts";

import { AUDIT_ACTION, ENTITY_TYPE } from "#modules/audits/index.ts";

export default function paymentsEventHandlers({ auditsService, eventBus, logger }: Cradle): void {
  eventBus.on(PAYMENT_EVENTS.PAID, async (payload: PaymentEventPayload): Promise<void> => {
    logger.info(`[PaymentEventHandler] Payment completed: ${payload.payment.id} for booking: ${payload.payment.bookingId}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.pay, ENTITY_TYPE.payment, payload.payment.id, {
      bookingId: payload.payment.bookingId,
      amount: payload.payment.amount,
    });
  });

  // eslint-disable-next-line @typescript-eslint/require-await
  eventBus.on(PAYMENT_EVENTS.REFUNDED, async (payload: PaymentEventPayload): Promise<void> => {
    logger.info(`[PaymentEventHandler] Payment refunded: ${payload.payment.id}`);
  });

  // eslint-disable-next-line @typescript-eslint/require-await
  eventBus.on(PAYMENT_EVENTS.FAILED, async (payload: PaymentEventPayload): Promise<void> => {
    logger.warn(`[PaymentEventHandler] Payment failed: ${payload.payment.id}`);
  });
}
