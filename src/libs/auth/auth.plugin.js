import fastifyJwt from "@fastify/jwt";
import fp from "fastify-plugin";

import { AUTH_CONFIG, FASTIFY_JWT_CONFIG as jwtConfig } from "#configs/index.js";
import { UNAUTHORIZED_ACCESS_401 } from "#libs/errors/http.errors.js";

const ACCESS_DENIED_MESSAGE = "Access denied";

/**
 * A Fastify plugin to handle JWT authentication and authorization.
 * @type {(app: import("#@types/index.jsdoc.js").FastifyInstance, options?: { infra?: { authService?: { verifyJwt?: import("#@types/fastify/auth-types.jsdoc.js").FastifyAuthFunction; verifyJwtRefreshToken?: import("#@types/fastify/auth-types.jsdoc.js").FastifyAuthFunction } } }) => Promise<void>}
 */
async function authPlugin(app, options) {
  /**
   * @param {import('fastify').FastifyRequest} request
   * @throws {UNAUTHORIZED_ACCESS_401} If access token is missing or invalid
   */
  const defaultVerifyJwt = (request) => {
    const { sessionStorageService } = app.diContainer.cradle;
    const { headers } = request;
    const accessToken = headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throw new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE);
    }

    const user = app.jwt.accessToken.verify(accessToken);
    sessionStorageService.setUser(user);
  };

  /**
   * @param {import('fastify').FastifyRequest} request
   * @throws {UNAUTHORIZED_ACCESS_401} If refresh token is missing or invalid
   */
  const defaultVerifyJwtRefreshToken = (request) => {
    const { sessionStorageService } = app.diContainer.cradle;
    const refreshToken = request.headers[AUTH_CONFIG.refreshTokenKey];
    if (!refreshToken) throw new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE);
    const data = app.jwt.refreshToken.verify(refreshToken);
    sessionStorageService.setUserCredentials(data);
  };

  app.register(fastifyJwt, { namespace: "accessToken", secret: jwtConfig.accessTokenSecret });
  app.register(fastifyJwt, { namespace: "refreshToken", secret: jwtConfig.refreshTokenSecret });
  app.decorate("verifyJwt", options?.infra?.authService?.verifyJwt ?? defaultVerifyJwt);
  app.decorate("verifyJwtRefreshToken", options?.infra?.authService?.verifyJwtRefreshToken ?? defaultVerifyJwtRefreshToken);
}

// @ts-expect-error - FastifyInstanceExtended is used for JSDoc documentation, but fp() expects base FastifyInstance type. At runtime, the instance will have all extended properties.
export default fp(authPlugin);
