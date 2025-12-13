/** @file Dependency injection container types */

import emailService from "#libs/email/email.service.js";
import encrypterService from "#libs/encryption/encrypter.service.js";
import eventBusService from "#libs/events/event-bus.service.js";
import paginationService from "#libs/pagination/pagination.service.js";
import sessionStorageService from "#libs/session-storage/session-storage.service.js";
import authTokenService from "#modules/auth/auth-token.service.js";
import authMutations from "#modules/auth/auth.mutations.js";
import authRepository from "#modules/auth/auth.repository.js";
import usersMutations from "#modules/users/users.mutations.js";
import usersQueries from "#modules/users/users.queries.js";
import usersRepository from "#modules/users/users.repository.js";

/**
 * JWT Service interface
 *
 * @typedef {object} JwtService
 * @property {object} accessToken - Access token manager
 * @property {function(object, object): string} accessToken.sign - Sign access token
 * @property {function(string): Promise<object>} accessToken.verify - Verify access token
 * @property {object} refreshToken - Refresh token manager
 * @property {function(object, object): string} refreshToken.sign - Sign refresh token
 * @property {function(string): Promise<object>} refreshToken.verify - Verify refresh token
 */

/**
 * Encrypter Service interface
 *
 * @typedef {object} EncrypterService
 * @property {function(string): Promise<string>} getHash - Hash a password
 * @property {function(string, string): Promise<boolean>} compareHash - Compare password with hash
 * @property {function(number, string=): string} randomBytes - Generate random bytes
 * @property {function(boolean=): string} generateUUID - Generate UUID
 * @property {function(string): string} encryptData - Encrypt data
 * @property {function(string): string} decryptData - Decrypt data
 * @property {function(string): string} base64Encode - Encode to base64
 * @property {function(string): string} base64Decode - Decode from base64
 */

/**
 * Session Storage Service interface
 *
 * @typedef {object} SessionStorageService
 * @property {function(): {id: string}} get - Get session data
 * @property {function(object): void} set - Set session data
 * @property {function(): {ppid: string, userId: string}} getUserCredentials - Get user credentials
 * @property {function(object): void} setUserCredentials - Set user credentials
 * @property {function(object): void} setUser - Set user data
 */

/**
 * Dependencies interface for dependency injection
 *
 * @typedef {object} Dependencies
 * @property {ReturnType<typeof authMutations>} authMutations
 * @property {ReturnType<typeof authRepository>} authRepository
 * @property {ReturnType<typeof authTokenService>} authTokenService
 * @property {import("#@types/index.jsdoc.js").Configs} configs
 * @property {import("drizzle-orm/postgres-js").PostgresJsDatabase} db
 * @property {ReturnType<typeof emailService>} emailService
 * @property {EncrypterService} encrypterService
 * @property {ReturnType<typeof eventBusService>} eventBus
 * @property {JwtService} jwtService
 * @property {import("pino").Logger} logger
 * @property {ReturnType<typeof paginationService>} paginationService
 * @property {SessionStorageService} sessionStorageService
 * @property {ReturnType<typeof usersMutations>} usersMutations
 * @property {ReturnType<typeof usersQueries>} usersQueries
 * @property {ReturnType<typeof usersRepository>} usersRepository
 */

export {};
