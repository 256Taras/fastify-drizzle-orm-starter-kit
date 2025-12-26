import type { Cradle } from "@fastify/awilix";

import { PROVIDER_EVENTS } from "./providers.events.ts";
import type { ProviderEventPayload } from "./providers.types.d.ts";

import { AUDIT_ACTION, ENTITY_TYPE } from "#modules/audits/index.ts";

export default function providersEventHandlers({ auditsService, eventBus, logger }: Cradle): void {
  eventBus.on(PROVIDER_EVENTS.CREATED, async (payload: ProviderEventPayload): Promise<void> => {
    logger.info(`[ProvidersEventHandlers] Provider created: ${payload.provider.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.create, ENTITY_TYPE.provider, payload.provider.id);
  });

  eventBus.on(PROVIDER_EVENTS.UPDATED, async (payload: ProviderEventPayload): Promise<void> => {
    logger.info(`[ProvidersEventHandlers] Provider updated: ${payload.provider.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.update, ENTITY_TYPE.provider, payload.provider.id);
  });

  eventBus.on(PROVIDER_EVENTS.DELETED, async (payload: ProviderEventPayload): Promise<void> => {
    logger.info(`[ProvidersEventHandlers] Provider deleted: ${payload.provider.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.delete, ENTITY_TYPE.provider, payload.provider.id);
  });
}
