export const TABLE_NAMES = {
  posts: "posts",
  authTokens: "auth_tokens",
  authPasswordResetTokens: "password_reset_tokens",
  users: "users",
} as const;

export type TableNames = typeof TABLE_NAMES;
