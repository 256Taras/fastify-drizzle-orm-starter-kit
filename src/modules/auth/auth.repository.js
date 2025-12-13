import authPasswordResetTokenRepository from "./auth-password-reset-token.repository.js";
import authTokenRepository from "./auth-token.repository.js";

/** @param {Dependencies} deps */
export default function authRepository(deps) {
  const tokenRepo = authTokenRepository(deps);
  const passwordResetTokenRepo = authPasswordResetTokenRepository(deps);

  return {
    createOnePasswordResetToken: passwordResetTokenRepo.createOnePasswordResetToken,
    deleteManyAuthTokens: tokenRepo.deleteManyAuthTokens,
    findOnePasswordResetToken: passwordResetTokenRepo.findOnePasswordResetToken,
    updateOneTokenAsUsed: passwordResetTokenRepo.updateOneTokenAsUsed,
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {typeof import("./auth-token.repository.js").default} AuthTokenRepository */
/** @typedef {typeof import("./auth-password-reset-token.repository.js").default} AuthPasswordResetTokenRepository */
