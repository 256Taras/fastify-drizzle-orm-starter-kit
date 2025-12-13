import { and, eq } from "drizzle-orm";
import { partial } from "rambda";

import { authTokens } from "./auth-token.model.js";

/** @type {(deps: Dependencies, ppid: string, userId: string) => Promise<AuthToken[]>} */
const deleteManyAuthTokens = async ({ db }, ppid, userId) => {
  return db
    .delete(authTokens)
    .where(and(eq(authTokens.ppid, ppid), eq(authTokens.userId, userId)))
    .returning();
};

/** @param {Dependencies} deps */
export default function authTokenRepository(deps) {
  return {
    deleteManyAuthTokens: partial(deleteManyAuthTokens, [deps]),
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {import("drizzle-orm").InferSelectModel<typeof authTokens>} AuthToken */
