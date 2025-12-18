import type { Cradle } from "@fastify/awilix";

import authPasswordResetTokenRepository from "./auth-password-reset-token.repository.ts";
import authTokenRepository from "./auth-token.repository.ts";

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
