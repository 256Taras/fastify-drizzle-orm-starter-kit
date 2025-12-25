import { TIME_IN_MILLISECONDS } from "./time.constants.ts";

export const AUTH_RATE_LIMITS = {
  forgotPassword: {
    max: 5,
    timeWindow: TIME_IN_MILLISECONDS.ONE_HOUR,
  },
  signIn: {
    max: 15,
    timeWindow: TIME_IN_MILLISECONDS.FIFTEEN_MINUTES,
  },
} as const;
