export const STATUS_SUCCESS = { status: true } as const;
export const STATUS_FAIL = { status: false } as const;

export const TOKENS = {
  traceId: "traceId",
  userCredentials: "userCredentials",
  userJwtData: "userJwtData",
} as const;

export const ROLES_NAMES = {
  admin: "ADMIN",
  user: "USER",
} as const;
