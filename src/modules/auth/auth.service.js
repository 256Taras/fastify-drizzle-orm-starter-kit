import { partial } from "rambda";
import { and, eq } from "drizzle-orm";

import { NON_PASSWORD_COLUMNS, users } from "#modules/users/users.model.js";
import { STATUS_SUCCESS } from "#libs/common.constants.js";
import { ConflictException, ResourceNotFoundException, UnauthorizedException } from "#libs/errors/domain.errors.js";
import { authTokens } from "#modules/auth/auth-token.model.js";

/**
 * @typedef {import("./auth.contracts").Credentials} Credentials
 * @typedef {import("./auth.contracts").SignInInput} SignInInput
 * @typedef {import("./auth.contracts").SignUpInput} SignUpInput
 */

/**
 * @param {Dependencies} Deps
 * @param {SignUpInput} dto
 * @returns {Promise<Credentials>}
 */
const signUpUser = async ({ db, encrypterService, authTokenService, logger }, { firstName, lastName, email, password }) => {
  logger.debug(`Try sign up user with email: ${email}`);

  const [maybeUser] = await db.select().from(users).where(eq(users.email, email));
  if (maybeUser) throw new ConflictException(`User with email: ${email} already registered`);

  const hashedPassword = await encrypterService.getHash(password);
  const [savedUser] = await db
    .insert(users)
    .values({ firstName, lastName, email, password: hashedPassword })
    .returning(NON_PASSWORD_COLUMNS);

  return authTokenService.generateTokens({ id: savedUser.id, roles: savedUser.role });
};

/**
 * @param {Dependencies} deps
 * @param {SignInInput} dto
 * @returns {Promise<Credentials>}
 */
const signInUser = async ({ db, encrypterService, authTokenService }, { email, password }) => {
  const [maybeUser] = await db.select().from(users).where(eq(users.email, email));

  if (!maybeUser) throw new ResourceNotFoundException(`User with email: ${email} not found`);

  const isPasswordValid = await encrypterService.compareHash(password, maybeUser.password);
  if (!isPasswordValid) throw new Error("Invalid password");

  return authTokenService.generateTokens({ id: maybeUser.id, roles: maybeUser.role });
};

/**
 * @param {Dependencies} deps
 * @returns {Promise<STATUS_SUCCESS>}
 */
const logOutUser = async ({ db, logger, sessionStorageService }) => {
  const { userId, ppid } = sessionStorageService.getUserCredentials();

  logger.debug(`Logging out user: ${userId}`);
  const result = await db
    .delete(authTokens)
    .where(and(eq(authTokens.ppid, ppid), eq(authTokens.userId, userId)))
    .returning();

  if (!result) return UnauthorizedException.of("Failed to log out");

  return STATUS_SUCCESS;
};

/**
 * @param {Dependencies} deps
 * @returns {Promise<Credentials>}
 */
const refreshTokens = async ({ db, authTokenService, sessionStorageService }) => {
  const { userId, ppid } = sessionStorageService.getUserCredentials();

  const [maybeUser] = await db.select().from(users).where(eq(users.id, userId));
  if (!maybeUser) throw new Error("User not found");

  const result = await db
    .delete(authTokens)
    .where(and(eq(authTokens.ppid, ppid), eq(authTokens.userId, userId)))
    .returning();

  if (!result) return UnauthorizedException.of("Failed refresh token");

  const { refreshToken, accessToken, user } = await authTokenService.generateTokens(maybeUser);

  return { accessToken, refreshToken, user };
};

/** @param {Dependencies} deps */
export default function authService(deps) {
  return {
    signUpUser: partial(signUpUser, [deps]),
    signInUser: partial(signInUser, [deps]),
    refreshAccessToken: () => refreshTokens(deps),
    signOut: () => logOutUser(deps),
  };
}
