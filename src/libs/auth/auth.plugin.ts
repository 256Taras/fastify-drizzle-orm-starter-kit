import type { FastifyAuthFunction } from "@fastify/auth";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
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

declare module "fastify" {
  interface FastifyInstance {
    verifyJwt: FastifyAuthFunction;
    verifyJwtRefreshToken: FastifyAuthFunction;
  }
}

/**
 * A Fastify plugin to handle JWT authentication and authorization.
 */

async function authPlugin(app: FastifyInstance, options?: AuthPluginOptions): Promise<void> {
  // Register JWT plugins
  app.register(fastifyJwt, { namespace: "accessToken", secret: jwtConfig.accessTokenSecret });
  app.register(fastifyJwt, { namespace: "refreshToken", secret: jwtConfig.refreshTokenSecret });

  /**
   * Verifies access token and sets user in session storage.
   * Uses callback pattern required by @fastify/auth.
   */
  const defaultVerifyJwt: FastifyAuthFunction = (
    request: FastifyRequest,
    _reply: FastifyReply,
    done: (error?: Error) => void,
  ): void => {
    const { sessionStorageService } = app.diContainer.cradle;
    const jwt = app.jwt as unknown as JWTNamespace;
    const accessToken = request.headers.authorization?.split(" ")[1];

    if (!accessToken) {
      done(new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE));
      return;
    }

    try {
      const user = jwt.accessToken.verify(accessToken);
      sessionStorageService.setUser(user);
      done();
    } catch {
      done(new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE));
    }
  };

  /**
   * Verifies refresh token and sets user credentials in session storage.
   * Uses callback pattern required by @fastify/auth.
   */
  const defaultVerifyJwtRefreshToken: FastifyAuthFunction = (
    request: FastifyRequest,
    _reply: FastifyReply,
    done: (error?: Error) => void,
  ): void => {
    const { sessionStorageService } = app.diContainer.cradle;
    const jwt = app.jwt as unknown as JWTNamespace;
    const refreshToken = request.headers[AUTH_CONFIG.refreshTokenKey];

    if (!refreshToken) {
      done(new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE));
      return;
    }

    const tokenString = Array.isArray(refreshToken) ? refreshToken[0] : refreshToken;

    try {
      const data = jwt.refreshToken.verify(tokenString);
      sessionStorageService.setUserCredentials(data);
      done();
    } catch {
      done(new UNAUTHORIZED_ACCESS_401(ACCESS_DENIED_MESSAGE));
    }
  };

  app.decorate("verifyJwt", options?.infra?.authService?.verifyJwt ?? defaultVerifyJwt);
  app.decorate("verifyJwtRefreshToken", options?.infra?.authService?.verifyJwtRefreshToken ?? defaultVerifyJwtRefreshToken);
}

export default fp(authPlugin);
