import { partial } from "rambda";

import { APP_CONFIG } from "#configs/index.js";
import { STATUS_SUCCESS } from "#libs/constants/common.constants.js";
import {
  BadRequestException,
  ConflictException,
  ResourceNotFoundException,
  UnauthorizedException,
} from "#libs/errors/domain.errors.js";

/** @type {(deps: Dependencies, input: SignUpInput) => Promise<Credentials>} */
const signUpUser = async ({ authTokenService, encrypterService, logger, usersRepository }, input) => {
  logger.debug(`[AuthMutations] Sign up user with email: ${input.email}`);

  const existingUser = await usersRepository.findOneByEmail(input.email);
  if (existingUser) {
    throw new ConflictException(`User with email: ${input.email} already registered`);
  }

  const hashedPassword = await encrypterService.getHash(input.password);

  const newUser = await usersRepository.createOne({
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    password: hashedPassword,
  });

  logger.info(`[AuthMutations] User signed up: ${newUser.id}`);

  return authTokenService.generateTokens(newUser);
};

/** @type {(deps: Dependencies, input: SignInInput) => Promise<Credentials>} */
const signInUser = async ({ authTokenService, encrypterService, logger, usersRepository }, input) => {
  logger.debug(`[AuthMutations] Sign in attempt for email: ${input.email}`);

  const user = await usersRepository.findOneByEmailWithPassword(input.email);

  if (!user) {
    throw new ResourceNotFoundException(`User with email: ${input.email} not found`);
  }

  const isPasswordValid = await encrypterService.compareHash(input.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid password");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...userWithoutPassword } = user;

  logger.info(`[AuthMutations] User signed in: ${user.id}`);

  return authTokenService.generateTokens(userWithoutPassword);
};

/**
 * @param {Dependencies} deps
 * @returns {Promise<STATUS_SUCCESS>}
 */
const signOutUser = async ({ authRepository, logger, sessionStorageService }) => {
  const { ppid, userId } = sessionStorageService.getUserCredentials();

  logger.debug(`[AuthMutations] Signing out user: ${userId}`);

  const result = await authRepository.deleteManyAuthTokens(ppid, userId);

  if (result.length === 0) {
    throw new UnauthorizedException("Failed to sign out");
  }

  logger.info(`[AuthMutations] User signed out: ${userId}`);

  return STATUS_SUCCESS;
};

/** @type {(deps: Dependencies) => Promise<Credentials>} */
const refreshUserTokens = async ({ authRepository, authTokenService, logger, sessionStorageService, usersRepository }) => {
  const { ppid, userId } = sessionStorageService.getUserCredentials();

  logger.debug(`[AuthMutations] Refreshing tokens for user: ${userId}`);

  const user = await usersRepository.findOneById(userId);

  if (!user) {
    throw new ResourceNotFoundException("User not found");
  }

  const result = await authRepository.deleteManyAuthTokens(ppid, userId);

  if (result.length === 0) {
    throw new UnauthorizedException("Failed to refresh tokens");
  }

  logger.info(`[AuthMutations] Tokens refreshed for user: ${userId}`);

  return authTokenService.generateTokens(user);
};

/** @type {(deps: Dependencies, input: ForgotPasswordInput) => Promise<STATUS_SUCCESS | {status: boolean, resetToken: string}>} */
const forgotUserPassword = async (
  { authRepository, configs, emailService, encrypterService, logger, usersRepository },
  input,
) => {
  logger.debug(`[AuthMutations] Password reset requested for email: ${input.email}`);

  const user = await usersRepository.findOneByEmail(input.email);

  if (!user) {
    logger.debug(`[AuthMutations] User with email ${input.email} not found, but returning success`);
    return STATUS_SUCCESS;
  }

  const resetToken = encrypterService.randomBytes(32);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await authRepository.createOnePasswordResetToken({
    email: input.email,
    expiresAt,
    token: resetToken,
  });

  const resetUrl = `${APP_CONFIG.applicationUrl}/auth/reset-password?token=${resetToken}`;
  await emailService.sendPasswordResetEmail({ email: input.email, resetToken, resetUrl });

  logger.info(`[AuthMutations] Password reset email sent to: ${input.email}`);

  if (configs.APP_CONFIG.isTest) {
    return { status: true, resetToken };
  }

  return STATUS_SUCCESS;
};

/** @type {(deps: Dependencies, input: ResetPasswordInput) => Promise<STATUS_SUCCESS>} */
const resetUserPassword = async ({ authRepository, encrypterService, logger, usersRepository }, input) => {
  logger.debug(`[AuthMutations] Attempting password reset with token`);

  const resetTokenRecord = await authRepository.findOnePasswordResetToken(input.token);

  if (!resetTokenRecord) {
    throw new UnauthorizedException("Invalid or already used reset token");
  }

  if (new Date() > new Date(resetTokenRecord.expiresAt)) {
    throw new UnauthorizedException("Reset token has expired");
  }

  const user = await usersRepository.findOneByEmail(resetTokenRecord.email);

  if (!user) {
    throw new ResourceNotFoundException("User not found");
  }

  const hashedPassword = await encrypterService.getHash(input.password);

  await usersRepository.updateOnePasswordById(user.id, hashedPassword);
  await authRepository.updateOneTokenAsUsed(resetTokenRecord.id);

  logger.info(`[AuthMutations] Password successfully reset for user: ${user.email}`);

  return STATUS_SUCCESS;
};

/** @type {(deps: Dependencies, input: ChangePasswordInput) => Promise<STATUS_SUCCESS>} */
const changeUserPassword = async (
  { emailService, encrypterService, logger, sessionStorageService, usersRepository },
  input,
) => {
  const { userId } = sessionStorageService.getUserCredentials();

  logger.debug(`[AuthMutations] Password change requested for user: ${userId}`);

  const user = await usersRepository.findOneByIdWithPassword(userId);

  if (!user) {
    throw new ResourceNotFoundException("User not found");
  }

  const isOldPasswordValid = await encrypterService.compareHash(input.oldPassword, user.password);

  if (!isOldPasswordValid) {
    throw new UnauthorizedException("Current password is incorrect");
  }

  const isSamePassword = await encrypterService.compareHash(input.newPassword, user.password);

  if (isSamePassword) {
    throw new BadRequestException("New password must be different from current password");
  }

  const hashedPassword = await encrypterService.getHash(input.newPassword);

  await usersRepository.updateOnePasswordById(userId, hashedPassword);
  await emailService.sendPasswordChangedEmail({ email: user.email });

  logger.info(`[AuthMutations] Password successfully changed for user: ${userId}`);

  return STATUS_SUCCESS;
};

/** @param {Dependencies} deps */
export default function authMutations(deps) {
  return {
    changeUserPassword: partial(changeUserPassword, [deps]),
    forgotUserPassword: partial(forgotUserPassword, [deps]),
    refreshUserTokens: () => refreshUserTokens(deps),
    resetUserPassword: partial(resetUserPassword, [deps]),
    signInUser: partial(signInUser, [deps]),
    signOutUser: () => signOutUser(deps),
    signUpUser: partial(signUpUser, [deps]),
  };
}

/** @typedef {import("#@types/index.jsdoc.js").Dependencies} Dependencies */
/** @typedef {import("./auth.contracts.js").Credentials} Credentials */
/** @typedef {import("./auth.contracts.js").SignInInput} SignInInput */
/** @typedef {import("./auth.contracts.js").SignUpInput} SignUpInput */
/** @typedef {import("./auth.contracts.js").ForgotPasswordInput} ForgotPasswordInput */
/** @typedef {import("./auth.contracts.js").ResetPasswordInput} ResetPasswordInput */
/** @typedef {import("./auth.contracts.js").ChangePasswordInput} ChangePasswordInput */
