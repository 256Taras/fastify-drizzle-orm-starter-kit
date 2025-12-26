/**
 * @file JWT type augmentation for @fastify/jwt
 *
 * Extends FastifyInstance with JWT namespaces using the official @fastify/jwt pattern.
 * This project uses two JWT namespaces:
 * - accessToken: For short-lived access tokens
 * - refreshToken: For long-lived refresh tokens
 */

import type { UUID } from "node:crypto";

/**
 * Access token payload type
 * Contains user identity and refresh token reference
 */
export interface AccessTokenPayload {
  refreshTokenId: UUID;
  userId: UUID;
}

/**
 * Refresh token payload type
 * Contains user identity, refresh token ID, and PPID for token rotation
 */
export interface RefreshTokenPayload {
  ppid: string;
  refreshTokenId: UUID;
  userId: UUID;
}

/**
 * Augment @fastify/jwt with custom payload types
 */
declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: AccessTokenPayload;
  }
}

/**
 * JWT namespace interface
 */
export interface JWTNamespace {
  accessToken: {
    sign: (payload: AccessTokenPayload | Record<string, unknown>, options?: { expiresIn?: string }) => string;
    verify: (token: string) => AccessTokenPayload;
  };
  refreshToken: {
    sign: (payload: Record<string, unknown> | RefreshTokenPayload, options?: { expiresIn?: string }) => string;
    verify: (token: string) => RefreshTokenPayload;
  };
}

/**
 * Augment Fastify with JWT namespaces
 *
 * This adds the following methods to FastifyInstance:
 * - jwt.accessToken.sign(payload, options)
 * - jwt.accessToken.verify(token)
 * - jwt.refreshToken.sign(payload, options)
 * - jwt.refreshToken.verify(token)
 */
declare module "fastify" {
  interface FastifyInstance {
    jwt: JWTNamespace;
  }
}
