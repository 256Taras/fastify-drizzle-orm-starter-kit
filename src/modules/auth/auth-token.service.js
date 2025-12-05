import { partial } from "rambda";

import { FASTIFY_JWT_CONFIG } from "#configs/index.js";
import { authTokens } from "#modules/auth/auth-token.model.js";

/**
 * Generates access and refresh tokens for a user.
 * @param {import("@fastify/awilix").Cradle & {jwtService: object}} deps - The dependencies required for token generation.
 * @param {object} user - The user for whom the tokens are generated.
 * @returns {Promise<{ refreshToken: string, accessToken: string, user: object }>} An object containing the refresh token, access token, and user object.
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

/**
 * @param {Dependencies}deps
 */
export default function authTokenService(deps) {
  return {
    generateTokens: partial(generateTokens, [deps]),
  };
}
