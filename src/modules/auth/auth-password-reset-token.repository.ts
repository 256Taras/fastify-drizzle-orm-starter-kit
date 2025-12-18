import type { Cradle } from "@fastify/awilix";
import { and, eq, isNull } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { partial } from "rambda";

import { authPasswordResetTokens } from "./auth-password-reset-token.model.ts";

type PasswordResetToken = InferSelectModel<typeof authPasswordResetTokens>;
type PasswordResetTokenInsert = InferInsertModel<typeof authPasswordResetTokens>;

const findOnePasswordResetToken = async ({ db }: Cradle, token: string): Promise<PasswordResetToken | undefined> => {
  const [resetToken] = await db
    .select()
    .from(authPasswordResetTokens)
    .where(and(eq(authPasswordResetTokens.token, token), isNull(authPasswordResetTokens.used)));

  return resetToken;
};

const createOnePasswordResetToken = async ({ db }: Cradle, data: PasswordResetTokenInsert): Promise<PasswordResetToken> => {
  const [token] = await db.insert(authPasswordResetTokens).values(data).returning();

  return token;
};

const updateOneTokenAsUsed = async ({ db }: Cradle, tokenId: string): Promise<PasswordResetToken> => {
  const [token] = await db
    .update(authPasswordResetTokens)
    .set({ used: new Date() })
    .where(eq(authPasswordResetTokens.id, tokenId))
    .returning();

  return token;
};

export default function authPasswordResetTokenRepository(deps: Cradle) {
  return {
    createOnePasswordResetToken: partial(createOnePasswordResetToken, [deps]),
    findOnePasswordResetToken: partial(findOnePasswordResetToken, [deps]),
    updateOneTokenAsUsed: partial(updateOneTokenAsUsed, [deps]),
  };
}
