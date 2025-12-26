export const TABLE_NAMES = {
  auditLogs: "audit_logs",
  authTokens: "auth_tokens",
  authPasswordResetTokens: "password_reset_tokens",
  availability: "availability",
  bookings: "bookings",
  payments: "payments",
  providers: "providers",
  reviews: "reviews",
  services: "services",
  users: "users",
} as const;

export type TableNames = typeof TABLE_NAMES;
