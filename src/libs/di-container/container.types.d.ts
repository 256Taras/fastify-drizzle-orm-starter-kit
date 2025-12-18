/** @file Dependency injection container types */

import type { schema } from "#infra/database/db-schema.ts";
import type { FastifyInstanceWithJWT } from "#libs/auth/jwt.types.d.ts";
import type emailService from "#libs/email/email.service.ts";
import type eventBusService from "#libs/events/event-bus.service.ts";
import type paginationService from "#libs/pagination/pagination.service.ts";
import type unitOfWorkService from "#libs/persistence/unit-of-work.service.ts";
import type authTokenService from "#modules/auth/auth-token.service.ts";
import type authMutations from "#modules/auth/auth.mutations.ts";
import type authRepository from "#modules/auth/auth.repository.ts";
import type usersMutations from "#modules/users/users.mutations.ts";
import type usersQueries from "#modules/users/users.queries.ts";
import type usersRepository from "#modules/users/users.repository.ts";

import type { Configs } from "#types/config.types.d.ts";

/**
 * Dependencies interface for dependency injection
 */
export interface Dependencies {
  app: FastifyInstanceWithJWT;
  authMutations: ReturnType<typeof authMutations>;
  authRepository: ReturnType<typeof authRepository>;
  authTokenService: ReturnType<typeof authTokenService>;
  configs: Configs;
  db: import("drizzle-orm/postgres-js").PostgresJsDatabase<typeof schema>;
  emailService: ReturnType<typeof emailService>;
  encrypterService: EncrypterService;
  eventBus: ReturnType<typeof eventBusService>;
  jwtService: FastifyInstanceWithJWT["jwt"];
  logger: import("pino").Logger;
  paginationService: ReturnType<typeof paginationService>;
  sessionStorageService: SessionStorageService;
  unitOfWork: ReturnType<typeof unitOfWorkService>;
  usersMutations: ReturnType<typeof usersMutations>;
  usersQueries: ReturnType<typeof usersQueries>;
  usersRepository: ReturnType<typeof usersRepository>;
}

/**
 * Encrypter Service interface
 */
export interface EncrypterService {
  /** Decode from base64 */
  base64Decode: (data: string) => string;
  /** Encode to base64 */
  base64Encode: (data: string) => string;
  /** Compare password with hash */
  compareHash: (password: string, hash: string) => Promise<boolean>;
  /** Decrypt data */
  decryptData: (data: string) => string;
  /** Encrypt data */
  encryptData: (data: string) => string;
  /** Generate UUID */
  generateUUID: (v4?: boolean) => string;
  /** Hash a password */
  getHash: (password: string) => Promise<string>;
  /** Generate random bytes */
  randomBytes: (length: number, encoding?: string) => string;
}

/**
 * Session Storage Service interface
 */
export interface SessionStorageService {
  /** Get session data */
  get: () => { id: string };
  /** Get user credentials */
  getUserCredentials: () => { ppid: string; userId: string };
  /** Set session data */
  set: (data: object) => void;
  /** Set user data */
  setUser: (user: object) => void;
  /** Set user credentials */
  setUserCredentials: (credentials: object) => void;
}
