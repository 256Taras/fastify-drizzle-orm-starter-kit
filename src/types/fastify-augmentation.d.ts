import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export type TransactionClient = PostgresJsDatabase<Record<string, unknown>>;

declare module "@fastify/request-context" {
  interface RequestContextData {
    CONTROLLER_KEY: AbortController | null;
    logger: import("pino").Logger;
    SIGNAL_KEY: AbortSignal | null;
    TIMEOUT_KEY: NodeJS.Timeout | null;
    traceId: string;
    TX_KEY: null | TransactionClient;
  }
}
