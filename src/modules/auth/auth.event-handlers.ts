import type { Cradle } from "@fastify/awilix";

import { AUTH_EVENTS } from "./auth.events.ts";
import type {
  AuthPasswordChangedPayload,
  AuthSignedInPayload,
  AuthSignedOutPayload,
  AuthSignedUpPayload,
} from "./auth.types.d.ts";

import { AUDIT_ACTION, ENTITY_TYPE } from "#modules/audits/index.ts";

export default function authEventHandlers({ auditsService, eventBus, logger }: Cradle): void {
  eventBus.on(AUTH_EVENTS.SIGNED_UP, async (payload: AuthSignedUpPayload): Promise<void> => {
    logger.info(`[AuthEventHandlers] User signed up: ${payload.user.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.create, ENTITY_TYPE.user, payload.user.id);
  });

  eventBus.on(AUTH_EVENTS.SIGNED_IN, async (payload: AuthSignedInPayload): Promise<void> => {
    logger.info(`[AuthEventHandlers] User signed in: ${payload.user.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.login, ENTITY_TYPE.session, payload.user.id);
  });

  eventBus.on(AUTH_EVENTS.SIGNED_OUT, async (payload: AuthSignedOutPayload): Promise<void> => {
    logger.info(`[AuthEventHandlers] User signed out: ${payload.userId}`);

    await auditsService.logUserAction(payload.userId, AUDIT_ACTION.logout, ENTITY_TYPE.session, payload.userId);
  });

  eventBus.on(AUTH_EVENTS.PASSWORD_CHANGED, async (payload: AuthPasswordChangedPayload): Promise<void> => {
    logger.info(`[AuthEventHandlers] Password changed for user: ${payload.user.id}`);

    await auditsService.logUserAction(payload.user.id, AUDIT_ACTION.password_change, ENTITY_TYPE.user, payload.user.id);
  });
}
