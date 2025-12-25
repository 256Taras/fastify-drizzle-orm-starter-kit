import type { Cradle } from "@fastify/awilix";
import { and, eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";
import { partial } from "rambda";

import { authTokens } from "./auth-token.model.ts";

type AuthToken = InferSelectModel<typeof authTokens>;

const findOneByIdAndUserId = async ({ db }: Cradle, id: string, userId: string): Promise<AuthToken | undefined> => {
  const [token] = await db
    .select()
    .from(authTokens)
    .where(and(eq(authTokens.id, id), eq(authTokens.userId, userId)));

  return token;
};

const deleteManyAuthTokens = async ({ db }: Cradle, ppid: string, userId: string): Promise<AuthToken[]> => {
  return db
    .delete(authTokens)
    .where(and(eq(authTokens.ppid, ppid), eq(authTokens.userId, userId)))
    .returning();
};

export default function authTokenRepository(deps: Cradle) {
  return {
    deleteManyAuthTokens: partial(deleteManyAuthTokens, [deps]),
    findOneByIdAndUserId: partial(findOneByIdAndUserId, [deps]),
  };
}
