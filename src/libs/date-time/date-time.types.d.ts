import type dateTimeService from "./date-time.service.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    dateTimeService: ReturnType<typeof dateTimeService>;
  }
}
