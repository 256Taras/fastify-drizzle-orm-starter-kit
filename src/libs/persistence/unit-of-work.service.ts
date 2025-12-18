import type { Cradle } from "@fastify/awilix";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { setTransactionContext } from "./transaction-context.ts";

export type UnitOfWork = {
  run: <T>(fn: () => Promise<T>) => Promise<T>;
};

type TransactionClient = PostgresJsDatabase<Record<string, unknown>>;

export default function unitOfWorkService({ db }: Cradle): UnitOfWork {
  const run = async <T>(fn: () => Promise<T>): Promise<T> => {
    return db.transaction(async (tx: TransactionClient) => {
      setTransactionContext(tx);
      try {
        return await fn();
      } finally {
        setTransactionContext(null);
      }
    });
  };

  return { run };
}
