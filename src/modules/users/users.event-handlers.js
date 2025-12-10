import { USER_EVENTS } from "./users.events.js";

/** @type {(deps: Dependencies) => void} */
export function setupUsersEventHandlers({ eventBus, logger }) {
  eventBus.on(
    USER_EVENTS.CREATED,
    /** @type {(payload: User) => Promise<void>} */ async (payload) => {
      logger.info(`[UsersEventHandlers] User created: ${payload.id}`);
    },
  );
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {import("./users.contracts.js").User} User */
