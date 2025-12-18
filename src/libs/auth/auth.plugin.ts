import { FastifyAuthFunction } from "@fastify/auth";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

import { AUTH_CONFIG, FASTIFY_JWT_CONFIG as jwtConfig } from "#configs/index.ts";
import type { JWTNamespace } from "#libs/auth/jwt.types.d.ts";
import { UNAUTHORIZED_ACCESS_401 } from "#libs/errors/http.errors.ts";

const ACCESS_DENIED_MESSAGE = "Access denied";

type AuthPluginOptions = {
  infra?: {
    authService?: {
      verifyJwt?: FastifyAuthFunction;
      verifyJwtRefreshToken?: FastifyAuthFunction;
    };
  };
};

/**
 * A Fastify plugin to handle JWT authentication and authorization.
 */
// eslint-disable-next-line @typescript-eslint/require-await
async function authPlugin(app: FastifyInstance, options?: AuthPluginOptions): Promise<void> {
  // Type assertion for JWT namespaces (registered by @fastify/jwt with namespace option)
  const jwt = app.jwt as unknown as JWTNamespace;

  /**
   * @throws {UNAUTHORIZED_ACCESS_401} If access token is missing or invalid
   */
  const defaultVerifyJwt = (request: FastifyRequest): void => {
    const { sessionStorageService } = app.diContainer.cradle;
    const { headers } = request;
    const accessToken = headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throw new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE);
    }

    const user = jwt.accessToken.verify(accessToken);
    sessionStorageService.setUser(user);
  };

  /**
   * @throws {UNAUTHORIZED_ACCESS_401} If refresh token is missing or invalid
   */
  const defaultVerifyJwtRefreshToken = (request: FastifyRequest): void => {
    const { sessionStorageService } = app.diContainer.cradle;
    const refreshToken = request.headers[AUTH_CONFIG.refreshTokenKey];
    if (!refreshToken) throw new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE);
    const tokenString = Array.isArray(refreshToken) ? refreshToken[0] : refreshToken;
    const data = jwt.refreshToken.verify(tokenString);
    sessionStorageService.setUserCredentials(data);
  };

  app.register(fastifyJwt, { namespace: "accessToken", secret: jwtConfig.accessTokenSecret });
  app.register(fastifyJwt, { namespace: "refreshToken", secret: jwtConfig.refreshTokenSecret });
  app.decorate("verifyJwt", options?.infra?.authService?.verifyJwt ?? defaultVerifyJwt);
  app.decorate("verifyJwtRefreshToken", options?.infra?.authService?.verifyJwtRefreshToken ?? defaultVerifyJwtRefreshToken);
}

export default fp(authPlugin);
