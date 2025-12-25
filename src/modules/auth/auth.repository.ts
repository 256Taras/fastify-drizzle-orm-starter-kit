import type { Cradle } from "@fastify/awilix";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import { authPasswordResetTokens } from "./auth-password-reset-token.model.ts";
import authPasswordResetTokenRepository from "./auth-password-reset-token.repository.ts";
import { authTokens } from "./auth-token.model.ts";
import authTokenRepository from "./auth-token.repository.ts";

export type AuthToken = InferSelectModel<typeof authTokens>;
export type PasswordResetToken = InferSelectModel<typeof authPasswordResetTokens>;
export type PasswordResetTokenInsert = InferInsertModel<typeof authPasswordResetTokens>;

export default function authRepository(deps: Cradle) {
  const tokenRepo = authTokenRepository(deps);
  const passwordResetTokenRepo = authPasswordResetTokenRepository(deps);

  return {
    createOnePasswordResetToken: passwordResetTokenRepo.createOnePasswordResetToken,
    deleteManyAuthTokens: tokenRepo.deleteManyAuthTokens,
    findOnePasswordResetToken: passwordResetTokenRepo.findOnePasswordResetToken,
    updateOneTokenAsUsed: passwordResetTokenRepo.updateOneTokenAsUsed,
  };
}
