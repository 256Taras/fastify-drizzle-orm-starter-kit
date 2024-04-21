import { APP_CONFIG } from "./app.config.js";

export const FASTIFY_RATE_LIMIT_CONFIG = {
  global: true,
  max: APP_CONFIG.RATE_LIMIT_MAX, // default 1000
  ban: null, // default null
  timeWindow: APP_CONFIG.RATE_LIMIT_TIME_WINDOW, // default 1000 * 60
  cache: 5000, // default 5000
  allowList: ["127.0.0.1"], // default []
  continueExceeding: true, // default false
  skipOnError: true, // default false
  enableDraftSpec: false, // default false. Uses IEFT draft header standard
  addHeadersOnExceeding: {
    // default show all the response headers when rate limit is not reached
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
  addHeaders: {
    // default show all the response headers when rate limit is reached
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
    "retry-after": true,
  },
  redis: null,
  // example: redis: new Redis({ host: "127.0.0.1" }), // default null
  // keyGenerator: function (req) {
  //   /* ... */
  // }, // default (req) => req.raw.ip
  // errorResponseBuilder: function (req, context) {
  //   /* ... */
  // },
};
