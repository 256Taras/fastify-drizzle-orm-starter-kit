import type { Static } from "@sinclair/typebox";

import type {
  SERVICE_CREATE_INPUT_CONTRACT,
  SERVICE_INSERT_CONTRACT,
  SERVICE_OUTPUT_CONTRACT,
  SERVICE_OUTPUT_LIST,
  SERVICE_STATUS,
  SERVICE_UPDATE_INPUT_CONTRACT,
} from "./services.contracts.ts";
import type servicesMutations from "./services.mutations.ts";
import type servicesQueries from "./services.queries.ts";
import type servicesRepository from "./services.repository.ts";

import type { User } from "#modules/users/users.contracts.ts";

export type Service = Static<typeof SERVICE_OUTPUT_CONTRACT>;
export type ServiceCreateInput = Static<typeof SERVICE_CREATE_INPUT_CONTRACT>;

export interface ServiceEventPayload {
  service: Service;
  user: User;
}
export type ServiceInsert = Static<typeof SERVICE_INSERT_CONTRACT>;
export type ServicesListResponse = Static<typeof SERVICE_OUTPUT_LIST>;
export type ServiceStatus = keyof typeof SERVICE_STATUS;

export type ServiceUpdateInput = Static<typeof SERVICE_UPDATE_INPUT_CONTRACT>;

declare module "@fastify/awilix" {
  interface Cradle {
    servicesMutations: ReturnType<typeof servicesMutations>;
    servicesQueries: ReturnType<typeof servicesQueries>;
    servicesRepository: ReturnType<typeof servicesRepository>;
  }
}
