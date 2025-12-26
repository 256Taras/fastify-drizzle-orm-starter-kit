export const AUDIT_ACTION = {
  create: "create",
  update: "update",
  delete: "delete",
  login: "login",
  logout: "logout",
  password_change: "password_change",
  password_reset: "password_reset",
  verify: "verify",
  cancel: "cancel",
  confirm: "confirm",
  complete: "complete",
  pay: "pay",
  refund: "refund",
} as const;

export const ENTITY_TYPE = {
  user: "user",
  provider: "provider",
  service: "service",
  booking: "booking",
  review: "review",
  payment: "payment",
  session: "session",
} as const;
