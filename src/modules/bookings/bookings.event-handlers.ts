import type { Cradle } from "@fastify/awilix";

import { BOOKING_EVENTS } from "./bookings.events.ts";
import type { BookingEventPayload } from "./bookings.types.d.ts";

import { AUDIT_ACTION, ENTITY_TYPE } from "#modules/audits/index.ts";

export default function bookingsEventHandlers({ auditsService, eventBus, logger }: Cradle): void {
  eventBus.on(BOOKING_EVENTS.CREATED, async (payload: BookingEventPayload): Promise<void> => {
    logger.info(`[BookingsEventHandlers] Booking created: ${payload.booking.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.create, ENTITY_TYPE.booking, payload.booking.id);
  });

  eventBus.on(BOOKING_EVENTS.CONFIRMED, async (payload: BookingEventPayload): Promise<void> => {
    logger.info(`[BookingsEventHandlers] Booking confirmed: ${payload.booking.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.confirm, ENTITY_TYPE.booking, payload.booking.id);
  });

  eventBus.on(BOOKING_EVENTS.COMPLETED, async (payload: BookingEventPayload): Promise<void> => {
    logger.info(`[BookingsEventHandlers] Booking completed: ${payload.booking.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.complete, ENTITY_TYPE.booking, payload.booking.id);
  });

  eventBus.on(BOOKING_EVENTS.CANCELLED, async (payload: BookingEventPayload): Promise<void> => {
    logger.info(`[BookingsEventHandlers] Booking cancelled: ${payload.booking.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.cancel, ENTITY_TYPE.booking, payload.booking.id);
  });
}
