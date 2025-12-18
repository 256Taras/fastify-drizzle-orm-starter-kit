/** @file Centralized Drizzle schema exports This is the single source of truth for database schema */

import { authPasswordResetTokens } from "#modules/auth/auth-password-reset-token.model.ts";
import { authTokens } from "#modules/auth/auth-token.model.ts";
import { users } from "#modules/users/users.model.ts";

/** Drizzle schema object containing all tables Used for type inference in both Drizzle and Kysely */
export const schema = {
  authTokens,
  authPasswordResetTokens,
  users,
};
