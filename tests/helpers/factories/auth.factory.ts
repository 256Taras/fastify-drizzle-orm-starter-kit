import jwt from "fast-jwt";

import { FASTIFY_JWT_CONFIG } from "#configs/fastify-jwt.config.ts";
import type { AuthFactory, TestUser } from "#tests/helpers/types/auth.types.ts";
import { TABLE_NAMES } from "#tests/helpers/utils/db.utils.ts";

function createAuthFactory(user: TestUser, refreshTokenId: string, ppid: string): AuthFactory {
  return {
    get accessToken() {
      return getAccessTokenSigner()({ refreshTokenId, userId: user.id });
    },

    get refreshToken() {
      return getRefreshTokenSigner()({ ppid, refreshTokenId, userId: user.id });
    },

    get authTokenSeed() {
      return {
        table: TABLE_NAMES.authTokens,
        data: [{ id: refreshTokenId, ppid, userId: user.id }],
      };
    },

    get accessTokenHeader() {
      return { authorization: `Bearer ${this.accessToken}` };
    },

    get refreshTokenHeader() {
      return { "x-refresh-token": this.refreshToken };
    },
  };
}

function generatePpid(): string {
  return crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
}

function getAccessTokenSigner() {
  return jwt.createSigner({
    key: FASTIFY_JWT_CONFIG.accessTokenSecret,
    expiresIn: FASTIFY_JWT_CONFIG.accessTokenExpirationTime,
  });
}

function getRefreshTokenSigner() {
  return jwt.createSigner({
    key: FASTIFY_JWT_CONFIG.refreshTokenSecret,
    expiresIn: FASTIFY_JWT_CONFIG.refreshTokenExpirationTime,
  });
}

export const authFactory = {
  for: (user: TestUser, refreshTokenId = crypto.randomUUID(), ppid = generatePpid()) =>
    createAuthFactory(user, refreshTokenId, ppid),
};
