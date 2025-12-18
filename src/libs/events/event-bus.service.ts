import { EventEmitter } from "node:events";

import type { Cradle } from "@fastify/awilix";

export type EventBus = {
  emit: (eventName: string, payload: object) => Promise<void>;
  getEventNames: () => string[];
  getHandlerCount: (eventName: string) => number;
  off: (eventName: string) => void;
  on: <T = object>(eventName: string, handler: EventHandler<T>) => void;
};

type EventHandler<T = object> = (payload: T) => Promise<void>;

export default function eventBusService({ logger }: Cradle): EventBus {
  // eslint-disable-next-line unicorn/prefer-event-target
  const emitter = new EventEmitter({ captureRejections: true });

  emitter.setMaxListeners(100);

  emitter.on("error", (error: Error, eventName: string, payload: unknown) => {
    logger.error(`[EventBus] Handler failed: ${eventName}`, {
      error: error.message,
      payload,
    });
  });

  const on = <T = object>(eventName: string, handler: EventHandler<T>): void => {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    emitter.on(eventName, async (payload: T) => {
      try {
        await handler(payload);
      } catch (error) {
        emitter.emit("error", error as Error, eventName, payload);
      }
    });
    logger.debug(`[EventBus] Handler registered: ${eventName}`);
  };

  const emit = (eventName: string, payload: object): Promise<void> => {
    const listenersCount = emitter.listenerCount(eventName);
    logger.info(`[EventBus] Emitting: ${eventName}`, {
      handlersCount: listenersCount,
      payload,
    });

    emitter.emit(eventName, payload);
    return Promise.resolve();
  };

  const off = (eventName: string): void => {
    emitter.removeAllListeners(eventName);
    logger.debug(`[EventBus] Handlers removed: ${eventName}`);
  };

  const getEventNames = (): string[] => emitter.eventNames().map(String);

  const getHandlerCount = (eventName: string): number => emitter.listenerCount(eventName);

  return {
    emit,
    getEventNames,
    getHandlerCount,
    off,
    on,
  };
}
