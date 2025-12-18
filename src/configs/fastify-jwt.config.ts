import { ENV_CONFIG } from "./env.config.ts";

export const FASTIFY_JWT_CONFIG = {
  accessTokenExpirationTime: ENV_CONFIG.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
  accessTokenSecret: ENV_CONFIG.JWT_ACCESS_TOKEN_SECRET ?? "jwt",
  messages: {
    authorizationTokenExpiredMessage: "You are not authorized to access",
    authorizationTokenInvalid: "You are not authorized to access",
    authorizationTokenUntrusted: "You are not authorized to access",
    noAuthorizationInCookieMessage: "You are not authorized to access",
  },
  refreshTokenExpirationTime: ENV_CONFIG.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  refreshTokenSecret: ENV_CONFIG.JWT_REFRESH_TOKEN_SECRET ?? "jwt",
} as const;
