import type { Cradle } from "@fastify/awilix";

import { REVIEW_EVENTS } from "./reviews.events.ts";
import type { ReviewEventPayload } from "./reviews.types.d.ts";

import { AUDIT_ACTION, ENTITY_TYPE } from "#modules/audits/index.ts";

export default function reviewsEventHandlers({ auditsService, eventBus, logger }: Cradle): void {
  eventBus.on(REVIEW_EVENTS.CREATED, async (payload: ReviewEventPayload): Promise<void> => {
    logger.info(`[ReviewsEventHandlers] Review created: ${payload.review.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.create, ENTITY_TYPE.review, payload.review.id);
  });
}
