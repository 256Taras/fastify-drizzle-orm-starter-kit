import { requestContext } from "@fastify/request-context";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import "#types/fastify-augmentation.d.ts";

type TransactionClient = PostgresJsDatabase<Record<string, unknown>>;

export const TX_KEY = "TX_KEY" as const;

export function getTransactionContext(): TransactionClient | undefined {
  return requestContext.get(TX_KEY) ?? undefined;
}

export function setTransactionContext(tx: null | TransactionClient): void {
  requestContext.set(TX_KEY, tx);
}
