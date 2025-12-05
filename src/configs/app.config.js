import { ENV_CONFIG } from "./env.config.js";

export const APP_CONFIG = {
  applicationName: ENV_CONFIG.APPLICATION_NAME,
  applicationUrl: ENV_CONFIG.APPLICATION_URL,
  env: ENV_CONFIG.ENV_NAME,
  isDebug: ENV_CONFIG.ENABLE_DEBUG === 1,
  isDeveloperMessageEnabled: ENV_CONFIG.ENABLE_DEVELOPER_MESSAGE === 1,
  isEnabledDbLogging: ENV_CONFIG.ENABLE_DB_LOGGING === 1,
  isSeedsEnabled: ENV_CONFIG.ENABLE_SEEDS === 1,
  version: ENV_CONFIG.VERSION ?? "latest",
};
