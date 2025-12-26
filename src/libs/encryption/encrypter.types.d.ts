import type createEncrypterService from "./encrypter.service.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    encrypterService: ReturnType<typeof createEncrypterService>;
  }
}
