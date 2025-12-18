import type { Cradle } from "@fastify/awilix";
import { and, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { partial } from "rambda";

import { authTokens } from "./auth-token.model.ts";

type AuthToken = InferSelectModel<typeof authTokens>;

const deleteManyAuthTokens = async ({ db }: Cradle, ppid: string, userId: string): Promise<AuthToken[]> => {
  return db
    .delete(authTokens)
    .where(and(eq(authTokens.ppid, ppid), eq(authTokens.userId, userId)))
    .returning();
};

export default function authTokenRepository(deps: Cradle) {
  return {
    deleteManyAuthTokens: partial(deleteManyAuthTokens, [deps]),
  };
}
