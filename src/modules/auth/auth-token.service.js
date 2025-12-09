import { partial } from "rambda";

import { FASTIFY_JWT_CONFIG } from "#configs/index.js";
import { authTokens } from "#modules/auth/auth-token.model.js";

/**
 * @param {Dependencies} deps
 * @param {object} user
 * @returns {Promise<{ refreshToken: string, accessToken: string, user: object }>}
 */
const generateTokens = async ({ db, encrypterService, jwtService }, user) => {
  const refreshHash = encrypterService.randomBytes(32);
  const refreshTokenId = encrypterService.generateUUID();

  const accessToken = jwtService.accessToken.sign(
    { refreshTokenId, userId: user.id },
    { expiresIn: FASTIFY_JWT_CONFIG.accessTokenExpirationTime },
  );

  const refreshToken = jwtService.refreshToken.sign(
    { ppid: refreshHash, refreshTokenId, userId: user.id },
    { expiresIn: FASTIFY_JWT_CONFIG.refreshTokenExpirationTime },
  );

  await db.insert(authTokens).values({ id: refreshTokenId, ppid: refreshHash, userId: user.id });

  return { accessToken, refreshToken, user };
};

/** @param {Dependencies} deps */
export default function authTokenService(deps) {
  return {
    generateTokens: partial(generateTokens, [deps]),
  };
}
/**
 * @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies
 */
