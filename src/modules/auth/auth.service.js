import { and, eq } from "drizzle-orm";
import { partial } from "rambda";

import { STATUS_SUCCESS } from "#libs/constants/common.constants.js";
import { ConflictException, ResourceNotFoundException, UnauthorizedException } from "#libs/errors/domain.errors.js";
import { authTokens } from "#modules/auth/auth-token.model.js";
import { NON_PASSWORD_COLUMNS, users } from "#modules/users/users.model.js";

/** @type {SignUpUser} * */
const signUpUser = async ({ authTokenService, db, encrypterService, logger }, { email, firstName, lastName, password }) => {
  logger.debug(`Try sign up user with email: ${email}`);

  const [maybeUser] = await db.select().from(users).where(eq(users.email, email));

  if (maybeUser) throw new ConflictException(`User with email: ${email} already registered`);

  const hashedPassword = await encrypterService.getHash(password);

  const [savedUser] = await db
    .insert(users)
    .values({ email, firstName, lastName, password: hashedPassword })
    .returning(NON_PASSWORD_COLUMNS);

  return authTokenService.generateTokens(savedUser);
};

/** @type {SignInUser} * */
const signInUser = async ({ authTokenService, db, encrypterService }, { email, password }) => {
  const [maybeUser] = await db.select().from(users).where(eq(users.email, email));

  if (!maybeUser) throw new ResourceNotFoundException(`User with email: ${email} not found`);

  const isPasswordValid = await encrypterService.compareHash(password, maybeUser.password);

  if (!isPasswordValid) throw new UnauthorizedException("Invalid password");

  const [userWithoutPassword] = await db.select(NON_PASSWORD_COLUMNS).from(users).where(eq(users.id, maybeUser.id));

  return authTokenService.generateTokens(userWithoutPassword);
};

/** @type {LogOutUser} * */
const logOutUser = async ({ db, logger, sessionStorageService }) => {
  const { ppid, userId } = sessionStorageService.getUserCredentials();

  logger.debug(`Logging out user: ${userId}`);

  const result = await db
    .delete(authTokens)
    .where(and(eq(authTokens.ppid, ppid), eq(authTokens.userId, userId)))
    .returning();

  if (!result) return UnauthorizedException.of("Failed to log out");

  return STATUS_SUCCESS;
};

/** @type {RefreshTokens} * */
const refreshTokens = async ({ authTokenService, db, sessionStorageService }) => {
  const { ppid, userId } = sessionStorageService.getUserCredentials();

  const [maybeUser] = await db.select(NON_PASSWORD_COLUMNS).from(users).where(eq(users.id, userId));

  if (!maybeUser) throw new ResourceNotFoundException("User not found");

  const result = await db
    .delete(authTokens)
    .where(and(eq(authTokens.ppid, ppid), eq(authTokens.userId, userId)))
    .returning();

  if (!result) return UnauthorizedException.of("Failed refresh token");

  return authTokenService.generateTokens(maybeUser);
};

/** @param {Dependencies} deps */
export default function authService(deps) {
  return {
    refreshAccessToken: () => refreshTokens(deps),
    signInUser: partial(signInUser, [deps]),
    signOut: () => logOutUser(deps),
    signUpUser: partial(signUpUser, [deps]),
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */

/**
 * @typedef {import("./auth.contracts.js").Credentials} Credentials
 *
 * @typedef {import("./auth.contracts.js").SignInInput} SignInInput
 *
 * @typedef {import("./auth.contracts.js").SignUpInput} SignUpInput
 *
 * @typedef {function(Dependencies, SignUpInput):Promise<Credentials>} SignUpUser
 *
 * @typedef {function(Dependencies, SignInInput):Promise<Credentials>} SignInUser
 *
 * @typedef {function(Dependencies):Promise<STATUS_SUCCESS>} LogOutUser
 *
 * @typedef {function(Dependencies):Promise<Credentials>} RefreshTokens
 */
