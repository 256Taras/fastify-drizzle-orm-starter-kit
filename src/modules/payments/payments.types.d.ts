import type { Static } from "@sinclair/typebox";

import type { PAYMENT_INSERT_CONTRACT, PAYMENT_OUTPUT_CONTRACT, PAYMENT_STATUS } from "./payments.contracts.ts";
import type paymentsMutations from "./payments.mutations.ts";
import type paymentsQueries from "./payments.queries.ts";
import type paymentsRepository from "./payments.repository.ts";

import type { User } from "#modules/users/users.contracts.ts";

export type Payment = Static<typeof PAYMENT_OUTPUT_CONTRACT>;

export interface PaymentEventPayload {
  payment: Payment;
  user: User;
}

export type PaymentInsert = Static<typeof PAYMENT_INSERT_CONTRACT>;

export type PaymentStatus = keyof typeof PAYMENT_STATUS;

declare module "@fastify/awilix" {
  interface Cradle {
    paymentsMutations: ReturnType<typeof paymentsMutations>;
    paymentsQueries: ReturnType<typeof paymentsQueries>;
    paymentsRepository: ReturnType<typeof paymentsRepository>;
  }
}
