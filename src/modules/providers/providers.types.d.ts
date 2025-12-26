import type { Static } from "@sinclair/typebox";

import type {
  PROVIDER_CREATE_INPUT_CONTRACT,
  PROVIDER_INSERT_CONTRACT,
  PROVIDER_OUTPUT_CONTRACT,
  PROVIDER_OUTPUT_LIST,
  PROVIDER_UPDATE_INPUT_CONTRACT,
} from "./providers.contracts.ts";
import type providersMutations from "./providers.mutations.ts";
import type providersQueries from "./providers.queries.ts";
import type providersRepository from "./providers.repository.ts";

import type { User } from "#modules/users/users.contracts.ts";

export type Provider = Static<typeof PROVIDER_OUTPUT_CONTRACT>;
export type ProviderCreateInput = Static<typeof PROVIDER_CREATE_INPUT_CONTRACT>;

export interface ProviderEventPayload {
  provider: Provider;
  user: User;
}
export type ProviderInsert = Static<typeof PROVIDER_INSERT_CONTRACT>;
export type ProvidersListResponse = Static<typeof PROVIDER_OUTPUT_LIST>;

export type ProviderUpdateInput = Static<typeof PROVIDER_UPDATE_INPUT_CONTRACT>;

declare module "@fastify/awilix" {
  interface Cradle {
    providersMutations: ReturnType<typeof providersMutations>;
    providersQueries: ReturnType<typeof providersQueries>;
    providersRepository: ReturnType<typeof providersRepository>;
  }
}
