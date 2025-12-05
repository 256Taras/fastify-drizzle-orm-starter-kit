import { APP_CONFIG } from "./app.config.js";

export const FASTIFY_RATE_LIMIT_CONFIG = {
  addHeaders: {
    "retry-after": true,
    // default show all the response headers when rate limit is reached
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
  addHeadersOnExceeding: {
    // default show all the response headers when rate limit is not reached
    "x-ratelimit-limit": true,
    "x-ratelimit-remaining": true,
    "x-ratelimit-reset": true,
  },
  allowList: ["127.0.0.1"], // default []
  ban: null, // default null
  cache: 5000, // default 5000
  continueExceeding: true, // default false
  enableDraftSpec: false, // default false. Uses IEFT draft header standard
  global: true,
  max: APP_CONFIG.RATE_LIMIT_MAX, // default 1000
  redis: null,
  skipOnError: true, // default false
  timeWindow: APP_CONFIG.RATE_LIMIT_TIME_WINDOW, // default 1000 * 60
  // example: redis: new Redis({ host: "127.0.0.1" }), // default null
  // keyGenerator: function (req) {
  //   /* ... */
  // }, // default (req) => req.raw.ip
  // errorResponseBuilder: function (req, context) {
  //   /* ... */
  // },
};
