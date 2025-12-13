import { and, eq, isNull } from "drizzle-orm";
import { partial } from "rambda";

import { authPasswordResetTokens } from "./auth-password-reset-token.model.js";

/** @type {(deps: Dependencies, token: string) => Promise<PasswordResetToken | undefined>} */
const findOnePasswordResetToken = async ({ db }, token) => {
  const [resetToken] = await db
    .select()
    .from(authPasswordResetTokens)
    .where(and(eq(authPasswordResetTokens.token, token), isNull(authPasswordResetTokens.used)));

  return resetToken;
};

/** @type {(deps: Dependencies, data: PasswordResetTokenInsert) => Promise<PasswordResetToken>} */
const createOnePasswordResetToken = async ({ db }, data) => {
  const [token] = await db.insert(authPasswordResetTokens).values(data).returning();

  return token;
};

/** @type {(deps: Dependencies, tokenId: string) => Promise<PasswordResetToken>} */
const updateOneTokenAsUsed = async ({ db }, tokenId) => {
  const [token] = await db
    .update(authPasswordResetTokens)
    .set({ used: new Date() })
    .where(eq(authPasswordResetTokens.id, tokenId))
    .returning();

  return token;
};

/** @param {Dependencies} deps */
export default function authPasswordResetTokenRepository(deps) {
  return {
    createOnePasswordResetToken: partial(createOnePasswordResetToken, [deps]),
    findOnePasswordResetToken: partial(findOnePasswordResetToken, [deps]),
    updateOneTokenAsUsed: partial(updateOneTokenAsUsed, [deps]),
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {import("drizzle-orm").InferSelectModel<typeof authPasswordResetTokens>} PasswordResetToken */
/** @typedef {import("drizzle-orm").InferInsertModel<typeof authPasswordResetTokens>} PasswordResetTokenInsert */
