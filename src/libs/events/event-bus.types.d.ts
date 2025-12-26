import type { EventBus } from "./event-bus.service.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    eventBus: EventBus;
  }
}
