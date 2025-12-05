import { APP_CONFIG } from "#configs/app.config.js";

import { ENV_CONFIG } from "./env.config.js";

export const LOGGER_CONFIG = {
  enableColorizedPrint: ENV_CONFIG.ENABLE_COLORIZED_LOG === 1,
  enablePersistenceForceLogging: ENV_CONFIG.ENABLE_PERSISTENCE_FORCE_LOGGING === 1,
  enablePrettyPrint: ENV_CONFIG.ENABLE_PRETTY_LOG === 1,
  enableRequestLogging: true,
  enableResponseBodyLogging: APP_CONFIG.env !== "production" && ENV_CONFIG.ENABLE_RESPONSE_LOGGING_BODY === 1,
  logLevel: ENV_CONFIG.LOG_LEVEL,
};
