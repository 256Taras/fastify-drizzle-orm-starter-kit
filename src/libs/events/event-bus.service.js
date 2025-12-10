import { EventEmitter } from "node:events";

/** @type {(deps: Dependencies) => EventBus} */
export default function eventBusService({ logger }) {
  // eslint-disable-next-line unicorn/prefer-event-target
  const emitter = new EventEmitter({ captureRejections: true });

  emitter.setMaxListeners(100);

  emitter.on("error", (error, eventName, payload) => {
    logger.error(`[EventBus] Handler failed: ${eventName}`, {
      error: error.message,
      payload,
    });
  });

  /** @type {<T = object>(eventName: string, handler: EventHandler<T>) => void} */
  const on = (eventName, handler) => {
    emitter.on(eventName, async (payload) => {
      try {
        await handler(payload);
      } catch (error) {
        emitter.emit("error", error, eventName, payload);
      }
    });
    logger.debug(`[EventBus] Handler registered: ${eventName}`);
  };

  /** @type {(eventName: string, payload: object) => Promise<void>} */
  const emit = async (eventName, payload) => {
    const listenersCount = emitter.listenerCount(eventName);
    logger.info(`[EventBus] Emitting: ${eventName}`, {
      handlersCount: listenersCount,
      payload,
    });

    emitter.emit(eventName, payload);
  };

  /** @type {(eventName: string) => void} */
  const off = (eventName) => {
    emitter.removeAllListeners(eventName);
    logger.debug(`[EventBus] Handlers removed: ${eventName}`);
  };

  /** @type {() => string[]} */
  const getEventNames = () => emitter.eventNames().map(String);

  /** @type {(eventName: string) => number} */
  const getHandlerCount = (eventName) => emitter.listenerCount(eventName);

  return {
    emit,
    getEventNames,
    getHandlerCount,
    off,
    on,
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @template T @typedef {(payload: T) => Promise<void>} EventHandler */
/** @typedef {{ on: <T = object>(eventName: string, handler: EventHandler<T>) => void, emit: (eventName: string, payload: object) => Promise<void>, off: (eventName: string) => void, getEventNames: () => string[], getHandlerCount: (eventName: string) => number }} EventBus */
