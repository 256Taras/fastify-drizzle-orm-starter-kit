import type { Cradle } from "@fastify/awilix";
import { partial } from "rambda";

import type { Credentials } from "./auth.contracts.ts";

import { FASTIFY_JWT_CONFIG } from "#configs/index.ts";
import { authTokens } from "#modules/auth/auth-token.model.ts";
import type { User } from "#modules/users/users.contracts.ts";

const generateTokens = async ({ db, encrypterService, jwtService }: Cradle, user: User): Promise<Credentials> => {
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

export default function authTokenService(deps: Cradle) {
  return {
    generateTokens: partial(generateTokens, [deps]),
  };
}
