import { ENV_CONFIG } from "#configs/env.config.ts";

export const FASTIFY_RATE_LIMIT_CONFIG = {
  addHeaders: {
    "retry-after": true,
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
  addHeadersOnExceeding: {
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
  allowList: ["127.0.0.1"],
  cache: 5000,
  continueExceeding: true,
  enableDraftSpec: false,
  global: true,
  max: ENV_CONFIG.RATE_LIMIT_MAX,
  redis: null,
  skipOnError: true,
  timeWindow: ENV_CONFIG.RATE_LIMIT_TIME_WINDOW,
};
