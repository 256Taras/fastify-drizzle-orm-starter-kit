import type { Cradle } from "@fastify/awilix";

import { SERVICE_EVENTS } from "./services.events.ts";
import type { ServiceEventPayload } from "./services.types.d.ts";

import { AUDIT_ACTION, ENTITY_TYPE } from "#modules/audits/index.ts";

export default function servicesEventHandlers({ auditsService, eventBus, logger }: Cradle): void {
  eventBus.on(SERVICE_EVENTS.CREATED, async (payload: ServiceEventPayload): Promise<void> => {
    logger.info(`[ServicesEventHandlers] Service created: ${payload.service.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.create, ENTITY_TYPE.service, payload.service.id);
  });

  eventBus.on(SERVICE_EVENTS.UPDATED, async (payload: ServiceEventPayload): Promise<void> => {
    logger.info(`[ServicesEventHandlers] Service updated: ${payload.service.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.update, ENTITY_TYPE.service, payload.service.id);
  });

  eventBus.on(SERVICE_EVENTS.DELETED, async (payload: ServiceEventPayload): Promise<void> => {
    logger.info(`[ServicesEventHandlers] Service deleted: ${payload.service.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.delete, ENTITY_TYPE.service, payload.service.id);
  });
}
