import type sessionStorageService from "./session-storage.service.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    sessionStorageService: ReturnType<typeof sessionStorageService>;
  }
}
