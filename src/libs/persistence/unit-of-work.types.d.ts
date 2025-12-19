/** @file Unit of Work type declarations */

import type unitOfWorkService from "./unit-of-work.service.ts";

declare module "@fastify/awilix" {
  interface Cradle {
    unitOfWork: ReturnType<typeof unitOfWorkService>;
  }
}
