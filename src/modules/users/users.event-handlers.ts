import type { Cradle } from "@fastify/awilix";

import type { User } from "./users.contracts.ts";
import { USER_EVENTS } from "./users.events.ts";

export function setupUsersEventHandlers({ eventBus, logger }: Cradle): void {
  // eslint-disable-next-line @typescript-eslint/require-await
  eventBus.on(USER_EVENTS.CREATED, async (payload: User): Promise<void> => {
    logger.info(`[UsersEventHandlers] User created: ${payload.id}`);
  });
}
