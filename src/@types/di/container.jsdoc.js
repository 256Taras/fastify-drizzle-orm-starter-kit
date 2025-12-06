/**
 * @file
 * Dependency injection container types
 */

import encrypterService from "#libs/services/encrypter.service.js";
import sessionStorageService from "#libs/services/session-storage.service.js";
import authTokenService from "#modules/auth/auth-token.service.js";
import authService from "#modules/auth/auth.service.js";
import usersService from "#modules/users/users.service.js";

/**
 * Dependencies interface for dependency injection
 * @typedef {object} Dependencies
 * @property {ReturnType<typeof authService>} authService
 * @property {ReturnType<typeof authTokenService>} authTokenService
 * @property {import('drizzle-orm/postgres-js').PostgresJsDatabase} db
 * @property {ReturnType<typeof encrypterService>} encrypterService
 * @property {object} jwtService - JWT service from Fastify
 * @property {import('pino').Logger} logger
 * @property {ReturnType<typeof sessionStorageService>} sessionStorageService
 * @property {ReturnType<typeof usersService>} usersService
 */

export {};
