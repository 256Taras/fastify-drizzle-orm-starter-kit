import type { EmailService } from "./email.service.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    emailService: EmailService;
  }
}
