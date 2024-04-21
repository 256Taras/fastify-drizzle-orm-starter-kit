import { ENV_CONFIG } from "./env.config.js";

export const FASTIFY_JWT_CONFIG = {
  accessTokenSecret: ENV_CONFIG.JWT_ACCESS_TOKEN_SECRET ?? "jwt",
  accessTokenExpirationTime: ENV_CONFIG.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
  refreshTokenSecret: ENV_CONFIG.JWT_REFRESH_TOKEN_SECRET ?? "jwt",
  refreshTokenExpirationTime: ENV_CONFIG.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
  messages: {
    noAuthorizationInCookieMessage: "You are not authorized to access",
    authorizationTokenExpiredMessage: "You are not authorized to access",
    authorizationTokenInvalid: "You are not authorized to access",
    authorizationTokenUntrusted: "You are not authorized to access",
  },
};
