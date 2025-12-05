import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";

import { AUTH_CONFIG, FASTIFY_JWT_CONFIG as jwtConfig } from "#configs/index.js";
import { UNAUTHORIZED_ACCESS_401 } from "#libs/errors/http.errors.js";

const ACCESS_DENIED_MESSAGE = "Access denied";

/**
 * A Fastify plugin to handle JWT authentication and authorization.
 * @type {import('fastify').FastifyPluginAsync<Record<string, *>>} app
 */
async function authPlugin(app, options) {
  /** @param {import('fastify').FastifyRequest} request - The Fastify request */
  const defaultVerifyJwt = (request) => {
    const { sessionStorageService } = app.diContainer.cradle;
    const { headers } = request;
    const accessToken = headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throw new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE);
    }

    // @ts-ignore
    const user = app.jwt.accessToken.verify(accessToken);
    sessionStorageService.setUser(user);
  };

  /** @param {import('fastify').FastifyRequest} request - The Fastify request */
  const defaultVerifyJwtRefreshToken = (request) => {
    const { sessionStorageService } = app.diContainer.cradle;
    const refreshToken = request.headers[AUTH_CONFIG.refreshTokenKey];
    if (!refreshToken) throw new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE);
    const data = app.jwt.refreshToken.verify(refreshToken);
    sessionStorageService.setUserCredentials(data);
  };

  app.register(fastifyJwt, { namespace: "accessToken", secret: jwtConfig.accessTokenSecret });
  app.register(fastifyJwt, { namespace: "refreshToken", secret: jwtConfig.refreshTokenSecret });
  app.decorate("verifyJwt", options?.infra?.authService.verifyJwt ?? defaultVerifyJwt);
  app.decorate("verifyJwtRefreshToken", options?.infra?.authService.verifyJwtRefreshToken ?? defaultVerifyJwtRefreshToken);
}

export default fp(authPlugin);
